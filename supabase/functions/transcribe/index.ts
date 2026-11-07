// Stratovac portal: turn a short voice question (recorded in the browser) into text for the assistant.
// Uses the Gemini API. Secret: GEMINI_API_KEY (Google AI Studio key). Optional: GEMINI_STT_MODEL.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const MIME: Record<string, string> = { 'audio/webm': 'audio/webm', 'audio/ogg': 'audio/ogg', 'audio/mp4': 'audio/m4a', 'audio/x-m4a': 'audio/m4a', 'audio/m4a': 'audio/m4a', 'audio/wav': 'audio/wav', 'audio/mpeg': 'audio/mp3' };

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
    const key = Deno.env.get('GEMINI_API_KEY');
    if (!key) return json({ error: 'stt_unavailable' }, 503);

    const { audio, mime, lang } = await req.json();
    if (typeof audio !== 'string' || !audio || audio.length > 3_500_000) return json({ error: 'audio' }, 400);
    const mt = MIME[String(mime ?? '').split(';')[0].trim().toLowerCase()] ?? 'audio/webm';
    const fr = lang === 'fr';
    const prompt = `Transcribe this short spoken question from a customer of an industrial blower supplier. The speaker most likely speaks ${fr ? 'Quebec French' : 'English'} (possibly mixing French and English). Return ONLY the transcript, no quotes or comments. Write numbers as digits and units as symbols (CFM, m3/h, psi, bar, mbar, inHg, kPa, HP, kW, V). If there is no intelligible speech, return an empty string.`;
    const model = Deno.env.get('GEMINI_STT_MODEL') || 'gemini-2.5-flash';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ inline_data: { mime_type: mt, data: audio } }, { text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 400, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: 'stt', detail: out?.error?.message ?? r.status }, 502);
    const text = (out.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('').trim().replace(/^["«]|["»]$/g, '');
    return json({ text: text.slice(0, 2000) });
  } catch (_e) {
    return json({ error: 'server' }, 500);
  }
});
