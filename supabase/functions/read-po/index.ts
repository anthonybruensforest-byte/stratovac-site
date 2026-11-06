// Stratovac portal: read a customer's purchase order (PDF or image) with Claude and turn it into cart lines.
// The file is in the private 'po-uploads' bucket under <user_id>/. Prices are NOT taken from the PO:
// the cart is priced later by place-order from the products table and the customer's discount.
// Secret: ANTHROPIC_API_KEY (Supabase > Edge Functions > Secrets).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const MIME: Record<string, string> = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };

function b64(buf: ArrayBuffer) {
  const u = new Uint8Array(buf); let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
}

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

    const { path } = await req.json();
    if (typeof path !== 'string' || !path.startsWith(user.id + '/')) return json({ error: 'path' }, 400);
    const ext = path.split('.').pop()!.toLowerCase();
    const mime = MIME[ext];
    if (!mime) return json({ error: 'type' }, 400);
    const { data: file, error: fe } = await db.storage.from('po-uploads').download(path);
    if (fe || !file) return json({ error: 'file' }, 404);
    if (file.size > 15 * 1024 * 1024) return json({ error: 'size' }, 413);
    const data = b64(await file.arrayBuffer());

    const { data: prods } = await db.from('products').select('sku,kind,name_en,specs').eq('active', true);
    const catalog = (prods ?? []).map((p) => {
      const s = p.specs || {};
      return p.kind === 'blower'
        ? `${p.sku} | ${p.name_en} | ${s.cfm} CFM ${s.m3h} m3/h | ${s.hp} HP ${s.kw} kW | ${s.volt} V | ${s.stages} stage${s.double_flow ? ' double flow' : ''}`
        : `${p.sku} | ${p.name_en} | ${s.port ?? ''}`;
    }).join('\n');

    const prompt = `You read a customer's purchase order sent to Stratovac / ID Industries (industrial regenerative blowers and accessories).
Return ONLY a JSON object, no prose, with this shape:
{"po_number": string|null, "po_date": string|null, "buyer_company": string|null,
 "ship_to": {"name": string|null, "company": string|null, "address": string|null, "city": string|null, "province": string|null, "postal": string|null, "country": "CA"|"US"|null, "phone": string|null},
 "lines": [{"raw": string, "qty": number, "sku": string|null, "mode": "vacuum"|"pressure"|null, "po_unit_price": number|null, "confidence": "high"|"low"}],
 "notes": string|null}
Rules:
- One entry in "lines" per ordered item on the PO. "raw" is the item text as written (part number + description).
- "sku": the exact matching code from the CATALOG below when the PO names it or clearly describes it; otherwise null. Never invent a code. Use "low" confidence when you inferred it from a description.
- If the PO gives a model number that is not in the catalog (for example another manufacturer's model), keep it in "raw" and set "sku" to null.
- "mode": vacuum or pressure only if the PO says so.
- province: 2-letter code (QC, ON, ...) when in Canada; country: CA or US.
CATALOG (code | description):
${catalog}`;

    const block = mime === 'application/pdf'
      ? { type: 'document', source: { type: 'base64', media_type: mime, data } }
      : { type: 'image', source: { type: 'base64', media_type: mime, data } };
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 3000, messages: [{ role: 'user', content: [block, { type: 'text', text: prompt }] }] }),
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: 'ai', detail: out?.error?.message ?? r.status }, 502);
    const text = (out.content ?? []).map((c: { text?: string }) => c.text ?? '').join('');
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return json({ error: 'parse' }, 502);
    const po = JSON.parse(m[0]);

    // Map other manufacturers' model numbers through the private cross-reference table
    const skus = new Set((prods ?? []).map((p) => p.sku));
    const { data: xr } = await db.from('xref').select('ext_key,id_base');
    const X = new Map((xr ?? []).map((x) => [x.ext_key, x.id_base]));
    for (const l of po.lines ?? []) {
      l.qty = Math.max(1, Math.min(50, Math.round(Number(l.qty) || 1)));
      if (l.sku && !skus.has(l.sku)) l.sku = null;
      if (!l.sku) {
        const t = String(l.raw ?? '').toUpperCase().replace(/\s+/g, '');
        const mm = t.match(/3BA(\d{4})-?(\d)A([TS])(\d)(\d)(Z?)/);
        if (mm) {
          const base = X.get(`${mm[1]}-${mm[2]}A${mm[3]}${mm[4]}`);
          const suf = mm[3] === 'S' || mm[6] ? '3' : mm[5] === '5' ? '5' : '6';
          if (base && skus.has(`${base}-${suf}`)) { l.sku = `${base}-${suf}`; l.confidence = 'high'; l.xref = true; }
        }
      }
    }
    return json({ po });
  } catch (_e) {
    return json({ error: 'server' }, 500);
  }
});
