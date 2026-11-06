-- Stratovac customer portal: schema + row-level security.
-- Run once in Supabase > SQL Editor. Product prices are loaded separately (never committed to this public repo).

-- ---------- profiles ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  email        text,
  full_name    text,
  company      text,
  phone        text,
  country      text default 'CA',
  province     text,
  address      text,
  city         text,
  postal       text,
  lang         text default 'fr',
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  discount_pct numeric(5,2) not null default 0 check (discount_pct >= 0 and discount_pct <= 90),
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  approved_at  timestamptz
);
alter table public.profiles enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;
create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select status = 'approved' or is_admin from public.profiles where id = auth.uid()), false);
$$;

-- new auth user -> pending profile (details come from the sign-up form metadata)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, company, phone, country, province, address, city, postal, lang)
  values (new.id, new.email,
    new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'company', new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'country','CA'), new.raw_user_meta_data->>'province',
    new.raw_user_meta_data->>'address', new.raw_user_meta_data->>'city', new.raw_user_meta_data->>'postal',
    coalesce(new.raw_user_meta_data->>'lang','fr'))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- customers may edit their contact details, never their status, discount or admin flag
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for the SQL editor and the service role (server functions): those are trusted
  if auth.uid() is not null and not public.is_admin() then
    new.status := old.status; new.discount_pct := old.discount_pct; new.is_admin := old.is_admin;
    new.approved_at := old.approved_at; new.email := old.email;
  elsif new.status = 'approved' and old.status <> 'approved' then
    new.approved_at := now();
  end if;
  return new;
end $$;
drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile before update on public.profiles for each row execute function public.protect_profile();

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles update own or admin" on public.profiles;
create policy "profiles update own or admin" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- ---------- products (prices visible to approved customers only) ----------
create table if not exists public.products (
  sku        text primary key,
  kind       text not null check (kind in ('blower','vacuum_filter','pressure_filter','vacuum_valve','pressure_valve','cartridge')),
  family     text,
  name_en    text not null,
  name_fr    text not null,
  specs      jsonb not null default '{}'::jsonb,
  acc        jsonb not null default '{}'::jsonb,   -- {vac_filter, vac_valve, press_filter, press_valve, cartridge}
  list_price numeric(10,2),                        -- USD list price; null = price on request
  datasheet  text,                                 -- path in the private 'datasheets' storage bucket
  sort       int not null default 0,
  active     boolean not null default true
);
alter table public.products enable row level security;
drop policy if exists "products approved read" on public.products;
create policy "products approved read" on public.products for select using (public.is_approved() and active);
drop policy if exists "products admin all" on public.products;
create policy "products admin all" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- ---------- orders (written only by the place-order / confirm-payment functions) ----------
create table if not exists public.orders (
  id           bigserial primary key,
  user_id      uuid references public.profiles(id) on delete set null,  -- kept when a customer is deleted
  created_at   timestamptz not null default now(),
  status       text not null check (status in ('invoice_requested','awaiting_payment','paid','processing','shipped','cancelled')),
  pay_method   text not null check (pay_method in ('card','invoice')),
  currency     text not null default 'USD',
  discount_pct numeric(5,2) not null default 0,
  items        jsonb not null,
  subtotal     numeric(12,2) not null,
  taxes        jsonb not null default '[]'::jsonb,
  total        numeric(12,2) not null,
  ship         jsonb not null default '{}'::jsonb,
  po_number    text,
  note         text,
  helcim_txn   text,
  paid_at      timestamptz
);
alter table public.orders enable row level security;
drop policy if exists "orders read own or admin" on public.orders;
create policy "orders read own or admin" on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update using (public.is_admin());

-- Helcim secret tokens: no client access at all (service role only)
create table if not exists public.order_secrets (
  order_id       bigint primary key references public.orders(id) on delete cascade,
  checkout_token text,
  secret_token   text
);
alter table public.order_secrets enable row level security;

-- ---------- private datasheet bucket: approved customers can read ----------
insert into storage.buckets (id, name, public) values ('datasheets','datasheets', false) on conflict (id) do nothing;
drop policy if exists "datasheets approved read" on storage.objects;
create policy "datasheets approved read" on storage.objects for select using (bucket_id = 'datasheets' and public.is_approved());
drop policy if exists "datasheets admin write" on storage.objects;
create policy "datasheets admin write" on storage.objects for all using (bucket_id = 'datasheets' and public.is_admin()) with check (bucket_id = 'datasheets' and public.is_admin());

-- After your own account is created on the portal, make it the admin (replace the email):
-- update public.profiles set is_admin = true, status = 'approved' where email = 'abruens@stratovac.ca';

-- ---------- 60 Hz performance curves per blower frame (selector) ----------
-- data: {flow_press:[[inH2O,CFM]...], flow_vac:[...], power_press:[[inH2O,HP]...], power_vac:[...]}
create table if not exists public.perf_curves (frame text primary key, data jsonb not null);
alter table public.perf_curves enable row level security;
drop policy if exists "curves approved read" on public.perf_curves;
create policy "curves approved read" on public.perf_curves for select using (public.is_approved());
drop policy if exists "curves admin all" on public.perf_curves;
create policy "curves admin all" on public.perf_curves for all using (public.is_admin()) with check (public.is_admin());

-- ---------- customer purchase orders dropped on the portal ----------
alter table public.orders add column if not exists po_file text;
insert into storage.buckets (id, name, public) values ('po-uploads','po-uploads', false) on conflict (id) do nothing;
drop policy if exists "po upload own" on storage.objects;
create policy "po upload own" on storage.objects for insert with check (bucket_id = 'po-uploads' and public.is_approved() and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "po read own or admin" on storage.objects;
create policy "po read own or admin" on storage.objects for select using (bucket_id = 'po-uploads' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
-- other manufacturers' model -> ID model base; server-side only (no client policy)
create table if not exists public.xref (ext_key text primary key, id_base text not null);
alter table public.xref enable row level security;
