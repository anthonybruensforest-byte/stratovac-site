/* Stratovac public selection assistant (no account, no prices). Uses portal.css. */
(function () {
  'use strict';
  var CFG = window.SV_PORTAL || {}, root = document.getElementById('pubai');
  if (!root || !CFG.url) return;
  var FR = document.documentElement.lang === 'fr';
  var T = FR ? {
    intro: 'Décrivez votre besoin en vos mots, par exemple « 200 CFM à 5 psi pour aérer un bassin » ou « 150 m³/h de biogaz à -150 mbar ». L’assistant propose le surpresseur qui convient et ses accessoires.',
    ph: 'Votre application…', send: 'Envoyer', think: 'L’assistant réfléchit…', you: 'Vous', bot: 'Assistant', fresh: 'Nouvelle conversation',
    err: 'L’assistant n’est pas disponible pour le moment. Écrivez-nous à abruens@stratovac.ca.', limit: 'Vous avez atteint la limite de questions sans compte. Créez votre compte gratuit pour continuer.',
    ctaT: 'Voyez vos prix et commandez en ligne', ctaS: 'Créez votre compte client gratuit : vos prix, les fiches techniques, la soumission en PDF et la commande en ligne.', ctaB: 'Créer mon compte', login: 'Déjà client ? Connexion', portal: '/fr/portail/',
    examples: ['200 CFM à 5 psi pour aérer un bassin', '150 m³/h de biogaz à -150 mbar, 300 m d’altitude', 'Vide de 6 inHg pour une table d’aspiration, 80 CFM'],
    note: 'Sélection calculée sur les courbes à 60 Hz, tolérance ±10 %. Aucune donnée personnelle demandée.'
  } : {
    intro: 'Describe your need in your own words, for example “200 CFM at 5 psi to aerate a basin” or “150 m3/h of biogas at -150 mbar”. The assistant proposes the blower that fits and its accessories.',
    ph: 'Your application…', send: 'Send', think: 'The assistant is thinking…', you: 'You', bot: 'Assistant', fresh: 'New conversation',
    err: 'The assistant is not available right now. Write to abruens@stratovac.ca.', limit: 'You have reached the question limit without an account. Create your free account to continue.',
    ctaT: 'See your prices and order online', ctaS: 'Create your free customer account: your prices, datasheets, PDF quotes and online ordering.', ctaB: 'Create my account', login: 'Already a customer? Log in', portal: '/portal/',
    examples: ['200 CFM at 5 psi to aerate a basin', '150 m3/h of biogas at -150 mbar, 1,000 ft altitude', '6 inHg vacuum for a hold-down table, 80 CFM'],
    note: 'Selection based on the 60 Hz curves, ±10 % tolerance. No personal data required.'
  };
  var msgs = [], busy = false, showCta = false;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\b(ID[A-Z]{1,4}[0-9A-Z.\-]*[0-9A-Z])\b/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); }
  function draw() {
    root.innerHTML = '<section class="pt-ai"><div class="pt-ai-hd"><h2 class="pt-h">' + (FR ? 'Assistant de sélection' : 'Selection assistant') + '</h2>' + (msgs.length ? '<button class="pt-link" type="button" id="pa-new">' + T.fresh + '</button>' : '') + '</div><p class="pt-note">' + T.intro + '</p>' +
      (msgs.length ? '' : '<div class="pt-ai-acts">' + T.examples.map(function (e, i) { return '<button class="pt-add" type="button" data-ex="' + i + '">' + esc(e) + '</button>'; }).join('') + '</div>') +
      '<div class="pt-ai-log" id="pa-log" aria-live="polite">' + msgs.map(function (m) { return '<div class="pt-ai-m pt-ai-' + (m.role === 'user' ? 'u' : 'a') + '"><small>' + (m.role === 'user' ? T.you : T.bot) + '</small><p>' + fmt(m.content) + '</p></div>'; }).join('') + (busy ? '<p class="pt-note">' + T.think + '</p>' : '') + '</div>' +
      '<form class="pt-ai-f" id="pa-f"><textarea id="pa-in" rows="2" placeholder="' + T.ph + '" aria-label="' + T.ph + '"' + (busy ? ' disabled' : '') + '></textarea><button class="btn btn--solid" type="submit"' + (busy ? ' disabled' : '') + '>' + T.send + '</button></form>' +
      (showCta ? '<div class="pt-ok pt-cta"><p><strong>' + T.ctaT + '</strong><br>' + T.ctaS + '</p><p class="pt-acts"><a class="btn btn--solid" href="' + T.portal + '#signup">' + T.ctaB + '</a><a class="pt-link" href="' + T.portal + '">' + T.login + '</a></p></div>' : '') +
      '<p class="pt-note">' + T.note + '</p></section>';
    var log = document.getElementById('pa-log'); log.scrollTop = log.scrollHeight;
    var inp = document.getElementById('pa-in');
    inp.onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('pa-f').requestSubmit(); } };
    document.getElementById('pa-f').onsubmit = function (e) { e.preventDefault(); ask(inp.value.trim()); };
    root.querySelectorAll('[data-ex]').forEach(function (b) { b.onclick = function () { ask(T.examples[+b.dataset.ex]); }; });
    if (document.getElementById('pa-new')) document.getElementById('pa-new').onclick = function () { msgs = []; showCta = false; draw(); };
    if (!busy && msgs.length) inp.focus({ preventScroll: true });
  }
  function ask(q) {
    if (!q || busy) return;
    msgs.push({ role: 'user', content: q.slice(0, 1200) }); busy = true; draw();
    fetch(CFG.url + '/functions/v1/public-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: CFG.key }, body: JSON.stringify({ lang: FR ? 'fr' : 'en', messages: msgs.filter(function (m) { return !m.err; }) }) })
      .then(function (r) { return r.json().then(function (d) { return { st: r.status, d: d }; }); })
      .then(function (x) {
        busy = false;
        if (x.st === 429) { msgs.push({ role: 'assistant', content: T.limit, err: true }); showCta = true; }
        else if (!x.d || !x.d.reply) msgs.push({ role: 'assistant', content: T.err, err: true });
        else { msgs.push({ role: 'assistant', content: x.d.reply }); if (x.d.picks && x.d.picks.length) showCta = true; }
        draw();
      }).catch(function () { busy = false; msgs.push({ role: 'assistant', content: T.err, err: true }); draw(); });
  }
  draw();
})();
