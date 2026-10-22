/* Stratovac cart: localStorage cart, server-priced checkout via Cloudflare Worker + HelcimPay.js */
(function () {
  'use strict';
  var API = 'https://stratovac-cart.anthony-bruens-forest.workers.dev/checkout'; // set at deploy
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    add: 'Add to cart', added: 'Added', cart: 'Cart', empty: 'Your cart is empty.', sub: 'Subtotal', tax: 'Taxes', total: 'Total',
    prov: 'Delivery province', name: 'Full name', email: 'Email', phone: 'Phone', street: 'Street address', city: 'City', postal: 'Postal code',
    note: 'Note (motor voltage, delivery details, etc.)', pay: 'Pay by card', close: 'Close', remove: 'Remove',
    heater: 'Heater kit', htrOpt: 'Add heater kit', transport: 'Prices in CAD. Transport is not included (FOB Longueuil, Quebec): we send you the transport quote after your order. Taxes are based on your delivery province. All sales are final except for a defective pump.',
    err: 'Online payment is temporarily unavailable. Please check the fields, or contact us (Request a quote) and we will finalize your order.', ok: 'Thank you! Your payment was approved. We will contact you shortly about transport.', declined: 'The payment was declined.',
    working: 'Preparing payment…', need: 'Please fill in all fields.', needVolt: 'Choose the motor voltage first.', volt: 'Motor voltage'
  } : {
    add: 'Ajouter au panier', added: 'Ajouté', cart: 'Panier', empty: 'Votre panier est vide.', sub: 'Sous-total', tax: 'Taxes', total: 'Total',
    prov: 'Province de livraison', name: 'Nom complet', email: 'Courriel', phone: 'Téléphone', street: 'Adresse', city: 'Ville', postal: 'Code postal',
    note: 'Note (tension du moteur, détails de livraison, etc.)', pay: 'Payer par carte', close: 'Fermer', remove: 'Retirer',
    heater: 'Élément chauffant', htrOpt: 'Ajouter l’élément chauffant', transport: 'Prix en dollars canadiens. Le transport n’est pas inclus (FOB Longueuil, Québec): nous vous envoyons la soumission de transport après votre commande. Les taxes dépendent de votre province de livraison. Aucun retour, sauf si la pompe est défectueuse.',
    err: 'Le paiement en ligne est temporairement indisponible. Vérifiez les champs, ou contactez-nous (Demander une soumission) et nous finaliserons votre commande.', ok: 'Merci! Votre paiement est approuvé. Nous vous contactons sous peu pour le transport.', declined: 'Le paiement a été refusé.',
    working: 'Préparation du paiement…', need: 'Veuillez remplir tous les champs.', needVolt: 'Choisissez d’abord la tension du moteur.', volt: 'Tension du moteur'
  };
  var TAX = { QC: [['TPS', 5], ['TVQ', 9.975]], ON: [['TVH', 13]], NB: [['TVH', 15]], NL: [['TVH', 15]], PE: [['TVH', 15]], NS: [['TVH', 14]], BC: [['TPS', 5]], AB: [['TPS', 5]], SK: [['TPS', 5]], MB: [['TPS', 5]], YT: [['TPS', 5]], NT: [['TPS', 5]], NU: [['TPS', 5]] };
  var PROV = [['QC', 'Québec'], ['ON', 'Ontario'], ['NB', 'Nouveau-Brunswick / New Brunswick'], ['NS', 'Nouvelle-Écosse / Nova Scotia'], ['PE', 'Île-du-Prince-Édouard / PEI'], ['NL', 'Terre-Neuve / Newfoundland'], ['MB', 'Manitoba'], ['SK', 'Saskatchewan'], ['AB', 'Alberta'], ['BC', 'Colombie-Britannique / British Columbia'], ['YT', 'Yukon'], ['NT', 'Territoires du Nord-Ouest / NWT'], ['NU', 'Nunavut']];
  var CAT = {}; // sku -> {n,o,p}; filled from buttons
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('sv_cart') || '[]'); } catch (e) { cart = []; }
  function save() { try { localStorage.setItem('sv_cart', JSON.stringify(cart)); } catch (e) {} }
  function fmt(n) { return n.toLocaleString(EN ? 'en-CA' : 'fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (EN ? '' : ' ') + '$'; }
  function r2(n) { return Math.round(n * 100) / 100; }
  function vlabel(v) { return v === '230S' ? (EN ? '230 V, single phase' : '230 V, monophasé') : v + ' V, 3 ph'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var css = '#svc-fab{position:fixed;right:16px;bottom:16px;z-index:9998;display:none;align-items:center;gap:8px;padding:12px 18px;border:0;border-radius:999px;background:var(--accent,#0b5fd6);color:var(--accent-ink,#fff);font:700 1rem var(--font-body,system-ui);cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.35)}#svc-fab b{background:var(--accent-ink,#fff);color:var(--accent,#0a5fd0);border-radius:99px;padding:0 8px;font-size:.85rem}' +
    '#svc-ov{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:none}#svc-dr{position:fixed;top:0;right:0;bottom:0;width:min(460px,100%);z-index:10000;background:var(--paper,#fff);color:var(--ink,#0d1526);border-left:1px solid var(--line,#cdd3de);display:none;flex-direction:column;font:400 .95rem/1.45 var(--font-body,system-ui)}' +
    '#svc-dr.on,#svc-ov.on{display:flex}#svc-ov.on{display:block}#svc-dr header{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid var(--line,#cdd3de);font-weight:700;font-size:1.1rem}' +
    '#svc-dr .bd{overflow:auto;padding:14px 18px;flex:1}#svc-dr button.x{background:none;border:0;color:inherit;font-size:1.6rem;cursor:pointer;line-height:1}' +
    '.svc-l{display:grid;grid-template-columns:1fr auto;gap:4px 10px;padding:10px 0;border-bottom:1px solid var(--line,#cdd3de)}.svc-l small{opacity:.75}.svc-q{display:flex;align-items:center;gap:6px}.svc-q button{width:28px;height:28px;border-radius:6px;border:1px solid var(--line,#cdd3de);background:var(--surface,#fff);color:inherit;cursor:pointer}' +
    '.svc-r{display:flex;justify-content:space-between;padding:3px 0}.svc-r.t{font-weight:700;font-size:1.1rem;border-top:1px solid var(--line,#cdd3de);margin-top:6px;padding-top:8px}' +
    '#svc-f{display:grid;gap:8px;margin-top:14px}#svc-f input,#svc-f select,#svc-f textarea{width:100%;font:inherit;color:var(--ink,#0d1526);background:var(--surface,#fff);border:1px solid var(--line,#cdd3de);border-radius:6px;padding:9px 11px}#svc-f label{font-size:.82rem;opacity:.85}' +
    '#svc-pay{margin-top:12px;width:100%;padding:13px;border:0;border-radius:8px;background:var(--accent,#0b5fd6);color:var(--accent-ink,#fff);font:700 1rem inherit;cursor:pointer}#svc-pay[disabled]{opacity:.6}.svc-n{font-size:.8rem;opacity:.75;margin-top:10px}#svc-msg{margin-top:10px;font-weight:600}' +
    '.sv-add{display:inline-block;margin-top:6px;padding:4px 12px;font:600 .82rem/1.5 inherit;border-radius:6px;border:1.5px solid currentColor;background:none;cursor:pointer;color:var(--accent,#0b5fd6)}.sv-volt{display:block;margin-top:6px;max-width:100%;padding:4px 6px;font:500 .82rem var(--font-body,system-ui);color:var(--ink,#0d1526);background:var(--surface,#fff);border:1px solid var(--line,#cdd3de);border-radius:6px}.sv-add{white-space:normal}.sv-htr{display:flex;gap:8px;align-items:center;font-size:.92rem;font-weight:500;line-height:1.3;cursor:pointer;white-space:normal;min-width:150px}.sv-htr input{flex:none;width:20px;height:20px;accent-color:var(--accent,#0a5fd0)}.sv-htr strong{white-space:nowrap;color:var(--accent,#0a5fd0)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var fab = document.createElement('button'); fab.id = 'svc-fab'; fab.type = 'button';
  var ov = document.createElement('div'); ov.id = 'svc-ov';
  var dr = document.createElement('aside'); dr.id = 'svc-dr'; dr.setAttribute('role', 'dialog'); dr.setAttribute('aria-label', T.cart);
  document.body.appendChild(fab); document.body.appendChild(ov); document.body.appendChild(dr);

  function count() { return cart.reduce(function (s, l) { return s + l.q; }, 0); }
  function sub() { return r2(cart.reduce(function (s, l) { return s + l.q * l.p; }, 0)); }
  function pumpQty(m) { return cart.reduce(function (s, l) { return s + (l.sku.indexOf(m + '-') === 0 && !/-HTR$/.test(l.sku) ? l.q : 0); }, 0); }
  function clamp() { cart = cart.filter(function (l) { return l.q > 0; }); cart.forEach(function (l) { if (/-HTR$/.test(l.sku)) { var m = l.sku.slice(0, -4), pq = pumpQty(m); if (l.q > pq) l.q = pq; } }); cart = cart.filter(function (l) { return l.q > 0; }); }

  function add(sku, n, o, p, q, v) {
    v = v || '';
    var l = cart.filter(function (x) { return x.sku === sku && (x.v || '') === v; })[0];
    if (l) l.q = Math.min(20, l.q + q); else cart.push({ sku: sku, n: n, o: o, p: p, q: q, v: v });
    clamp(); save(); render();
  }
  function totals() {
    var prov = (document.getElementById('svc-prov') || {}).value || 'QC', s = sub(), tl = (TAX[prov] || TAX.QC).map(function (t) { return [t[0] + ' ' + t[1] + ' %', r2(s * t[1] / 100)]; });
    var tx = r2(tl.reduce(function (a, t) { return a + t[1]; }, 0));
    return { s: s, tl: tl, tx: tx, t: r2(s + tx) };
  }
  function render() {
    clamp(); var c = count(); fab.style.display = c ? 'flex' : 'none'; fab.innerHTML = T.cart + ' <b>' + c + '</b>';
    if (!dr.classList.contains('on')) return;
    var keep = {}; ['svc-name', 'svc-email', 'svc-phone', 'svc-street', 'svc-city', 'svc-postal', 'svc-note', 'svc-prov'].forEach(function (id) { var e = document.getElementById(id); if (e) keep[id] = e.value; });
    if (!cart.length) { dr.innerHTML = '<header><span>' + T.cart + '</span><button class="x" aria-label="' + T.close + '">×</button></header><div class="bd"><p>' + T.empty + '</p></div>'; dr.querySelector('.x').onclick = closeDr; return; }
    var h = '<header><span>' + T.cart + '</span><button class="x" aria-label="' + T.close + '">×</button></header><div class="bd">';
    cart.forEach(function (l, i) {
      h += '<div class="svc-l"><div><strong>' + esc(l.n) + '</strong><br><small>' + esc(l.o) + (l.v ? ' · ' + vlabel(l.v) : '') + '</small></div><div style="text-align:right">' + fmt(r2(l.p * l.q)) + '</div><div class="svc-q"><button data-i="' + i + '" data-d="-1" aria-label="-">−</button><span>' + l.q + '</span><button data-i="' + i + '" data-d="1" aria-label="+">+</button></div><div style="text-align:right"><button class="x" style="font-size:.85rem;text-decoration:underline" data-rm="' + i + '">' + T.remove + '</button></div></div>';
    });
    h += '<div id="svc-f"><label for="svc-prov">' + T.prov + '</label><select id="svc-prov">' + PROV.map(function (p) { return '<option value="' + p[0] + '">' + p[1] + '</option>'; }).join('') + '</select>' +
      '<label for="svc-name">' + T.name + '</label><input id="svc-name" autocomplete="name"><label for="svc-email">' + T.email + '</label><input id="svc-email" type="email" autocomplete="email"><label for="svc-phone">' + T.phone + '</label><input id="svc-phone" type="tel" autocomplete="tel">' +
      '<label for="svc-street">' + T.street + '</label><input id="svc-street" autocomplete="street-address"><label for="svc-city">' + T.city + '</label><input id="svc-city" autocomplete="address-level2"><label for="svc-postal">' + T.postal + '</label><input id="svc-postal" autocomplete="postal-code">' +
      '<label for="svc-note">' + T.note + '</label><textarea id="svc-note" rows="2"></textarea></div><div id="svc-tot"></div><button id="svc-pay" type="button">' + T.pay + '</button><div id="svc-msg" role="status"></div><p class="svc-n">' + T.transport + '</p></div>';
    dr.innerHTML = h;
    Object.keys(keep).forEach(function (id) { var e = document.getElementById(id); if (e && keep[id] !== undefined && keep[id] !== '') e.value = keep[id]; });
    dr.querySelector('.x').onclick = closeDr;
    dr.querySelectorAll('[data-d]').forEach(function (b) { b.onclick = function () { var l = cart[+b.dataset.i]; l.q = Math.min(20, l.q + +b.dataset.d); clamp(); save(); render(); }; });
    dr.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { cart[+b.dataset.rm].q = 0; clamp(); save(); render(); }; });
    document.getElementById('svc-prov').onchange = tot; document.getElementById('svc-pay').onclick = pay; tot();
  }
  function tot() {
    var t = totals(), h = '<div class="svc-r"><span>' + T.sub + '</span><span>' + fmt(t.s) + '</span></div>';
    t.tl.forEach(function (x) { h += '<div class="svc-r"><span>' + x[0] + '</span><span>' + fmt(x[1]) + '</span></div>'; });
    h += '<div class="svc-r t"><span>' + T.total + '</span><span>' + fmt(t.t) + '</span></div>'; document.getElementById('svc-tot').innerHTML = h;
  }
  function openDr() { dr.classList.add('on'); ov.classList.add('on'); render(); }
  function closeDr() { dr.classList.remove('on'); ov.classList.remove('on'); }
  fab.onclick = openDr; ov.onclick = closeDr;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDr(); });

  function msg(t) { var m = document.getElementById('svc-msg'); if (m) m.textContent = t; }
  function pay() {
    var g = function (id) { return (document.getElementById(id).value || '').trim(); }, btn = document.getElementById('svc-pay');
    var cu = { name: g('svc-name'), email: g('svc-email'), phone: g('svc-phone'), street: g('svc-street'), city: g('svc-city'), postal: g('svc-postal') };
    if (!cu.name || !/^\S+@\S+\.\S+$/.test(cu.email) || cu.phone.replace(/\D/g, '').length < 10 || !cu.street || !cu.city || cu.postal.replace(/\s/g, '').length < 6) { msg(T.need); return; }
    btn.disabled = true; msg(T.working);
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang: EN ? 'en' : 'fr', province: g('svc-prov'), customer: cu, note: g('svc-note'), items: cart.map(function (l) { return { sku: l.sku, qty: l.q, volt: l.v || '' }; }) }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.checkoutToken) throw new Error(d.error || 'x');
        btn.disabled = false; msg('');
        var key = 'helcim-pay-js-' + d.checkoutToken;
        function on(ev) {
          if (!ev.data || ev.data.eventName !== key) return;
          if (ev.data.eventStatus === 'SUCCESS') { window.removeEventListener('message', on); try { window.removeHelcimPayIframe(); } catch (e) {} cart = []; save(); render(); closeDr(); alert(T.ok); }
          else if (ev.data.eventStatus === 'ABORTED') { msg(T.declined); }
          else if (ev.data.eventStatus === 'HIDE') { window.removeEventListener('message', on); }
        }
        window.addEventListener('message', on);
        window.appendHelcimPayIframe(d.checkoutToken);
      })
      .catch(function () { btn.disabled = false; msg(T.err); });
  }

  // Wire the price table buttons
  function wire() {
    document.querySelectorAll('.sv-add').forEach(function (b) {
      b.textContent = T.add;
      b.onclick = function () {
        var m = b.dataset.model, q = 1, v = '';
        if (/-AM$/.test(b.dataset.sku)) { var sl = b.closest('td').querySelector('.sv-volt'); v = sl ? sl.value : ''; if (!v) { b.textContent = T.needVolt; if (sl) sl.focus(); setTimeout(function () { b.textContent = T.add; }, 2200); return; } }
        add(b.dataset.sku, b.dataset.name, b.dataset.opt, (v === '230S' && b.dataset.price1) ? +b.dataset.price1 : +b.dataset.price, q, v);
        var cb = b.closest('tr').querySelector('.sv-htr input');
        if (cb && cb.checked) { add(m + '-HTR', b.dataset.name, T.heater + ' + ' + (EN ? 'oil level switch' : 'sonde de niveau'), +cb.dataset.price, 1); }
        b.textContent = T.added + ' ✓'; setTimeout(function () { b.textContent = T.add; }, 1400);
      };
    });
    render();
  }
  document.addEventListener('change', function (e) {
    var sl = e.target; if (!sl.classList || !sl.classList.contains('sv-volt')) return;
    var td = sl.closest('td'), b = td.querySelector('.sv-add'), n = (sl.value === '230S' && b.dataset.price1) ? +b.dataset.price1 : +b.dataset.price;
    var tx = td.firstChild; if (tx && tx.nodeType === 3) tx.nodeValue = EN ? '$' + n.toLocaleString('en-CA') : n.toLocaleString('fr-CA').replace(/\u202f|\u00a0/g, ' ') + ' $';
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
  if (!document.querySelector('script[src*="helcim-pay/services/start.js"]')) { var s = document.createElement('script'); s.src = 'https://secure.helcim.app/helcim-pay/services/start.js'; s.async = true; document.head.appendChild(s); }
})();
