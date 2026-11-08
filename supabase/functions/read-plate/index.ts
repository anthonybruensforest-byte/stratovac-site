// Stratovac portal: read the nameplate of a customer's existing blower (photo) so the assistant can propose
// the equivalent ID model. The manufacturer and model are returned for the customer's eyes only; the assistant
// is never given them. Secret: ANTHROPIC_API_KEY.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: { user } } = await asUser.auth.getUser();
    if (!user) return json({ error: 'auth' }, 401);
    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: prof } = await db.from('profiles').select('status,is_admin').eq('id', user.id).single();
    if (!prof || !(prof.status === 'approved' || prof.is_admin)) return json({ error: 'not_approved' }, 403);
    const key = Deno.env.get('ANTHROPIC_API_KEY');
    if (!key) return json({ error: 'ai_unavailable' }, 503);
    if (!prof.is_admin) {
      const hour = new Date(Date.now() - 3600e3).toISOString();
      const { count } = await db.from('ai_usage').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('fn', 'plate').gte('at', hour);
      if ((count ?? 0) >= 15) return json({ error: 'limit' }, 429);
    }
    await db.from('ai_usage').insert({ user_id: user.id, fn: 'plate' });

    const { image, mime } = await req.json();
    const mt = String(mime ?? '').toLowerCase();
    if (typeof image !== 'string' || !image || image.length > 7_000_000 || !MIME.has(mt)) return json({ error: 'image' }, 400);

    const prompt = `This photo should show the nameplate (rating plate) of an industrial blower, vacuum pump or its electric motor. Read it.
Return ONLY a JSON object, no prose:
{"readable": boolean, "kind": "regenerative_blower"|"other_blower"|"vacuum_pump"|"motor_only"|"unknown",
 "manufacturer": string|null, "model": string|null,
 "power_kw": number|null, "power_hp": number|null, "voltage": string|null, "phase": 1|3|null, "hz": 50|60|null, "rpm": number|null, "amps": string|null,
 "max_flow": number|null, "max_flow_unit": "CFM"|"m3/h"|"m3/min"|"L/min"|null,
 "max_pressure": number|null, "max_vacuum": number|null, "level_unit": "psi"|"bar"|"mbar"|"kPa"|"inH2O"|"inHg"|"hPa"|null,
 "stages": number|null, "notes": string|null}
Rules: copy values exactly as printed; use null when a value is not on the plate; give a vacuum as a positive number; if several frequencies are printed, use the 60 Hz values. "readable" is false if the photo is not a nameplate or is too blurry.`;
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: AbortSignal.timeout(40000),
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 700, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mt, data: image } }, { type: 'text', text: prompt }] }] }),
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: 'ai' }, 502);
    const text = (out.content ?? []).map((c: { text?: string }) => c.text ?? '').join('');
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return json({ error: 'parse' }, 502);
    return json({ plate: JSON.parse(m[0]) });
  } catch (e) {
    console.error('read-plate', e);
    return json({ error: 'server' }, 500);
  }
});
