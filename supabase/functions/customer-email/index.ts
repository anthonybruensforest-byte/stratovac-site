// Stratovac portal: emails to the customer (order confirmation, account approved, order shipped) through Resend.
// kind 'order'    : the customer (or admin) asks for the confirmation of one of their orders.
// kind 'approved' : admin only, after approving an account.
// kind 'shipped'  : admin only, after marking an order shipped (with its tracking number).
// Secrets: RESEND_API_KEY; optional RESEND_FROM (default "Stratovac <commandes@stratovac.ca>", domain verified in Resend).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const PORTAL = { fr: 'https://stratovac.ca/fr/portail/', en: 'https://stratovac.ca/portal/' };

function money(n: number, fr: boolean) {
  return fr ? n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $ US' : 'US$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function frame(title: string, inner: string, fr: boolean) {
  return `<!doctype html><html><body style="margin:0;background:#f3f5f8;font-family:Arial,Helvetica,sans-serif;color:#15202b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden">
<tr><td style="background:#0b1a2e;padding:18px 24px"><img src="https://stratovac.ca/assets/img/stratovac-logo-light.png" alt="Stratovac" height="34" style="display:block;height:34px"></td></tr>
<tr><td style="padding:24px"><h1 style="font-size:20px;margin:0 0 14px">${esc(title)}</h1>${inner}</td></tr>
<tr><td style="padding:16px 24px;background:#f7f9fb;font-size:12px;color:#5b6673">Stratovac · ${fr ? 'Part of ID Industries' : 'Part of ID Industries'} · 1396 des Mouettes, Longueuil (QC) J4J 5K2 · +1 438-880-4655 · <a href="mailto:abruens@stratovac.ca" style="color:#1e6fd9">abruens@stratovac.ca</a></td></tr>
</table></td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: { user } } = await asUser.auth.getUser();
    if (!user) return json({ error: 'auth' }, 401);
    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: me } = await db.from('profiles').select('is_admin').eq('id', user.id).single();
    const admin = !!me?.is_admin;
    const key = (Deno.env.get('RESEND_API_KEY') ?? '').trim();
    if (!key) return json({ error: 'email_unavailable' }, 503);
    const from = Deno.env.get('RESEND_FROM') || 'Stratovac <commandes@stratovac.ca>';

    const { kind, order_id, user_id } = await req.json();
    let to = '', subject = '', html = '';

    if (kind === 'approved') {
      if (!admin) return json({ error: 'forbidden' }, 403);
      const { data: p } = await db.from('profiles').select('email,full_name,lang,status,discount_pct').eq('id', user_id).single();
      if (!p || p.status !== 'approved') return json({ error: 'not_found' }, 404);
      const fr = p.lang !== 'en';
      to = p.email;
      subject = fr ? 'Votre compte Stratovac est activé' : 'Your Stratovac account is active';
      html = frame(subject, fr
        ? `<p>Bonjour ${esc(p.full_name || '')},</p><p>Votre compte sur l’espace client Stratovac est maintenant activé. Vous y trouvez vos prix${Number(p.discount_pct) ? ' (escompte de ' + Number(p.discount_pct) + ' % inclus)' : ''}, les fiches techniques, l’assistant de sélection et la commande en ligne. Vous pouvez aussi y déposer vos bons de commande.</p><p><a href="${PORTAL.fr}" style="display:inline-block;background:#1e6fd9;color:#fff;padding:11px 18px;border-radius:6px;text-decoration:none;font-weight:bold">Ouvrir l’espace client</a></p>`
        : `<p>Hello ${esc(p.full_name || '')},</p><p>Your account on the Stratovac customer portal is now active. You will find your prices${Number(p.discount_pct) ? ' (' + Number(p.discount_pct) + ' % discount included)' : ''}, datasheets, the selection assistant and online ordering. You can also drop your purchase orders there.</p><p><a href="${PORTAL.en}" style="display:inline-block;background:#1e6fd9;color:#fff;padding:11px 18px;border-radius:6px;text-decoration:none;font-weight:bold">Open the customer portal</a></p>`, fr);
    } else if (kind === 'order' || kind === 'shipped') {
      const { data: o } = await db.from('orders').select('*').eq('id', Number(order_id)).single();
      if (!o) return json({ error: 'not_found' }, 404);
      if (kind === 'shipped' && !admin) return json({ error: 'forbidden' }, 403);
      if (kind === 'order' && !admin && o.user_id !== user.id) return json({ error: 'forbidden' }, 403);
      const { data: p } = await db.from('profiles').select('email,full_name,lang').eq('id', o.user_id).single();
      if (!p) return json({ error: 'not_found' }, 404);
      const fr = p.lang !== 'en';
      to = p.email;
      const rows = (o.items ?? []).map((i: Record<string, unknown>) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #e3e8ee">${esc(i.qty)} × <strong>${esc(i.sku)}</strong>${i.mode ? ' (' + (fr ? (i.mode === 'vacuum' ? 'vide' : 'pression') : i.mode) + ')' : ''}</td><td style="padding:6px 8px;border-bottom:1px solid #e3e8ee;text-align:right;white-space:nowrap">${money(Number(i.line_total), fr)}</td></tr>`).join('');
      const taxes = (o.taxes ?? []).map((t: Record<string, unknown>) => `<tr><td style="padding:4px 8px">${esc(t.name)} ${esc(t.pct)} %</td><td style="padding:4px 8px;text-align:right">${money(Number(t.amount), fr)}</td></tr>`).join('');
      const s = o.ship ?? {};
      const table = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:12px 0">${rows}<tr><td style="padding:6px 8px">${fr ? 'Sous-total' : 'Subtotal'}</td><td style="padding:6px 8px;text-align:right">${money(Number(o.subtotal), fr)}</td></tr>${taxes}<tr><td style="padding:8px;font-weight:bold;border-top:2px solid #15202b">Total</td><td style="padding:8px;text-align:right;font-weight:bold;border-top:2px solid #15202b">${money(Number(o.total), fr)}</td></tr></table>`;
      const shipTo = `<p style="font-size:14px;color:#3a4652">${fr ? 'Livraison' : 'Ship to'} : ${esc([s.name, s.company, s.address, s.city, s.province, s.postal, s.country].filter(Boolean).join(', '))}${o.po_number ? '<br>' + (fr ? 'Votre bon de commande' : 'Your PO') + ' : ' + esc(o.po_number) : ''}</p>`;
      if (kind === 'order') {
        subject = fr ? `Confirmation de commande no ${o.id}` : `Order confirmation no. ${o.id}`;
        const pay = o.status === 'paid' ? (fr ? 'Payée par carte. Merci !' : 'Paid by card. Thank you!') : (fr ? 'Nous vous envoyons la facture sous peu.' : 'We will send you the invoice shortly.');
        html = frame(subject, `<p>${fr ? 'Bonjour' : 'Hello'} ${esc(p.full_name || '')},</p><p>${fr ? `Merci pour votre commande no <strong>${o.id}</strong>. ${pay} Le transport (FOB Longueuil) vous sera confirmé séparément.` : `Thank you for your order no. <strong>${o.id}</strong>. ${pay} Freight (FOB Longueuil) will be confirmed separately.`}</p>${table}${shipTo}<p><a href="${fr ? PORTAL.fr : PORTAL.en}#orders" style="color:#1e6fd9">${fr ? 'Suivre ma commande' : 'Track my order'}</a></p>`, fr);
      } else {
        subject = fr ? `Votre commande no ${o.id} est expédiée` : `Your order no. ${o.id} has shipped`;
        const trk = o.tracking ? `<p style="font-size:15px">${fr ? 'Numéro de suivi' : 'Tracking number'} : <strong>${esc(o.tracking)}</strong></p>` : '';
        html = frame(subject, `<p>${fr ? 'Bonjour' : 'Hello'} ${esc(p.full_name || '')},</p><p>${fr ? `Bonne nouvelle : votre commande no <strong>${o.id}</strong> vient d’être expédiée.` : `Good news: your order no. <strong>${o.id}</strong> has just shipped.`}</p>${trk}${table}${shipTo}`, fr);
      }
    } else return json({ error: 'kind' }, 400);

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: 'abruens@stratovac.ca', subject, html }),
    });
    if (!r.ok) { console.error('resend', r.status, await r.text().catch(() => '')); return json({ error: 'send' }, 502); }
    return json({ sent: true });
  } catch (e) {
    console.error('customer-email', e);
    return json({ error: 'server' }, 500);
  }
});
