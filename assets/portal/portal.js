/* Stratovac customer portal: accounts (Supabase), approval + per-customer discount, blower catalogue with
   vacuum/pressure accessory suggestions, cart, orders (card via HelcimPay.js in USD, or invoice), admin. */
(function () {
  'use strict';
  var CFG = window.SV_PORTAL || {};
  var FR = document.documentElement.lang === 'fr';
  var NOTIFY_KEY = '17299eeb-76bf-44cf-bcfd-c6d2eee6e0cb'; // site's existing Web3Forms key -> emails abruens@stratovac.ca
  var T = FR ? {
    login: 'Connexion', signup: 'Créer un compte', email: 'Courriel', pass: 'Mot de passe', pass2: 'Nouveau mot de passe', go: 'Se connecter', create: 'Créer mon compte',
    forgot: 'Mot de passe oublié ?', sendReset: 'Envoyer le lien', resetSent: 'Si ce courriel existe, un lien de réinitialisation vient d’être envoyé.', savePass: 'Enregistrer le mot de passe', passSaved: 'Mot de passe enregistré.',
    name: 'Nom complet', company: 'Entreprise', phone: 'Téléphone', country: 'Pays', province: 'Province / État', address: 'Adresse', city: 'Ville', postal: 'Code postal',
    other: 'Autre', signupDone: 'Compte créé. Confirmez votre adresse avec le lien reçu par courriel. Nous approuvons ensuite votre compte, généralement en moins d’un jour ouvrable.',
    pending: 'Votre compte est en attente d’approbation. Nous vous écrirons dès qu’il sera activé.', rejected: 'Votre compte n’a pas été approuvé. Écrivez-nous à abruens@stratovac.ca pour en discuter.',
    cat: 'Catalogue', cart: 'Panier', orders: 'Mes commandes', account: 'Mon compte', admin: 'Administration', logout: 'Déconnexion',
    blowers: 'Surpresseurs', acc: 'Accessoires', search: 'Rechercher un modèle', all: 'Tous', family: 'Série', volt: 'Tension', stages: 'Étages', minFlow: 'Débit min. (CFM)',
    model: 'Modèle', flow: 'Débit', power: 'Puissance', port: 'Raccord', list: 'Prix liste', yours: 'Votre prix', add: 'Ajouter', onReq: 'Sur demande',
    idsc: 'IDSC – canal latéral', idsp: 'IDSP – haute performance', v6: '230/460 V triphasé', v5: '575 V triphasé', v3: '230 V monophasé', dbl: 'double débit',
    useQ: 'Utilisation du surpresseur', vac: 'Vide (aspiration)', press: 'Pression (soufflage)', rec: 'Accessoires recommandés', spare: 'Cartouche de rechange', qty: 'Quantité', addCart: 'Ajouter au panier', cancel: 'Annuler', chooseUse: 'Choisissez vide ou pression.',
    kind: { vacuum_filter: 'Filtre à vide', pressure_filter: 'Filtre-silencieux (pression)', vacuum_valve: 'Soupape de sûreté de vide', pressure_valve: 'Soupape de sûreté de pression', cartridge: 'Cartouche' },
    added: 'Ajouté au panier', empty: 'Votre panier est vide.', sub: 'Sous-total', total: 'Total', remove: 'Retirer', po: 'Votre no de bon de commande (facultatif)', note: 'Note (livraison, etc.)',
    payCard: 'Payer par carte', payInv: 'Commander avec facture', terms: 'Prix en dollars américains (USD). Transport non inclus (FOB Longueuil, Québec) : nous vous envoyons la soumission de transport après la commande. Taxes canadiennes selon la province de livraison. En commandant, vous acceptez nos <a href="/fr/conditions-de-vente/" target="_blank" rel="noopener">conditions de vente</a>.',
    need: 'Remplissez le nom, l’adresse, la ville, le code postal et la province.', working: 'Traitement…', okInv: 'Merci ! Votre commande no {n} est enregistrée. Nous vous envoyons la facture et la soumission de transport sous peu.',
    okCard: 'Merci ! Votre paiement est approuvé (commande no {n}). Nous vous contactons sous peu pour le transport.', payPending: 'Paiement reçu, vérification en cours (commande no {n}). Nous vous confirmerons par courriel.',
    declined: 'Le paiement a été refusé ou annulé.', err: 'Une erreur est survenue. Réessayez ou écrivez à abruens@stratovac.ca.', cardOff: 'Le paiement par carte n’est pas encore activé. Utilisez « Commander avec facture ».',
    noOrders: 'Aucune commande pour l’instant.', date: 'Date', status: 'Statut', items: 'Articles', st: { invoice_requested: 'Facture à envoyer', awaiting_payment: 'Paiement en attente', paid: 'Payée', processing: 'En préparation', shipped: 'Expédiée', cancelled: 'Annulée' },
    us: { pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé' }, del: 'Supprimer', delConfirm: 'Confirmer la suppression', deleted: 'Client supprimé. Ses commandes passées sont conservées.', clickCust: 'Cliquez sur un client pour voir sa fiche et toutes ses commandes.', since: 'client depuis le', nOrders: 'Commandes', spent: 'Total acheté (avant taxes)', lastOrder: 'Dernière commande', close: 'Fermer', save: 'Enregistrer', saved: 'Enregistré.', yourDisc: 'Votre escompte', pendingU: 'Comptes en attente', customers: 'Clients', allOrders: 'Commandes', approve: 'Approuver', reject: 'Refuser', disc: 'Escompte %', none: 'Aucun.',
    datasheet: 'Fiche', mode: { vacuum: 'vide', pressure: 'pression' }, ship: 'Livraison', taxNote: 'Taxes calculées à la commande'
  } : {
    login: 'Sign in', signup: 'Create an account', email: 'Email', pass: 'Password', pass2: 'New password', go: 'Sign in', create: 'Create my account',
    forgot: 'Forgot your password?', sendReset: 'Send the link', resetSent: 'If this email exists, a reset link was just sent.', savePass: 'Save password', passSaved: 'Password saved.',
    name: 'Full name', company: 'Company', phone: 'Phone', country: 'Country', province: 'Province / State', address: 'Street address', city: 'City', postal: 'Postal / ZIP code',
    other: 'Other', signupDone: 'Account created. Confirm your address with the link we emailed you. We then approve your account, usually within one business day.',
    pending: 'Your account is waiting for approval. We will email you as soon as it is active.', rejected: 'Your account was not approved. Write to abruens@stratovac.ca to discuss it.',
    cat: 'Catalog', cart: 'Cart', orders: 'My orders', account: 'My account', admin: 'Admin', logout: 'Sign out',
    blowers: 'Blowers', acc: 'Accessories', search: 'Search a model', all: 'All', family: 'Series', volt: 'Voltage', stages: 'Stages', minFlow: 'Min. flow (CFM)',
    model: 'Model', flow: 'Flow', power: 'Power', port: 'Port', list: 'List price', yours: 'Your price', add: 'Add', onReq: 'On request',
    idsc: 'IDSC – side channel', idsp: 'IDSP – high performance', v6: '230/460 V three-phase', v5: '575 V three-phase', v3: '230 V single-phase', dbl: 'double flow',
    useQ: 'How will the blower be used?', vac: 'Vacuum (suction)', press: 'Pressure (blowing)', rec: 'Recommended accessories', spare: 'Spare cartridge', qty: 'Quantity', addCart: 'Add to cart', cancel: 'Cancel', chooseUse: 'Choose vacuum or pressure.',
    kind: { vacuum_filter: 'Vacuum filter', pressure_filter: 'Inlet filter-silencer (pressure)', vacuum_valve: 'Vacuum relief valve', pressure_valve: 'Pressure relief valve', cartridge: 'Cartridge' },
    added: 'Added to cart', empty: 'Your cart is empty.', sub: 'Subtotal', total: 'Total', remove: 'Remove', po: 'Your PO number (optional)', note: 'Note (delivery, etc.)',
    payCard: 'Pay by card', payInv: 'Order with invoice', terms: 'Prices in US dollars (USD). Transport not included (FOB Longueuil, Quebec): we send you the transport quote after the order. Canadian taxes based on the delivery province. By ordering, you accept our <a href="/terms-of-sale/" target="_blank" rel="noopener">terms of sale</a>.',
    need: 'Fill in the name, address, city, postal code and province.', working: 'Processing…', okInv: 'Thank you! Your order #{n} is recorded. We will send the invoice and the transport quote shortly.',
    okCard: 'Thank you! Your payment was approved (order #{n}). We will contact you shortly about transport.', payPending: 'Payment received, verification in progress (order #{n}). We will confirm by email.',
    declined: 'The payment was declined or cancelled.', err: 'Something went wrong. Try again or write to abruens@stratovac.ca.', cardOff: 'Card payment is not enabled yet. Use “Order with invoice”.',
    noOrders: 'No orders yet.', date: 'Date', status: 'Status', items: 'Items', st: { invoice_requested: 'Invoice to send', awaiting_payment: 'Awaiting payment', paid: 'Paid', processing: 'In preparation', shipped: 'Shipped', cancelled: 'Cancelled' },
    us: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }, del: 'Delete', delConfirm: 'Confirm deletion', deleted: 'Customer deleted. Their past orders are kept.', clickCust: 'Click a customer to see their file and all their orders.', since: 'customer since', nOrders: 'Orders', spent: 'Total purchased (before tax)', lastOrder: 'Last order', close: 'Close', save: 'Save', saved: 'Saved.', yourDisc: 'Your discount', pendingU: 'Accounts awaiting approval', customers: 'Customers', allOrders: 'Orders', approve: 'Approve', reject: 'Reject', disc: 'Discount %', none: 'None.',
    datasheet: 'Datasheet', mode: { vacuum: 'vacuum', pressure: 'pressure' }, ship: 'Delivery', taxNote: 'Taxes calculated at order'
  };
  var PROV = [['QC', 'Québec'], ['ON', 'Ontario'], ['NB', 'New Brunswick / Nouveau-Brunswick'], ['NS', 'Nova Scotia / Nouvelle-Écosse'], ['PE', 'PEI / Î.-P.-É.'], ['NL', 'Newfoundland / Terre-Neuve'], ['MB', 'Manitoba'], ['SK', 'Saskatchewan'], ['AB', 'Alberta'], ['BC', 'British Columbia / C.-B.'], ['YT', 'Yukon'], ['NT', 'NWT / T.N.-O.'], ['NU', 'Nunavut']];
  var TAX = { QC: [['TPS/GST', 5], ['TVQ/QST', 9.975]], ON: [['TVH/HST', 13]], NB: [['TVH/HST', 15]], NL: [['TVH/HST', 15]], PE: [['TVH/HST', 15]], NS: [['TVH/HST', 14]], BC: [['TPS/GST', 5]], AB: [['TPS/GST', 5]], SK: [['TPS/GST', 5]], MB: [['TPS/GST', 5]], YT: [['TPS/GST', 5]], NT: [['TPS/GST', 5]], NU: [['TPS/GST', 5]] };

  var root = document.getElementById('portal');
  if (!root) return;
  if (!CFG.url || !window.supabase) { root.innerHTML = '<p class="pt-note">' + (FR ? 'Espace client bientôt disponible.' : 'Customer portal coming soon.') + '</p>'; return; }
  var sb = window.supabase.createClient(CFG.url, CFG.key);
  var S = { user: null, prof: null, prods: [], bySku: {}, tab: 'cat', f: { q: '', fam: '', v: '6', st: '', min: '' } };
  var cart = []; try { cart = JSON.parse(localStorage.getItem('sv_portal_cart') || '[]'); } catch (e) { cart = []; }
  function saveCart() { try { localStorage.setItem('sv_portal_cart', JSON.stringify(cart)); } catch (e) {} }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function r2(n) { return Math.round(n * 100) / 100; }
  function usd(n) { return n == null ? T.onReq : (FR ? n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $ US' : 'US$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })); }
  function num(n, d) { return Number(n).toLocaleString(FR ? 'fr-CA' : 'en-US', { maximumFractionDigits: d == null ? 2 : d }); }
  function disc() { return S.prof ? Number(S.prof.discount_pct) || 0 : 0; }
  function net(p) { return p == null ? null : r2(Number(p) * (1 - disc() / 100)); }
  function pname(p) { return FR ? p.name_fr : p.name_en; }
  function vlabel(v) { return v === '575' ? T.v5 : v === '230-1ph' ? T.v3 : T.v6; }
  function h(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function notify(subject, text) { try { fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ access_key: NOTIFY_KEY, subject: subject, from_name: 'Stratovac portal', message: text }) }).catch(function () {}); } catch (e) {} }
  function field(id, label, type, val, extra) { return '<div class="pt-f"><label for="' + id + '">' + esc(label) + '</label><input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(val || '') + '" ' + (extra || '') + '></div>'; }
  function provSelect(id, val) { return '<div class="pt-f"><label for="' + id + '">' + T.province + '</label><select id="' + id + '"><option value=""></option>' + PROV.map(function (p) { return '<option value="' + p[0] + '"' + (p[0] === val ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('') + '</select></div>'; }
  function countrySelect(id, val) { return '<div class="pt-f"><label for="' + id + '">' + T.country + '</label><select id="' + id + '">' + [['CA', 'Canada'], ['US', FR ? 'États-Unis' : 'United States'], ['ZZ', T.other]].map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === (val || 'CA') ? ' selected' : '') + '>' + c[1] + '</option>'; }).join('') + '</select></div>'; }
  function $(id) { return document.getElementById(id); }
  function v(id) { var e = $(id); return e ? String(e.value || '').trim() : ''; }

  // ---------- auth screens ----------
  function authView(mode, msg) {
    mode = mode || 'login';
    var html = '<div class="pt-auth"><div class="pt-tabs" role="tablist"><button type="button" data-m="login" aria-selected="' + (mode === 'login') + '">' + T.login + '</button><button type="button" data-m="signup" aria-selected="' + (mode === 'signup') + '">' + T.signup + '</button></div>';
    if (msg) html += '<p class="pt-msg">' + esc(msg) + '</p>';
    if (mode === 'login') {
      html += '<form id="pt-f" class="pt-form">' + field('pt-em', T.email, 'email', '', 'autocomplete="email" required') + field('pt-pw', T.pass, 'password', '', 'autocomplete="current-password" required') +
        '<button class="btn btn--solid" type="submit">' + T.go + '</button><button class="pt-link" type="button" id="pt-forgot">' + T.forgot + '</button></form>';
    } else if (mode === 'forgot') {
      html += '<form id="pt-f" class="pt-form">' + field('pt-em', T.email, 'email', '', 'autocomplete="email" required') + '<button class="btn btn--solid" type="submit">' + T.sendReset + '</button></form>';
    } else if (mode === 'recover') {
      html += '<form id="pt-f" class="pt-form">' + field('pt-pw', T.pass2, 'password', '', 'autocomplete="new-password" minlength="8" required') + '<button class="btn btn--solid" type="submit">' + T.savePass + '</button></form>';
    } else {
      html += '<form id="pt-f" class="pt-form pt-grid2">' + field('pt-nm', T.name, 'text', '', 'autocomplete="name" required') + field('pt-co', T.company, 'text', '', 'autocomplete="organization" required') +
        field('pt-em', T.email, 'email', '', 'autocomplete="email" required') + field('pt-ph', T.phone, 'tel', '', 'autocomplete="tel" required') +
        countrySelect('pt-cn') + provSelect('pt-pv') + field('pt-ad', T.address, 'text', '', 'autocomplete="street-address"') + field('pt-ci', T.city, 'text', '', 'autocomplete="address-level2"') +
        field('pt-pc', T.postal, 'text', '', 'autocomplete="postal-code"') + field('pt-pw', T.pass + ' (8+)', 'password', '', 'autocomplete="new-password" minlength="8" required') +
        '<div class="pt-span"><button class="btn btn--solid" type="submit">' + T.create + '</button></div></form>';
    }
    html += '<p class="pt-msg" id="pt-out" role="status"></p></div>';
    root.innerHTML = html;
    root.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { authView(b.dataset.m); }; });
    if ($('pt-forgot')) $('pt-forgot').onclick = function () { authView('forgot'); };
    $('pt-f').onsubmit = function (e) {
      e.preventDefault(); var out = $('pt-out'); out.textContent = T.working;
      if (mode === 'login') sb.auth.signInWithPassword({ email: v('pt-em'), password: $('pt-pw').value }).then(function (r) { if (r.error) out.textContent = r.error.message; });
      else if (mode === 'forgot') sb.auth.resetPasswordForEmail(v('pt-em'), { redirectTo: location.origin + location.pathname }).then(function () { out.textContent = T.resetSent; });
      else if (mode === 'recover') sb.auth.updateUser({ password: $('pt-pw').value }).then(function (r) { out.textContent = r.error ? r.error.message : T.passSaved; if (!r.error) { recovering = false; setTimeout(boot, 800); } });
      else {
        var meta = { full_name: v('pt-nm'), company: v('pt-co'), phone: v('pt-ph'), country: v('pt-cn'), province: v('pt-pv'), address: v('pt-ad'), city: v('pt-ci'), postal: v('pt-pc'), lang: FR ? 'fr' : 'en' };
        sb.auth.signUp({ email: v('pt-em'), password: $('pt-pw').value, options: { data: meta, emailRedirectTo: location.origin + location.pathname } }).then(function (r) {
          if (r.error) { out.textContent = r.error.message; return; }
          notify('Nouveau compte à approuver – ' + meta.company, 'Nouveau compte client sur le portail Stratovac :\n\n' + meta.full_name + '\n' + meta.company + '\n' + v('pt-em') + '\n' + meta.phone + '\n' + [meta.address, meta.city, meta.province, meta.postal, meta.country].filter(Boolean).join(', ') + '\n\nApprouver et fixer l’escompte : https://stratovac.ca/fr/portail/#admin');
          authView('login', T.signupDone);
        });
      }
    };
  }

  // ---------- app shell ----------
  function shell() {
    var n = cart.reduce(function (s, l) { return s + l.qty; }, 0);
    var tabs = [['cat', T.cat], ['cart', T.cart + (n ? ' (' + n + ')' : '')], ['orders', T.orders], ['account', T.account]];
    if (S.prof && S.prof.is_admin) tabs.push(['admin', T.admin]);
    var bar = '<div class="pt-bar"><div class="pt-tabs" role="tablist">' + tabs.map(function (t) { return '<button type="button" data-t="' + t[0] + '" aria-selected="' + (S.tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div><div class="pt-who"><span>' + esc(S.prof.company || S.prof.email) + (disc() ? ' · ' + T.yourDisc + ' ' + num(disc()) + ' %' : '') + '</span><button class="pt-link" type="button" id="pt-out-btn">' + T.logout + '</button></div></div><div id="pt-view"></div>';
    root.innerHTML = bar;
    root.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { S.tab = b.dataset.t; history.replaceState(null, '', '#' + S.tab); shell(); }; });
    $('pt-out-btn').onclick = function () { sb.auth.signOut(); };
    ({ cat: catView, cart: cartView, orders: ordersView, account: accountView, admin: adminView }[S.tab] || catView)($('pt-view'));
  }

  // ---------- catalogue ----------
  function catView(el) {
    var f = S.f;
    el.innerHTML = '<h2 class="pt-h">' + T.blowers + '</h2><div class="pt-filters">' +
      '<input id="pf-q" type="search" placeholder="' + T.search + '" value="' + esc(f.q) + '" aria-label="' + T.search + '">' +
      '<label>' + T.family + ' <select id="pf-fam"><option value="">' + T.all + '</option><option value="IDSC"' + (f.fam === 'IDSC' ? ' selected' : '') + '>' + T.idsc + '</option><option value="IDSP"' + (f.fam === 'IDSP' ? ' selected' : '') + '>' + T.idsp + '</option></select></label>' +
      '<label>' + T.volt + ' <select id="pf-v"><option value="">' + T.all + '</option>' + [['6', T.v6], ['5', T.v5], ['3', T.v3]].map(function (o) { return '<option value="' + o[0] + '"' + (f.v === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>' +
      '<label>' + T.stages + ' <select id="pf-st"><option value="">' + T.all + '</option><option' + (f.st === '1' ? ' selected' : '') + '>1</option><option' + (f.st === '2' ? ' selected' : '') + '>2</option><option' + (f.st === '3' ? ' selected' : '') + '>3</option></select></label>' +
      '<label>' + T.minFlow + ' <input id="pf-min" type="number" min="0" step="10" value="' + esc(f.min) + '"></label></div>' +
      '<div class="pt-tw"><table class="pt-t"><thead><tr><th>' + T.model + '</th><th>' + T.flow + '<br><small>CFM · m³/h</small></th><th>' + T.power + '<br><small>HP · kW</small></th><th>' + T.stages + '</th><th>' + T.volt + '</th><th>' + T.port + '</th><th class="r">' + T.list + '</th><th class="r">' + T.yours + '</th><th></th></tr></thead><tbody id="pt-rows"></tbody></table></div>' +
      '<h2 class="pt-h">' + T.acc + '</h2><div class="pt-tw"><table class="pt-t"><thead><tr><th>' + T.model + '</th><th></th><th>' + T.port + '</th><th class="r">' + T.list + '</th><th class="r">' + T.yours + '</th><th></th></tr></thead><tbody id="pt-acc"></tbody></table></div>';
    function rows() {
      var q = f.q.toUpperCase(), min = Number(f.min) || 0;
      var list = S.prods.filter(function (p) {
        if (p.kind !== 'blower') return false;
        if (q && p.sku.indexOf(q) < 0) return false;
        if (f.fam && p.family !== f.fam) return false;
        if (f.v && p.sku.slice(-1) !== f.v) return false;
        if (f.st && String(p.specs.stages) !== f.st) return false;
        return !(min && Number(p.specs.cfm) < min);
      }).sort(function (a, b) { return a.specs.cfm - b.specs.cfm || a.specs.stages - b.specs.stages || a.specs.kw - b.specs.kw || a.sku.localeCompare(b.sku); });
      $('pt-rows').innerHTML = list.map(function (p) {
        var s = p.specs;
        return '<tr><td><strong>' + esc(p.sku) + '</strong><br><small>' + esc(pname(p)) + (s.double_flow ? ', ' + T.dbl : '') + '</small>' + dsLink(p) + '</td><td>' + num(s.cfm, 0) + ' · ' + num(s.m3h, 0) + '</td><td>' + num(s.hp) + ' · ' + num(s.kw) + '</td><td>' + s.stages + '</td><td>' + vlabel(s.volt) + '</td><td>' + esc(s.port || '') + '</td><td class="r pt-old">' + usd(p.list_price == null ? null : Number(p.list_price)) + '</td><td class="r"><strong>' + usd(net(p.list_price)) + '</strong></td><td><button class="pt-add" type="button" data-b="' + esc(p.sku) + '"' + (p.list_price == null ? ' disabled' : '') + '>' + T.add + '</button></td></tr>';
      }).join('') || '<tr><td colspan="9">' + T.none + '</td></tr>';
      $('pt-rows').querySelectorAll('[data-b]').forEach(function (b) { b.onclick = function () { blowerDialog(S.bySku[b.dataset.b]); }; });
    }
    $('pt-acc').innerHTML = S.prods.filter(function (p) { return p.kind !== 'blower'; }).map(function (p) {
      return '<tr><td><strong>' + esc(p.sku) + '</strong></td><td>' + esc(pname(p)) + (p.acc && p.acc.cartridge ? '<br><small>' + T.spare + ' : ' + esc(p.acc.cartridge) + '</small>' : '') + '</td><td>' + esc(p.specs.port || '') + (p.specs.scfm ? ' · ' + p.specs.scfm + ' SCFM' : '') + '</td><td class="r pt-old">' + usd(Number(p.list_price)) + '</td><td class="r"><strong>' + usd(net(p.list_price)) + '</strong></td><td><button class="pt-add" type="button" data-a="' + esc(p.sku) + '">' + T.add + '</button></td></tr>';
    }).join('');
    $('pt-acc').querySelectorAll('[data-a]').forEach(function (b) { b.onclick = function () { addLine(b.dataset.a, 1, null); flash(b); }; });
    [['pf-q', 'q'], ['pf-fam', 'fam'], ['pf-v', 'v'], ['pf-st', 'st'], ['pf-min', 'min']].forEach(function (x) { $(x[0]).oninput = $(x[0]).onchange = function () { f[x[1]] = $(x[0]).value; rows(); }; });
    rows();
  }
  function dsLink(p) { return p.datasheet ? '<br><button class="pt-link" type="button" data-ds="' + esc(p.datasheet) + '">' + T.datasheet + ' (PDF)</button>' : ''; }
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-ds]'); if (!b) return;
    sb.storage.from('datasheets').createSignedUrl(b.dataset.ds, 600).then(function (r) { if (r.data) window.open(r.data.signedUrl, '_blank', 'noopener'); });
  });
  function flash(b) { var t = b.textContent; b.textContent = '✓'; setTimeout(function () { b.textContent = t; }, 1200); shellCount(); }
  function shellCount() { var n = cart.reduce(function (s, l) { return s + l.qty; }, 0), b = root.querySelector('[data-t="cart"]'); if (b) b.textContent = T.cart + (n ? ' (' + n + ')' : ''); }
  function addLine(sku, qty, mode) {
    var l = cart.filter(function (x) { return x.sku === sku && (x.mode || null) === (mode || null); })[0];
    if (l) l.qty = Math.min(50, l.qty + qty); else cart.push({ sku: sku, qty: qty, mode: mode || null });
    saveCart();
  }

  // vacuum / pressure dialog with recommended filter + relief valve
  function blowerDialog(p) {
    var dlg = h('div', { class: 'pt-dlg-bg' }), box = h('div', { class: 'pt-dlg', role: 'dialog', 'aria-modal': 'true', 'aria-label': p.sku });
    dlg.appendChild(box); document.body.appendChild(dlg);
    var mode = null;
    function accRows() {
      if (!mode) return '';
      var a = p.acc || {}, skus = mode === 'vacuum' ? [a.vac_filter, a.vac_valve] : [a.press_filter, a.press_valve];
      var out = '<p class="pt-sub">' + T.rec + '</p>';
      skus.forEach(function (s) {
        var q = S.bySku[s]; if (!q) return;
        out += '<label class="pt-chk"><input type="checkbox" data-s="' + esc(s) + '" checked> <span><strong>' + esc(s) + '</strong> · ' + esc(T.kind[q.kind]) + ' ' + esc(q.specs.port || '') + '</span><span class="r">' + usd(net(q.list_price)) + '</span></label>';
        var c = q.acc && q.acc.cartridge && S.bySku[q.acc.cartridge];
        if (c) out += '<label class="pt-chk pt-ind"><input type="checkbox" data-s="' + esc(c.sku) + '"> <span><strong>' + esc(c.sku) + '</strong> · ' + T.spare + '</span><span class="r">' + usd(net(c.list_price)) + '</span></label>';
      });
      if (!skus[0] && !skus[1]) out += '<p class="pt-note">' + T.onReq + '</p>';
      return out;
    }
    function draw() {
      box.innerHTML = '<button class="pt-x" type="button" aria-label="' + T.cancel + '">×</button><h3>' + esc(p.sku) + '</h3><p class="pt-note">' + esc(pname(p)) + ' · ' + num(p.specs.cfm, 0) + ' CFM (' + num(p.specs.m3h, 0) + ' m³/h) · ' + num(p.specs.hp) + ' HP (' + num(p.specs.kw) + ' kW) · ' + vlabel(p.specs.volt) + '</p>' +
        '<p class="pt-sub">' + T.useQ + '</p><div class="pt-seg"><button type="button" data-u="vacuum" aria-pressed="' + (mode === 'vacuum') + '">' + T.vac + '</button><button type="button" data-u="pressure" aria-pressed="' + (mode === 'pressure') + '">' + T.press + '</button></div>' +
        accRows() + '<div class="pt-row"><label>' + T.qty + ' <input id="pd-q" type="number" min="1" max="50" value="1"></label><span class="r"><strong>' + usd(net(p.list_price)) + '</strong></span></div>' +
        '<p class="pt-msg" id="pd-msg" role="status"></p><div class="pt-acts"><button class="btn btn--line" type="button" data-c>' + T.cancel + '</button><button class="btn btn--solid" type="button" data-ok>' + T.addCart + '</button></div>';
      box.querySelectorAll('[data-u]').forEach(function (b) { b.onclick = function () { mode = b.dataset.u; draw(); }; });
      box.querySelector('.pt-x').onclick = box.querySelector('[data-c]').onclick = close;
      box.querySelector('[data-ok]').onclick = function () {
        if (!mode) { $('pd-msg').textContent = T.chooseUse; return; }
        var q = Math.max(1, Math.min(50, parseInt($('pd-q').value, 10) || 1));
        addLine(p.sku, q, mode);
        box.querySelectorAll('[data-s]:checked').forEach(function (c) { addLine(c.dataset.s, q, mode); });
        close(); shellCount(); toast(T.added);
      };
    }
    function close() { dlg.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey); dlg.onclick = function (e) { if (e.target === dlg) close(); };
    draw(); box.querySelector('[data-u]').focus();
  }
  function toast(t) { var d = h('div', { class: 'pt-toast', role: 'status' }, esc(t)); document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1800); }

  // ---------- cart + checkout ----------
  function cartView(el) {
    cart = cart.filter(function (l) { return S.bySku[l.sku] && l.qty > 0; }); saveCart();
    if (!cart.length) { el.innerHTML = '<p class="pt-note">' + T.empty + '</p>'; return; }
    var pr = S.prof || {};
    el.innerHTML = '<div class="pt-cart"><div><div class="pt-tw"><table class="pt-t"><tbody id="pc-l"></tbody></table></div><div id="pc-tot" class="pt-tot"></div></div><div><h3>' + T.ship + '</h3><div class="pt-form">' +
      field('ps-nm', T.name, 'text', pr.full_name) + field('ps-co', T.company, 'text', pr.company) + field('ps-ph', T.phone, 'tel', pr.phone) + countrySelect('ps-cn', pr.country) + provSelect('ps-pv', pr.province) +
      field('ps-ad', T.address, 'text', pr.address) + field('ps-ci', T.city, 'text', pr.city) + field('ps-pc', T.postal, 'text', pr.postal) + field('ps-po', T.po, 'text', '') +
      '<div class="pt-f"><label for="ps-nt">' + T.note + '</label><textarea id="ps-nt" rows="2"></textarea></div></div>' +
      '<div class="pt-acts pt-pay"><button class="btn btn--line" type="button" id="pc-inv">' + T.payInv + '</button><button class="btn btn--solid" type="button" id="pc-card">' + T.payCard + '</button></div><p class="pt-msg" id="pc-msg" role="status"></p><p class="pt-note">' + T.terms + '</p></div></div>';
    function lines() {
      $('pc-l').innerHTML = cart.map(function (l, i) {
        var p = S.bySku[l.sku], u = net(p.list_price);
        return '<tr><td><strong>' + esc(p.sku) + '</strong><br><small>' + esc(p.kind === 'blower' ? pname(p) : T.kind[p.kind]) + (l.mode ? ' · ' + T.mode[l.mode] : '') + '</small></td><td class="pt-q"><button type="button" data-i="' + i + '" data-d="-1" aria-label="−">−</button><span>' + l.qty + '</span><button type="button" data-i="' + i + '" data-d="1" aria-label="+">+</button></td><td class="r">' + usd(r2(u * l.qty)) + '<br><button class="pt-link" type="button" data-rm="' + i + '">' + T.remove + '</button></td></tr>';
      }).join('');
      $('pc-l').querySelectorAll('[data-d]').forEach(function (b) { b.onclick = function () { var l = cart[+b.dataset.i]; l.qty = Math.max(0, Math.min(50, l.qty + +b.dataset.d)); cart = cart.filter(function (x) { return x.qty > 0; }); saveCart(); shellCount(); cart.length ? lines() : cartView(el); }; });
      $('pc-l').querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { cart.splice(+b.dataset.rm, 1); saveCart(); shellCount(); cart.length ? lines() : cartView(el); }; });
      tot();
    }
    function tot() {
      var s = r2(cart.reduce(function (a, l) { return a + net(S.bySku[l.sku].list_price) * l.qty; }, 0));
      var tx = v('ps-cn') === 'CA' ? (TAX[v('ps-pv')] || []).map(function (t) { return [t[0] + ' ' + num(t[1], 3) + ' %', r2(s * t[1] / 100)]; }) : [];
      var t = r2(s + tx.reduce(function (a, x) { return a + x[1]; }, 0));
      $('pc-tot').innerHTML = '<div><span>' + T.sub + '</span><span>' + usd(s) + '</span></div>' + tx.map(function (x) { return '<div><span>' + x[0] + '</span><span>' + usd(x[1]) + '</span></div>'; }).join('') + '<div class="t"><span>' + T.total + '</span><span>' + usd(t) + '</span></div>';
    }
    $('ps-cn').onchange = $('ps-pv').onchange = tot;
    $('pc-inv').onclick = function () { submit('invoice'); };
    $('pc-card').onclick = function () { submit('card'); };
    lines();
  }
  function submit(method) {
    var msg = $('pc-msg'), ship = { name: v('ps-nm'), company: v('ps-co'), phone: v('ps-ph'), country: v('ps-cn'), province: v('ps-pv'), address: v('ps-ad'), city: v('ps-ci'), postal: v('ps-pc') };
    if (!ship.name || !ship.address || !ship.city || !ship.postal || (ship.country === 'CA' && !ship.province)) { msg.textContent = T.need; return; }
    var btns = [$('pc-inv'), $('pc-card')]; btns.forEach(function (b) { b.disabled = true; }); msg.textContent = T.working;
    var payload = { pay_method: method, items: cart.map(function (l) { return { sku: l.sku, qty: l.qty, mode: l.mode }; }), ship: ship, po_number: v('ps-po'), note: v('ps-nt') };
    sb.functions.invoke('place-order', { body: payload }).then(function (r) {
      var d = r.data || {};
      if (r.error && !d.order_id) { var ctx = r.error.context; if (ctx && ctx.json) return ctx.json().then(function (j) { fail(j.error === 'card_unavailable' ? T.cardOff : T.err); }); return fail(T.err); }
      var summary = function (status) { return 'Commande no ' + d.order_id + ' (' + status + ')\nClient : ' + (S.prof.company || '') + ' – ' + S.prof.email + '\nTotal : ' + d.total + ' USD\n\n' + cart.map(function (l) { return l.qty + ' × ' + l.sku + (l.mode ? ' (' + l.mode + ')' : ''); }).join('\n') + '\n\nLivraison : ' + [ship.name, ship.company, ship.address, ship.city, ship.province, ship.postal, ship.country].filter(Boolean).join(', ') + (payload.po_number ? '\nPO client : ' + payload.po_number : '') + (payload.note ? '\nNote : ' + payload.note : '') + '\n\nhttps://stratovac.ca/fr/portail/#admin'; };
      if (method === 'invoice') { notify('Commande no ' + d.order_id + ' – facture à envoyer', summary('facture à envoyer')); done(T.okInv.replace('{n}', d.order_id)); return; }
      if (!d.checkoutToken || !window.appendHelcimPayIframe) return fail(T.cardOff);
      var key = 'helcim-pay-js-' + d.checkoutToken;
      function on(ev) {
        if (!ev.data || ev.data.eventName !== key) return;
        if (ev.data.eventStatus === 'SUCCESS') {
          window.removeEventListener('message', on); try { window.removeHelcimPayIframe(); } catch (e) {}
          var m = ev.data.eventMessage; try { if (typeof m === 'string') m = JSON.parse(m); } catch (e) {}
          var id = m && ((m.data && m.data.data && m.data.data.transactionId) || (m.data && m.data.transactionId) || m.transactionId);
          sb.functions.invoke('confirm-payment', { body: { order_id: d.order_id, transaction_id: id } }).then(function (c) {
            var ok = c.data && c.data.status === 'paid';
            notify('Commande no ' + d.order_id + (ok ? ' – PAYÉE par carte' : ' – paiement à vérifier'), summary(ok ? 'payée par carte, transaction ' + id : 'paiement à vérifier, transaction ' + id));
            done((ok ? T.okCard : T.payPending).replace('{n}', d.order_id));
          });
        } else if (ev.data.eventStatus === 'ABORTED') { msg.textContent = T.declined; btns.forEach(function (b) { b.disabled = false; }); }
        else if (ev.data.eventStatus === 'HIDE') { window.removeEventListener('message', on); btns.forEach(function (b) { b.disabled = false; }); }
      }
      window.addEventListener('message', on);
      msg.textContent = ''; window.appendHelcimPayIframe(d.checkoutToken);
    }).catch(function () { fail(T.err); });
    function fail(t) { msg.textContent = t; btns.forEach(function (b) { b.disabled = false; }); }
    function done(t) { cart = []; saveCart(); S.tab = 'orders'; shell(); var p = h('p', { class: 'pt-ok', role: 'status' }, esc(t)); $('pt-view').prepend(p); }
  }

  // ---------- orders ----------
  function orderTable(list, admin) {
    if (!list.length) return '<p class="pt-note">' + T.noOrders + '</p>';
    return '<div class="pt-tw"><table class="pt-t"><thead><tr><th>#</th><th>' + T.date + '</th>' + (admin ? '<th>' + T.company + '</th>' : '') + '<th>' + T.items + '</th><th class="r">' + T.total + '</th><th>' + T.status + '</th></tr></thead><tbody>' +
      list.map(function (o) {
        var st = admin ? '<select data-os="' + o.id + '">' + Object.keys(T.st).map(function (k) { return '<option value="' + k + '"' + (k === o.status ? ' selected' : '') + '>' + T.st[k] + '</option>'; }).join('') + '</select>' : esc(T.st[o.status] || o.status);
        return '<tr><td>' + o.id + '</td><td>' + new Date(o.created_at).toLocaleDateString(FR ? 'fr-CA' : 'en-CA') + '</td>' + (admin ? '<td>' + esc((o.ship && o.ship.company) || '') + '<br><small>' + esc((o.ship && o.ship.name) || '') + (o.po_number ? ' · PO ' + esc(o.po_number) : '') + '</small></td>' : '') +
          '<td><small>' + (o.items || []).map(function (i) { return i.qty + ' × ' + esc(i.sku) + (i.mode ? ' (' + T.mode[i.mode] + ')' : ''); }).join('<br>') + '</small></td><td class="r">' + usd(Number(o.total)) + '<br><small>' + (o.pay_method === 'card' ? T.payCard : T.payInv) + '</small></td><td>' + st + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function ordersView(el) {
    el.innerHTML = '<p class="pt-note">' + T.working + '</p>';
    sb.from('orders').select('*').eq('user_id', S.user.id).order('created_at', { ascending: false }).then(function (r) { el.innerHTML = orderTable(r.data || [], false); });
  }

  // ---------- account ----------
  function accountView(el) {
    var p = S.prof;
    el.innerHTML = '<div class="pt-form pt-grid2">' + field('pa-nm', T.name, 'text', p.full_name) + field('pa-co', T.company, 'text', p.company) + field('pa-ph', T.phone, 'tel', p.phone) + countrySelect('pa-cn', p.country) + provSelect('pa-pv', p.province) +
      field('pa-ad', T.address, 'text', p.address) + field('pa-ci', T.city, 'text', p.city) + field('pa-pc', T.postal, 'text', p.postal) +
      '<div class="pt-span"><button class="btn btn--solid" type="button" id="pa-sv">' + T.save + '</button></div>' + field('pa-pw', T.pass2, 'password', '', 'autocomplete="new-password" minlength="8"') + '<div class="pt-span"><button class="btn btn--line" type="button" id="pa-pwb">' + T.savePass + '</button></div></div><p class="pt-msg" id="pa-msg" role="status"></p>';
    $('pa-sv').onclick = function () {
      var u = { full_name: v('pa-nm'), company: v('pa-co'), phone: v('pa-ph'), country: v('pa-cn'), province: v('pa-pv'), address: v('pa-ad'), city: v('pa-ci'), postal: v('pa-pc') };
      sb.from('profiles').update(u).eq('id', S.user.id).then(function (r) { $('pa-msg').textContent = r.error ? r.error.message : T.saved; if (!r.error) Object.assign(S.prof, u); });
    };
    $('pa-pwb').onclick = function () { sb.auth.updateUser({ password: $('pa-pw').value }).then(function (r) { $('pa-msg').textContent = r.error ? r.error.message : T.passSaved; }); };
  }

  // ---------- admin ----------
  function adminView(el) {
    el.innerHTML = '<p class="pt-note">' + T.working + '</p>';
    Promise.all([sb.from('profiles').select('*').order('created_at', { ascending: false }), sb.from('orders').select('*').order('created_at', { ascending: false }).limit(200)]).then(function (rs) {
      var users = rs[0].data || [], orders = rs[1].data || [];
      var pend = users.filter(function (u) { return u.status === 'pending'; }), rest = users.filter(function (u) { return u.status !== 'pending'; });
      function urow(u) {
        return '<tr><td><button class="pt-link pt-cust" type="button" data-uv="' + u.id + '"><strong>' + esc(u.company || u.email) + '</strong></button><br><small>' + esc(u.full_name || '') + ' · ' + esc(u.email) + ' · ' + esc(u.phone || '') + '<br>' + esc([u.city, u.province, u.country].filter(Boolean).join(', ')) + '</small></td>' +
          '<td><input type="number" min="0" max="90" step="0.5" value="' + Number(u.discount_pct) + '" data-ud="' + u.id + '" aria-label="' + T.disc + '" class="pt-num"> %</td><td>' + esc(T.us[u.status] || u.status) + (u.is_admin ? '<br><small>' + T.admin + '</small>' : '') + '</td><td class="pt-acts">' +
          (u.status !== 'approved' ? '<button class="btn btn--solid" type="button" data-ua="' + u.id + '">' + T.approve + '</button>' : '<button class="btn btn--line" type="button" data-us="' + u.id + '">' + T.save + '</button>') +
          (u.status === 'pending' ? '<button class="btn btn--line" type="button" data-ur="' + u.id + '">' + T.reject + '</button>' : '') +
          (u.is_admin ? '' : '<button class="btn btn--line pt-del" type="button" data-ux="' + u.id + '">' + T.del + '</button>') + '</td></tr>';
      }
      var head = '<thead><tr><th>' + T.company + '</th><th>' + T.disc + '</th><th>' + T.status + '</th><th></th></tr></thead>';
      el.innerHTML = '<p class="pt-msg" id="ad-msg" role="status"></p><h2 class="pt-h">' + T.pendingU + ' (' + pend.length + ')</h2>' + (pend.length ? '<div class="pt-tw"><table class="pt-t">' + head + '<tbody>' + pend.map(urow).join('') + '</tbody></table></div>' : '<p class="pt-note">' + T.none + '</p>') +
        '<h2 class="pt-h">' + T.allOrders + '</h2>' + orderTable(orders, true) +
        '<h2 class="pt-h">' + T.customers + ' (' + rest.length + ')</h2><p class="pt-note">' + T.clickCust + '</p><div class="pt-tw"><table class="pt-t">' + head + '<tbody>' + rest.map(urow).join('') + '</tbody></table></div>';
      function say(t) { $('ad-msg').textContent = t; }
      function upd(id, patch) { sb.from('profiles').update(patch).eq('id', id).then(function (r) { if (r.error) return say(r.error.message); adminView(el); setTimeout(function () { say(T.saved); }, 600); }); }
      function dval(id) { return Math.max(0, Math.min(90, Number(el.querySelector('[data-ud="' + id + '"]').value) || 0)); }
      el.querySelectorAll('[data-ua]').forEach(function (b) { b.onclick = function () { upd(b.dataset.ua, { status: 'approved', discount_pct: dval(b.dataset.ua) }); }; });
      el.querySelectorAll('[data-us]').forEach(function (b) { b.onclick = function () { upd(b.dataset.us, { discount_pct: dval(b.dataset.us) }); }; });
      el.querySelectorAll('[data-ur]').forEach(function (b) { b.onclick = function () { upd(b.dataset.ur, { status: 'rejected' }); }; });
      el.querySelectorAll('[data-os]').forEach(function (s) { s.onchange = function () { sb.from('orders').update({ status: s.value }).eq('id', +s.dataset.os).then(function (r) { say(r.error ? r.error.message : T.saved); }); }; });
      el.querySelectorAll('[data-uv]').forEach(function (b) { b.onclick = function () { customerDialog(users.filter(function (u) { return u.id === b.dataset.uv; })[0]); }; });
      // two-step delete: first click arms the button, second click deletes
      el.querySelectorAll('[data-ux]').forEach(function (b) {
        b.onclick = function () {
          if (!b.classList.contains('armed')) { b.classList.add('armed'); b.textContent = T.delConfirm; setTimeout(function () { if (b.isConnected) { b.classList.remove('armed'); b.textContent = T.del; } }, 5000); return; }
          b.disabled = true; b.textContent = T.working;
          sb.functions.invoke('admin-delete-user', { body: { user_id: b.dataset.ux } }).then(function (r) {
            if (r.error || !r.data || !r.data.deleted) { b.disabled = false; b.textContent = T.del; b.classList.remove('armed'); return say(T.err); }
            adminView(el); setTimeout(function () { say(T.deleted); }, 600);
          });
        };
      });
    });
  }
  function customerDialog(u) {
    if (!u) return;
    var dlg = h('div', { class: 'pt-dlg-bg' }), box = h('div', { class: 'pt-dlg pt-dlg--wide', role: 'dialog', 'aria-modal': 'true', 'aria-label': u.company || u.email });
    dlg.appendChild(box); document.body.appendChild(dlg);
    function close() { dlg.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey); dlg.onclick = function (e) { if (e.target === dlg) close(); };
    var info = '<button class="pt-x" type="button" aria-label="' + T.close + '">×</button><h3>' + esc(u.company || u.email) + '</h3>' +
      '<p class="pt-note">' + esc(u.full_name || '') + ' · <a href="mailto:' + esc(u.email) + '">' + esc(u.email) + '</a>' + (u.phone ? ' · <a href="tel:' + esc(u.phone) + '">' + esc(u.phone) + '</a>' : '') + '<br>' +
      esc([u.address, u.city, u.province, u.postal, u.country].filter(Boolean).join(', ')) + '<br>' + T.status + ' : ' + esc(T.us[u.status] || u.status) + ' · ' + T.disc + ' : ' + num(Number(u.discount_pct)) + ' % · ' + T.since + ' ' + new Date(u.created_at).toLocaleDateString(FR ? 'fr-CA' : 'en-CA') + '</p><div id="cd-o"><p class="pt-note">' + T.working + '</p></div>';
    box.innerHTML = info; box.querySelector('.pt-x').onclick = close; box.querySelector('.pt-x').focus();
    sb.from('orders').select('*').eq('user_id', u.id).order('created_at', { ascending: false }).then(function (r) {
      var list = r.data || [], live = list.filter(function (o) { return o.status !== 'cancelled'; });
      var spent = live.reduce(function (a, o) { return a + Number(o.subtotal || 0); }, 0);
      $('cd-o').innerHTML = '<div class="pt-stats"><div><span>' + T.nOrders + '</span><strong>' + list.length + '</strong></div><div><span>' + T.spent + '</span><strong>' + usd(r2(spent)) + '</strong></div><div><span>' + T.lastOrder + '</span><strong>' + (list[0] ? new Date(list[0].created_at).toLocaleDateString(FR ? 'fr-CA' : 'en-CA') : '–') + '</strong></div></div>' +
        (list.length ? '<div class="pt-tw"><table class="pt-t"><thead><tr><th>#</th><th>' + T.date + '</th><th>' + T.items + '</th><th class="r">' + T.total + '</th><th>' + T.status + '</th></tr></thead><tbody>' + list.map(function (o) {
          return '<tr><td>' + o.id + (o.po_number ? '<br><small>PO ' + esc(o.po_number) + '</small>' : '') + '</td><td>' + new Date(o.created_at).toLocaleDateString(FR ? 'fr-CA' : 'en-CA') + '</td><td><small>' + (o.items || []).map(function (i) { return i.qty + ' × ' + esc(i.sku) + (i.mode ? ' (' + T.mode[i.mode] + ')' : '') + (i.unit_price != null ? ' – ' + usd(Number(i.unit_price)) : ''); }).join('<br>') + '</small></td><td class="r">' + usd(Number(o.total)) + '<br><small>' + (o.pay_method === 'card' ? T.payCard : T.payInv) + '</small></td><td>' + esc(T.st[o.status] || o.status) + '</td></tr>';
        }).join('') + '</tbody></table></div>' : '<p class="pt-note">' + T.noOrders + '</p>');
    });
  }

  // ---------- boot ----------
  var recovering = false;
  function boot() {
    sb.auth.getSession().then(function (r) {
      var ses = r.data && r.data.session;
      if (recovering) return authView('recover');
      if (!ses) { S.user = null; return authView('login'); }
      S.user = ses.user;
      sb.from('profiles').select('*').eq('id', S.user.id).single().then(function (pr) {
        S.prof = pr.data;
        if (!S.prof || (S.prof.status !== 'approved' && !S.prof.is_admin)) {
          root.innerHTML = '<p class="pt-msg">' + (S.prof && S.prof.status === 'rejected' ? T.rejected : T.pending) + '</p><button class="pt-link" type="button" id="pt-out-btn">' + T.logout + '</button>';
          $('pt-out-btn').onclick = function () { sb.auth.signOut(); }; return;
        }
        sb.from('products').select('*').order('sort').then(function (pp) {
          S.prods = pp.data || []; S.bySku = {}; S.prods.forEach(function (p) { S.bySku[p.sku] = p; });
          var want = (location.hash || '').slice(1); if (['cat', 'cart', 'orders', 'account', 'admin'].indexOf(want) >= 0) S.tab = want;
          shell();
        });
      });
    });
  }
  sb.auth.onAuthStateChange(function (ev) {
    if (ev === 'PASSWORD_RECOVERY') { recovering = true; authView('recover'); return; }
    if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT') setTimeout(boot, 0);
  });
  boot();
  if (!document.querySelector('script[src*="helcim-pay/services/start.js"]')) { var s = document.createElement('script'); s.src = 'https://secure.helcim.app/helcim-pay/services/start.js'; s.async = true; document.head.appendChild(s); }
})();
