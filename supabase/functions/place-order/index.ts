// Stratovac portal: create an order from the customer's cart.
// Prices are always recomputed here from the products table and the customer's discount; the browser never sets a price.
// pay_method 'invoice' -> order recorded, Stratovac invoices later.
// pay_method 'card'    -> order recorded + HelcimPay.js checkout (USD) initialized; confirm-payment marks it paid.
// Secrets: HELCIM_API_TOKEN (set in Supabase > Edge Functions > Secrets). SUPABASE_* are provided automatically.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const TAX: Record<string, [string, number][]> = {
  QC: [['TPS/GST', 5], ['TVQ/QST', 9.975]], ON: [['TVH/HST', 13]], NB: [['TVH/HST', 15]], NL: [['TVH/HST', 15]], PE: [['TVH/HST', 15]],
  NS: [['TVH/HST', 14]], BC: [['TPS/GST', 5]], AB: [['TPS/GST', 5]], SK: [['TPS/GST', 5]], MB: [['TPS/GST', 5]], YT: [['TPS/GST', 5]],
  NT: [['TPS/GST', 5]], NU: [['TPS/GST', 5]],
};
const r2 = (n: number) => Math.round(n * 100) / 100;
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const clean = (v: unknown, n = 200) => String(v ?? '').trim().slice(0, n);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const auth = req.headers.get('Authorization') ?? '';
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await asUser.auth.getUser();
    if (!user) return json({ error: 'auth' }, 401);
    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: prof } = await db.from('profiles').select('*').eq('id', user.id).single();
    if (!prof || !(prof.status === 'approved' || prof.is_admin)) return json({ error: 'not_approved' }, 403);

    const body = await req.json();
    const method = body.pay_method === 'card' ? 'card' : 'invoice';
    const lines = (Array.isArray(body.items) ? body.items : []).slice(0, 60)
      .map((l: { sku: unknown; qty: unknown; mode?: unknown }) => ({ sku: clean(l.sku, 40), qty: Math.max(1, Math.min(50, Math.floor(Number(l.qty) || 0))), mode: clean(l.mode, 10) }))
      .filter((l: { sku: string }) => l.sku);
    if (!lines.length) return json({ error: 'empty' }, 400);

    const { data: prods } = await db.from('products').select('sku,kind,name_en,name_fr,list_price,active').in('sku', lines.map((l: { sku: string }) => l.sku));
    const P = new Map((prods ?? []).map((p) => [p.sku, p]));
    const disc = Number(prof.discount_pct) || 0;
    const items = [];
    for (const l of lines) {
      const p = P.get(l.sku);
      if (!p || !p.active || p.list_price == null) return json({ error: 'unavailable', sku: l.sku }, 400);
      const unit = r2(Number(p.list_price) * (1 - disc / 100));
      items.push({ sku: p.sku, kind: p.kind, name_en: p.name_en, name_fr: p.name_fr, mode: l.mode || null, qty: l.qty, list_price: Number(p.list_price), unit_price: unit, line_total: r2(unit * l.qty) });
    }
    const subtotal = r2(items.reduce((s, i) => s + i.line_total, 0));

    const s = body.ship ?? {};
    const ship = { name: clean(s.name), company: clean(s.company), phone: clean(s.phone, 40), address: clean(s.address), city: clean(s.city, 80), province: clean(s.province, 10).toUpperCase(), postal: clean(s.postal, 20), country: clean(s.country, 2).toUpperCase() || 'CA' };
    if (!ship.name || !ship.address || !ship.city || !ship.postal) return json({ error: 'ship' }, 400);
    const taxes = ship.country === 'CA' ? (TAX[ship.province] ?? []).map(([n, pct]) => ({ name: n, pct, amount: r2(subtotal * pct / 100) })) : [];
    if (ship.country === 'CA' && !TAX[ship.province]) return json({ error: 'province' }, 400);
    const total = r2(subtotal + taxes.reduce((a, t) => a + t.amount, 0));

    const poFile = typeof body.po_file === 'string' && body.po_file.startsWith(user.id + '/') ? body.po_file.slice(0, 300) : null;
    const { data: order, error } = await db.from('orders').insert({
      user_id: user.id, status: method === 'card' ? 'awaiting_payment' : 'invoice_requested', pay_method: method, currency: 'USD',
      discount_pct: disc, items, subtotal, taxes, total, ship, po_number: clean(body.po_number, 60) || null, note: clean(body.note, 1000) || null, po_file: poFile,
    }).select('id,total,status').single();
    if (error || !order) return json({ error: 'db' }, 500);

    if (method === 'invoice') return json({ order_id: order.id, total, status: order.status });

    const token = Deno.env.get('HELCIM_API_TOKEN');
    if (!token) return json({ error: 'card_unavailable', order_id: order.id }, 503);
    const h = await fetch('https://api.helcim.com/v2/helcim-pay/initialize', {
      method: 'POST',
      headers: { 'api-token': token, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ paymentType: 'purchase', amount: total, currency: 'USD', invoiceNumber: `SV-${order.id}` }),
    });
    const hd = await h.json().catch(() => ({}));
    if (!h.ok || !hd.checkoutToken) return json({ error: 'helcim', order_id: order.id }, 502);
    await db.from('order_secrets').insert({ order_id: order.id, checkout_token: hd.checkoutToken, secret_token: hd.secretToken });
    return json({ order_id: order.id, total, status: order.status, checkoutToken: hd.checkoutToken });
  } catch (_e) {
    return json({ error: 'server' }, 500);
  }
});
