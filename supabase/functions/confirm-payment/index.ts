// Stratovac portal: after HelcimPay.js reports SUCCESS, verify the transaction with Helcim's API
// (approved, USD, same amount) before marking the order paid. The browser's word alone is never trusted.
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

    const { order_id, transaction_id } = await req.json();
    const { data: order } = await db.from('orders').select('id,user_id,total,status').eq('id', Number(order_id)).single();
    if (!order || order.user_id !== user.id) return json({ error: 'order' }, 404);
    if (order.status === 'paid') return json({ status: 'paid' });

    const t = await fetch(`https://api.helcim.com/v2/card-transactions/${encodeURIComponent(String(transaction_id))}`, {
      headers: { 'api-token': Deno.env.get('HELCIM_API_TOKEN')!, accept: 'application/json' },
    });
    const tx = await t.json().catch(() => ({}));
    const ok = t.ok && String(tx.status).toUpperCase() === 'APPROVED' && String(tx.currency ?? 'USD').toUpperCase() === 'USD'
      && Math.abs(Number(tx.amount) - Number(order.total)) < 0.01;
    if (!ok) return json({ error: 'not_verified' }, 400);

    await db.from('orders').update({ status: 'paid', helcim_txn: String(transaction_id), paid_at: new Date().toISOString() }).eq('id', order.id);
    return json({ status: 'paid' });
  } catch (_e) {
    return json({ error: 'server' }, 500);
  }
});
