// Stratovac portal: AI blower assistant. The customer describes the need in plain words; Claude asks for what is
// missing, then calls find_blowers, which runs the same 60 Hz curve selection as the portal selector, server-side,
// with the customer's own discounted prices. The reply and the selector settings go back to the page.
// Secret: ANTHROPIC_API_KEY.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const DP: Record<string, number> = { inH2O: 1, psi: 27.7076, bar: 401.865, mbar: 0.401865, kPa: 4.01865, inHg: 13.5951 };
const QU: Record<string, number> = { CFM: 1, 'm3/h': 0.588578, 'L/min': 0.0353147 };
const r2 = (n: number) => Math.round(n * 100) / 100;
type Curve = [number, number][];
function lerp(c: Curve | undefined, x: number) {
  if (!c || !c.length || x < c[0][0] || x > c[c.length - 1][0]) return null;
  for (let i = 1; i < c.length; i++) if (x <= c[i][0]) { const a = c[i - 1], b = c[i]; return b[0] === a[0] ? a[1] : a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); }
  return c[c.length - 1][1];
}

const TOOL = {
  name: 'find_blowers',
  description: 'Find the ID regenerative blowers that reach a flow at a pressure or vacuum, from the 60 Hz performance curves (air, 68 °F / 20 °C, sea level). Returns the fitting models cheapest first, with the customer\'s own price, flow and power at the point, and the model pressure/vacuum limit. If no single unit fits, returns two-identical-units-in-parallel options.',
  input_schema: {
    type: 'object',
    properties: {
      mode: { type: 'string', enum: ['pressure', 'vacuum'] },
      flow: { type: 'number', description: 'required flow' },
      flow_unit: { type: 'string', enum: ['CFM', 'm3/h', 'L/min'] },
      level: { type: 'number', description: 'pressure (gauge) or vacuum level, positive number' },
      level_unit: { type: 'string', enum: ['psi', 'bar', 'mbar', 'kPa', 'inH2O', 'inHg'] },
      voltage: { type: 'string', enum: ['230/460V-3ph', '575V-3ph', '230V-1ph'], description: 'motor voltage, default 230/460V-3ph' },
    },
    required: ['mode', 'flow', 'flow_unit', 'level', 'level_unit'],
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: { user } } = await asUser.auth.getUser();
    if (!user) return json({ error: 'auth' }, 401);
    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: prof } = await db.from('profiles').select('status,is_admin,discount_pct').eq('id', user.id).single();
    if (!prof || !(prof.status === 'approved' || prof.is_admin)) return json({ error: 'not_approved' }, 403);
    const key = Deno.env.get('ANTHROPIC_API_KEY');
    if (!key) return json({ error: 'ai_unavailable' }, 503);

    const body = await req.json();
    const fr = body.lang === 'fr';
    const msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-16)
      .filter((m: { role?: string; content?: unknown }) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return json({ error: 'empty' }, 400);
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();

    const disc = Number(prof.discount_pct) || 0;
    const [{ data: prods }, { data: curves }] = await Promise.all([
      db.from('products').select('sku,kind,name_en,name_fr,specs,list_price,active').eq('active', true).eq('kind', 'blower'),
      db.from('perf_curves').select('frame,data'),
    ]);
    const CV = new Map((curves ?? []).map((c) => [c.frame, c.data]));
    let lastSel: Record<string, unknown> | null = null;

    function find(a: Record<string, unknown>) {
      const press = a.mode !== 'vacuum';
      const fu = String(a.flow_unit), lu = String(a.level_unit);
      const Q = Number(a.flow) * (QU[fu] ?? 1), dp = Number(a.level) * (DP[lu] ?? 1);
      const v = a.voltage === '575V-3ph' ? '5' : a.voltage === '230V-1ph' ? '3' : '6';
      if (!(Q > 0) || !(dp >= 0)) return { error: 'invalid flow or level' };
      lastSel = { mode: press ? 'press' : 'vac', q: String(a.flow), qu: fu === 'm3/h' ? 'm³/h' : fu, dp: String(a.level), du: lu, v };
      const fit: Record<string, unknown>[] = [], pair: Record<string, unknown>[] = [];
      for (const p of prods ?? []) {
        const s = p.specs || {}, pf = s.perf;
        if (!pf || p.sku.slice(-1) !== v || p.list_price == null) continue;
        const cv = CV.get(pf.frame); if (!cv) continue;
        const lim = press ? pf.max_p : pf.max_v; if (!lim || dp > lim) continue;
        const qa = lerp(press ? cv.flow_press : cv.flow_vac, dp); if (qa == null) continue;
        const hp = lerp(press ? cv.power_press : cv.power_vac, dp);
        const row = {
          model: p.sku, stages: s.stages, double_flow: !!s.double_flow, motor_kw: s.kw, motor_hp: s.hp, port: s.port,
          price_usd: r2(Number(p.list_price) * (1 - disc / 100)),
          flow_at_point_cfm: Math.round(qa), flow_at_point_m3h: Math.round(qa / 0.588578),
          power_at_point_kw: hp != null ? r2(hp * 0.7457) : null,
          model_limit_psi: r2(lim / DP.psi), model_limit_bar: r2(lim / DP.bar), limit_estimated: !!pf.est,
        };
        if (qa >= Q) fit.push(row); else if (qa * 2 >= Q) pair.push(row);
      }
      const byPrice = (x: Record<string, unknown>, y: Record<string, unknown>) => Number(x.price_usd) - Number(y.price_usd);
      fit.sort(byPrice); pair.sort(byPrice);
      return {
        point: { cfm: Math.round(Q), m3h: Math.round(Q / 0.588578), psi: r2(dp / DP.psi), bar: r2(dp / DP.bar), mode: press ? 'pressure' : 'vacuum', voltage: v },
        fitting_count: fit.length, fitting_cheapest_first: fit.slice(0, 6),
        two_units_in_parallel: fit.length ? [] : pair.slice(0, 3),
      };
    }

    const system = `You are the blower selection assistant on the Stratovac customer portal (Stratovac, part of ID Industries, Longueuil, Quebec). You help approved industrial customers choose an ID regenerative (side-channel) blower.
Answer in ${fr ? 'French (Quebec business tone, vouvoiement)' : 'English'}, unless the customer writes in the other language. Be brief and practical: a few short sentences or a short list.
How to work:
- To recommend a model you need the use (pressure or vacuum), the flow and the pressure or vacuum level. If one is missing, ask for it in one short question. Assume 230/460 V three-phase unless told otherwise.
- Always call find_blowers to get models and prices. Never invent a model, a price or a performance figure, and only cite models the tool returned.
- Recommend the cheapest fitting model first and say why it fits (flow at the point and margin). Mention one alternative when useful (more margin, fewer stages).
- Give every flow in both CFM and m3/h, and every pressure or vacuum in both psi and bar.
- Prices are in US dollars and already include the customer's discount. Freight is not included.
- The curves are for air at 68 °F (20 °C) at sea level, 60 Hz, ±10 % tolerance. For another gas, altitude, hot inlet air or a point near a model's limit, say the selection must be confirmed by Stratovac (abruens@stratovac.ca).
- For vacuum service suggest the matching inlet filter and vacuum relief valve; for pressure, the inlet filter-silencer and pressure relief valve. The customer adds the blower with the Add button, which proposes them.
- Do not mention other manufacturers or their model numbers, and do not give maintenance intervals. For delivery times, custom builds or anything outside blower selection, refer to abruens@stratovac.ca.`;

    const convo: unknown[] = [...msgs];
    let reply = '';
    for (let turn = 0; turn < 4; turn++) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 1200, system, tools: [TOOL], messages: convo }),
      });
      const out = await r.json().catch(() => ({}));
      if (!r.ok) return json({ error: 'ai', detail: out?.error?.message ?? r.status }, 502);
      const content = out.content ?? [];
      reply = content.filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text).join('\n').trim();
      const uses = content.filter((c: { type: string }) => c.type === 'tool_use');
      if (out.stop_reason !== 'tool_use' || !uses.length) break;
      convo.push({ role: 'assistant', content });
      convo.push({ role: 'user', content: uses.map((u: { id: string; input: Record<string, unknown> }) => ({ type: 'tool_result', tool_use_id: u.id, content: JSON.stringify(find(u.input)) })) });
    }
    return json({ reply: reply || (fr ? 'Pouvez-vous préciser le débit et la pression (ou le vide) voulus ?' : 'Could you give the flow and the pressure (or vacuum) you need?'), selector: lastSel });
  } catch (_e) {
    return json({ error: 'server' }, 500);
  }
});
