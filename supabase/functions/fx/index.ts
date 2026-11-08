// Stratovac portal: daily USD -> CAD rate from the Bank of Canada (Valet API), cached in fx_rate for 12 h.
// Used only to show indicative CAD amounts next to USD prices.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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
    const { data: row } = await db.from('fx_rate').select('*').eq('id', 1).maybeSingle();
    if (row && row.rate && row.fetched_at && Date.now() - new Date(row.fetched_at).getTime() < 12 * 3600e3) return json({ rate: Number(row.rate), date: row.obs_date });
    const r = await fetch('https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1', { signal: AbortSignal.timeout(10000) });
    const d = await r.json().catch(() => ({}));
    const ob = d?.observations?.[0];
    const rate = Number(ob?.FXUSDCAD?.v);
    if (!r.ok || !(rate > 0.5 && rate < 3)) return row?.rate ? json({ rate: Number(row.rate), date: row.obs_date, stale: true }) : json({ error: 'fx' }, 502);
    await db.from('fx_rate').upsert({ id: 1, rate, obs_date: ob.d, fetched_at: new Date().toISOString() });
    return json({ rate, date: ob.d });
  } catch (e) {
    console.error('fx', e);
    return json({ error: 'server' }, 500);
  }
});
