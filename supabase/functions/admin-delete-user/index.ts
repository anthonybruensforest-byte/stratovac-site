// Stratovac portal: an admin deletes a customer account (login + profile).
// The customer's past orders are kept (user_id set to null) so order history and accounting stay intact.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: { user } } = await asUser.auth.getUser();
    if (!user) return json({ error: 'auth' }, 401);
    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: me } = await db.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!me?.is_admin) return json({ error: 'forbidden' }, 403);

    const { user_id } = await req.json();
    if (!user_id || user_id === user.id) return json({ error: 'bad_user' }, 400);
    const { data: target } = await db.from('profiles').select('is_admin').eq('id', user_id).single();
    if (target?.is_admin) return json({ error: 'is_admin' }, 400);

    const { error } = await db.auth.admin.deleteUser(String(user_id));
    if (error) return json({ error: 'delete_failed' }, 500);
    return json({ deleted: true });
  } catch (_e) {
    return json({ error: 'server' }, 500);
  }
});
