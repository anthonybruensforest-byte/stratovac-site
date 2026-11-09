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
const CARRIER: Record<string, (n: string) => string> = {
  purolator: (n) => `https://www.purolator.com/en/shipping/tracker?pin=${encodeURIComponent(n)}`,
  ups: (n) => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`,
  fedex: (n) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
  canpar: (n) => `https://www.canpar.com/en/tracking/track.htm?barcode=${encodeURIComponent(n)}`,
  dhl: (n) => `https://www.dhl.com/ca-en/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(n)}`,
  canadapost: (n) => `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(n)}`,
};
const ADMIN_TO = 'abruens@stratovac.ca';

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

    const body = await req.json();
    const { kind, order_id, user_id } = body;
    let to: string | string[] = '', subject = '', html = '', replyTo = ADMIN_TO;
    const { data: meP } = await db.from('profiles').select('email,full_name,company,phone,lang,status,org_id,is_admin').eq('id', user.id).single();
    const approvedMe = !!meP && (meP.status === 'approved' || meP.is_admin);

    if (kind === 'handoff') {
      // "Talk to Anthony": the customer's conversation and cart, to Stratovac, replies go to the customer
      if (!approvedMe) return json({ error: 'forbidden' }, 403);
      const hour = new Date(Date.now() - 3600e3).toISOString();
      const { count } = await db.from('ai_usage').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('fn', 'handoff').gte('at', hour);
      if ((count ?? 0) >= 5) return json({ error: 'limit' }, 429);
      await db.from('ai_usage').insert({ user_id: user.id, fn: 'handoff' });
      const msg = String(body.message ?? '').slice(0, 2000);
      const convo = (Array.isArray(body.transcript) ? body.transcript : []).slice(-30).map((m: Record<string, unknown>) => `<p style="margin:0 0 8px"><strong>${m.role === 'user' ? esc(meP!.full_name || 'Client') : 'Assistant'} :</strong><br>${esc(String(m.content ?? '').slice(0, 3000)).replace(/\n/g, '<br>')}</p>`).join('');
      const items = (Array.isArray(body.cart) ? body.cart : []).slice(0, 60).map((l: Record<string, unknown>) => `${esc(l.qty)} × ${esc(l.sku)}${l.mode ? ' (' + esc(l.mode) + ')' : ''}`).join('<br>');
      to = ADMIN_TO; replyTo = meP!.email;
      subject = `Portail : ${meP!.company || meP!.email} veut vous parler`;
      html = frame(subject, `<p><strong>${esc(meP!.full_name || '')}</strong> · ${esc(meP!.company || '')}<br><a href="mailto:${esc(meP!.email)}">${esc(meP!.email)}</a>${meP!.phone ? ' · ' + esc(meP!.phone) : ''}</p>${msg ? `<p style="padding:10px 12px;background:#eef4fd;border-left:4px solid #1e6fd9">${esc(msg).replace(/\n/g, '<br>')}</p>` : ''}<h2 style="font-size:15px;margin:18px 0 8px">Conversation avec l’assistant</h2>${convo || '<p>(aucune)</p>'}<h2 style="font-size:15px;margin:18px 0 8px">Panier</h2><p>${items || '(vide)'}</p><p style="font-size:13px;color:#5b6673">Répondez à ce courriel pour écrire directement au client.</p>`, true);
    } else if (kind === 'cart_shared') {
      if (!approvedMe || !meP!.org_id) return json({ error: 'forbidden' }, 403);
      const { data: sc } = await db.from('shared_carts').select('*').eq('id', Number(body.cart_id)).single();
      if (!sc || sc.org_id !== meP!.org_id || sc.from_user !== user.id) return json({ error: 'not_found' }, 404);
      const { data: team } = await db.from('profiles').select('email,lang,status').eq('org_id', meP!.org_id).neq('id', user.id);
      const rcpt = (team ?? []).filter((t) => t.status === 'approved').map((t) => t.email);
      if (!rcpt.length) return json({ error: 'no_team' }, 400);
      const fr = meP!.lang !== 'en';
      to = rcpt; replyTo = meP!.email;
      const lines = (sc.items ?? []).map((l: Record<string, unknown>) => `${esc(l.qty)} × <strong>${esc(l.sku)}</strong>${l.mode ? ' (' + (fr ? (l.mode === 'vacuum' ? 'vide' : 'pression') : l.mode) + ')' : ''}`).join('<br>');
      subject = fr ? `${meP!.full_name || meP!.email} vous envoie un panier à approuver` : `${meP!.full_name || meP!.email} sent you a cart to approve`;
      html = frame(subject, `<p>${fr ? 'Bonjour,' : 'Hello,'}</p><p>${fr ? `<strong>${esc(meP!.full_name || meP!.email)}</strong> a préparé ce panier sur l’espace client Stratovac et vous demande de l’approuver :` : `<strong>${esc(meP!.full_name || meP!.email)}</strong> prepared this cart on the Stratovac customer portal and asks you to approve it:`}</p><p style="font-size:14px">${lines}</p>${sc.note ? `<p style="padding:10px 12px;background:#eef4fd;border-left:4px solid #1e6fd9">${esc(sc.note)}</p>` : ''}<p><a href="${fr ? PORTAL.fr : PORTAL.en}#account" style="display:inline-block;background:#1e6fd9;color:#fff;padding:11px 18px;border-radius:6px;text-decoration:none;font-weight:bold">${fr ? 'Voir et commander' : 'Review and order'}</a></p>`, fr);
    } else if (kind === 'approved') {
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
        html = frame(subject, `<p>${fr ? 'Bonjour' : 'Hello'} ${esc(p.full_name || '')},</p><p>${fr ? `Merci pour votre commande no <strong>${o.id}</strong>. ${pay} ${s.country === 'US' ? 'Expédition de notre entrepôt en Floride : tarifs inclus, aucuns frais de courtage. Le transport vous sera confirmé séparément.' : 'Le transport (FOB Longueuil) vous sera confirmé séparément.'}` : `Thank you for your order no. <strong>${o.id}</strong>. ${pay} ${s.country === 'US' ? 'Ships from our warehouse in Florida: tariffs included, no brokerage fees. Freight will be confirmed separately.' : 'Freight (FOB Longueuil) will be confirmed separately.'}`}</p>${table}${shipTo}<p><a href="${fr ? PORTAL.fr : PORTAL.en}#orders" style="color:#1e6fd9">${fr ? 'Suivre ma commande' : 'Track my order'}</a></p>`, fr);
      } else {
        subject = fr ? `Votre commande no ${o.id} est expédiée` : `Your order no. ${o.id} has shipped`;
        const link = o.tracking && o.carrier && CARRIER[o.carrier] ? CARRIER[o.carrier](o.tracking) : null;
        const trk = o.tracking ? `<p style="font-size:15px">${fr ? 'Numéro de suivi' : 'Tracking number'} : <strong>${esc(o.tracking)}</strong>${link ? `<br><a href="${link}" style="display:inline-block;margin-top:8px;background:#1e6fd9;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold">${fr ? 'Suivre mon colis' : 'Track my package'}</a>` : ''}</p>` : '';
        html = frame(subject, `<p>${fr ? 'Bonjour' : 'Hello'} ${esc(p.full_name || '')},</p><p>${fr ? `Bonne nouvelle : votre commande no <strong>${o.id}</strong> vient d’être expédiée.` : `Good news: your order no. <strong>${o.id}</strong> has just shipped.`}</p>${trk}${table}${shipTo}`, fr);
      }
    } else return json({ error: 'kind' }, 400);

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], reply_to: replyTo, subject, html }),
    });
    if (!r.ok) { console.error('resend', r.status, await r.text().catch(() => '')); return json({ error: 'send' }, 502); }
    return json({ sent: true });
  } catch (e) {
    console.error('customer-email', e);
    return json({ error: 'server' }, 500);
  }
});
