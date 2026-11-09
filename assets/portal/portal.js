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
    us: { pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé' }, sel: 'Trouver un surpresseur', selIntro: 'Entrez votre débit et votre pression (ou votre vide) : nous affichons les surpresseurs qui font le travail, du moins cher au plus cher.', pressLvl: 'Pression (relative)', vacLvl: 'Vide', find: 'Trouver', point: 'Point demandé :', at: 'à', flowAt: 'Débit au point', margin: 'Marge', maxDp: 'Max. du modèle', powerAt: 'Puissance au point', cheapest: 'le plus économique', stg: 'étage(s)', est: 'max. estimé', found: 'modèle(s) conviennent. Cliquez un modèle pour sa fiche technique.', noFit: 'Aucun surpresseur seul ne fait ce point.', twoUnits: 'Deux surpresseurs identiques en parallèle feraient le travail :', selNote: 'Calcul sur les courbes à 60 Hz, air à 20 °C (68 °F) au niveau de la mer, tolérance ±10 %. Moteurs 2 pôles, environ 3 450 tr/min. Pour un autre gaz, en altitude ou avec de l’air chaud à l’aspiration, contactez-nous pour valider la sélection.', back: 'Retour au catalogue', otherV: 'Autres tensions :', dlSheet: 'Fiche technique (PDF)', openSheet: 'Ouvrir la fiche technique dans un nouvel onglet', noSheet: 'Fiche technique disponible sur demande.', del: 'Supprimer', delConfirm: 'Confirmer la suppression', deleted: 'Client supprimé. Ses commandes passées sont conservées.', clickCust: 'Cliquez sur un client pour voir sa fiche et toutes ses commandes.', since: 'client depuis le', nOrders: 'Commandes', spent: 'Total acheté (avant taxes)', lastOrder: 'Dernière commande', close: 'Fermer', save: 'Enregistrer', saved: 'Enregistré.', yourDisc: 'Votre escompte', pendingU: 'Comptes en attente', customers: 'Clients', allOrders: 'Commandes', approve: 'Approuver', reject: 'Refuser', disc: 'Escompte %', none: 'Aucun.',
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
    us: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }, sel: 'Blower selector', selIntro: 'Enter your flow and your pressure (or vacuum): we show the blowers that do the job, cheapest first.', pressLvl: 'Pressure (gauge)', vacLvl: 'Vacuum', find: 'Find', point: 'Requested point:', at: 'at', flowAt: 'Flow at point', margin: 'Margin', maxDp: 'Model max.', powerAt: 'Power at point', cheapest: 'most economical', stg: 'stage(s)', est: 'estimated max.', found: 'model(s) fit. Click a model for its datasheet.', noFit: 'No single blower reaches this point.', twoUnits: 'Two identical blowers in parallel would do the job:', selNote: 'Based on 60 Hz curves, air at 68 °F (20 °C) at sea level, ±10 % tolerance. 2-pole motors, about 3,450 rpm. For another gas, altitude or hot inlet air, contact us to validate the selection.', back: 'Back to catalog', otherV: 'Other voltages:', dlSheet: 'Datasheet (PDF)', openSheet: 'Open the datasheet in a new tab', noSheet: 'Datasheet available on request.', del: 'Delete', delConfirm: 'Confirm deletion', deleted: 'Customer deleted. Their past orders are kept.', clickCust: 'Click a customer to see their file and all their orders.', since: 'customer since', nOrders: 'Orders', spent: 'Total purchased (before tax)', lastOrder: 'Last order', close: 'Close', save: 'Save', saved: 'Saved.', yourDisc: 'Your discount', pendingU: 'Accounts awaiting approval', customers: 'Customers', allOrders: 'Orders', approve: 'Approve', reject: 'Reject', disc: 'Discount %', none: 'None.',
    datasheet: 'Datasheet', mode: { vacuum: 'vacuum', pressure: 'pressure' }, ship: 'Delivery', taxNote: 'Taxes calculated at order'
  };
  Object.assign(T, FR ? {
    poTitle: 'Déposez votre bon de commande ici', poSub: 'Glissez votre PDF (ou une photo, une capture d’écran) dans ce cadre, ou cliquez pour le choisir. Nous lisons le bon et remplissons le panier ; vous vérifiez avant de confirmer.',
    poTypes: 'PDF, PNG, JPG ou WEBP, 15 Mo max. Un document Word ou Excel : enregistrez-le d’abord en PDF.', poReading: 'Lecture du bon de commande {f}…',
    poRead: 'Bon de commande {f} lu : {n} article(s) ajouté(s) au panier. Vérifiez les quantités, l’usage (vide ou pression) et l’adresse de livraison, puis confirmez la commande.',
    poNone: 'Bon de commande {f} joint, mais aucun article n’a été reconnu dans notre catalogue. Ajoutez les articles depuis le catalogue ; le bon sera joint à votre commande.',
    poMiss: 'Articles du bon à confirmer avec nous :', poLow: 'à vérifier', poPrice: 'prix sur votre bon', poErr: 'Nous n’avons pas pu lire ce document. Essayez un PDF, ou ajoutez les articles depuis le catalogue.',
    poAi: 'Bon de commande {f} joint. La lecture automatique n’est pas encore activée : ajoutez les articles depuis le catalogue, nous vérifierons avec votre bon.',
    aiT: 'Assistant de sélection', aiIntro: 'Pour vos questions sur nos surpresseurs et accessoires. Décrivez votre besoin en vos mots (ex. : « 200 CFM à 5 psi pour aérer un bassin »). L’assistant trouve le surpresseur et affiche les résultats ci-dessous.', aiPh: 'Votre question…', aiSend: 'Envoyer', aiThink: 'L’assistant réfléchit…', aiErr: 'L’assistant n’est pas disponible pour le moment. Utilisez le sélecteur ci-dessous ou écrivez-nous à abruens@stratovac.ca.', aiNew: 'Nouvelle conversation', aiLimit: 'Vous avez atteint la limite de questions pour le moment. Réessayez dans une heure, ou écrivez-nous à abruens@stratovac.ca.', aiMic: 'Parler', aiListen: 'Je vous écoute… parlez, puis faites une pause.', aiStop: 'Arrêter la lecture', aiNoMic: 'Micro non autorisé. Autorisez le micro pour ce site dans votre navigateur.', aiNet: 'La reconnaissance vocale de ce navigateur ne répond pas. Essayez avec Microsoft Edge, ou dictez dans la boîte avec la touche Windows + H (sur Mac : touche Fn deux fois).', aiBrave: 'Le navigateur Brave bloque la reconnaissance vocale. Utilisez Chrome, Edge ou Safari pour parler à l’assistant, ou dictez dans la boîte avec la touche Windows + H.', aiNoHear: 'Je n’ai rien entendu. Cliquez le micro et parlez un peu plus fort.', aiYou: 'Vous', aiBot: 'Assistant',
    poBadType: 'Format non accepté. Envoyez un PDF ou une image (PNG, JPG, WEBP).', poBig: 'Fichier trop lourd (15 Mo max).', poDetach: 'Retirer le bon', poFile: 'Bon de commande', poHave: 'Vous avez un bon de commande ? Déposez-le, nous remplissons le panier pour vous.', poGo: 'Déposer mon bon', useSel: 'Usage à préciser', poAtt: 'Bon de commande joint'
  } : {
    poTitle: 'Drop your purchase order here', poSub: 'Drag your PDF (or a photo or screenshot) into this box, or click to choose it. We read the PO and fill the cart; you check everything before confirming.',
    poTypes: 'PDF, PNG, JPG or WEBP, 15 MB max. A Word or Excel document: save it as PDF first.', poReading: 'Reading purchase order {f}…',
    poRead: 'Purchase order {f} read: {n} item(s) added to the cart. Check quantities, use (vacuum or pressure) and the delivery address, then confirm the order.',
    poNone: 'Purchase order {f} attached, but no item matched our catalog. Add the items from the catalog; the PO will be attached to your order.',
    poMiss: 'PO items to confirm with us:', poLow: 'to check', poPrice: 'price on your PO', poErr: 'We could not read this document. Try a PDF, or add the items from the catalog.',
    poAi: 'Purchase order {f} attached. Automatic reading is not active yet: add the items from the catalog and we will check them against your PO.',
    aiT: 'Selection assistant', aiIntro: 'For your questions about our blowers and accessories. Describe your need in your own words (e.g. “200 CFM at 5 psi to aerate a basin”). The assistant finds the blower and shows the results below.', aiPh: 'Your question…', aiSend: 'Send', aiThink: 'The assistant is thinking…', aiErr: 'The assistant is not available right now. Use the selector below or write to abruens@stratovac.ca.', aiNew: 'New conversation', aiLimit: 'You have reached the question limit for now. Try again in an hour, or write to abruens@stratovac.ca.', aiMic: 'Speak', aiListen: 'Listening… speak, then pause.', aiStop: 'Stop reading', aiNoMic: 'Microphone not allowed. Allow the microphone for this site in your browser.', aiNet: 'This browser’s speech recognition is not responding. Try Microsoft Edge, or dictate into the box with Windows key + H (on a Mac: press Fn twice).', aiBrave: 'The Brave browser blocks speech recognition. Use Chrome, Edge or Safari to talk to the assistant, or dictate into the box with Windows key + H.', aiNoHear: 'I did not hear anything. Click the mic and speak a little louder.', aiYou: 'You', aiBot: 'Assistant',
    poBadType: 'Format not accepted. Send a PDF or an image (PNG, JPG, WEBP).', poBig: 'File too large (15 MB max).', poDetach: 'Remove the PO', poFile: 'Purchase order', poHave: 'Have a purchase order? Drop it and we fill the cart for you.', poGo: 'Drop my PO', useSel: 'Use to specify', poAtt: 'Purchase order attached'
  });
  Object.assign(T, FR ? {
    home: 'Accueil', hiName: 'Bonjour {n}', hiSub: 'Que voulez-vous faire aujourd’hui ?', hAskT: 'Décrivez votre besoin', hAskS: 'Parlez ou écrivez : l’assistant trouve le surpresseur et ses accessoires, avec vos prix.', hAskPh: 'Ex. : 200 CFM à 5 psi pour aérer un bassin', hAsk: 'Demander',
    hCatT: 'Parcourir le catalogue', hCatS: 'Tous les surpresseurs et accessoires, avec vos prix et les fiches techniques.', hCat: 'Ouvrir le catalogue', hSel: 'Sélecteur par débit et pression', hRecent: 'Vos dernières commandes', again: 'Commander à nouveau', againDone: 'Articles ajoutés au panier.',
    sol: 'Ajouter la solution complète', solDone: 'Surpresseur, filtre et soupape ajoutés au panier.', solPick: 'Ajouter (choisir vide ou pression)', addOne: 'Ajouter',
    quote: 'Télécharger une soumission (PDF)', quoteT: 'SOUMISSION', quoteNo: 'No', quoteDate: 'Date', quoteValid: 'Valide jusqu’au', quoteFor: 'Préparée pour', quoteDesc: 'Description', quoteQty: 'Qté', quoteUnit: 'Prix unitaire', quoteLine: 'Total', quoteDisc: 'Escompte appliqué',
    quoteNotes: 'Prix en dollars américains (USD), escompte inclus. FOB Longueuil (Québec), transport en sus. Taxes canadiennes selon la province de livraison.', quoteNotesUS: 'Prix en dollars américains (USD), escompte inclus. Expédié de notre entrepôt en Floride : tarifs douaniers inclus, aucuns frais de courtage ni de douane. Transport en sus.', quoteOrder: 'Pour commander : déposez cette soumission ou votre bon de commande sur l’espace client (stratovac.ca/fr/portail), ou écrivez à abruens@stratovac.ca.', quoteMaking: 'Préparation de la soumission…', quoteErr: 'La soumission n’a pas pu être créée. Réessayez.', quoteOk: 'Soumission {n} téléchargée.',
    freight: 'Transport estimé', freightNote: 'estimation, non incluse ; confirmée et facturée à l’expédition', lead: 'Délai', page: 'Page',
    curveT: 'Courbe de performance à 60 Hz (air à 20 °C / 68 °F, niveau de la mer)', curveP: 'Pression', curveV: 'Vide', yourPt: 'Votre point',
    tracking: 'No de suivi', setTitle: 'Transport et délais affichés aux clients', setLeadFr: 'Délai (français), ex. : en stock, expédié sous 3 jours ouvrables', setLeadEn: 'Délai (anglais)', setFreight: 'Transport estimé par surpresseur (USD), selon la taille du moteur', setSmall: 'Moteur ≤ 3 kW', setMed: 'Moteur 3 à 11 kW', setLarge: 'Moteur > 11 kW', setAcc: 'Accessoires seuls (par commande)', setHint: 'Laissez vide pour ne rien afficher. Le transport reste une estimation : il n’est pas ajouté au total payé.',
    region: { QC: 'Québec', ON: 'Ontario', ATL: 'Atlantique', WEST: 'Ouest', NORTH: 'Territoires', US: 'États-Unis' }, emailed: 'Courriel envoyé au client.', noEmail: 'Enregistré. Courriel au client non envoyé (service de courriel pas encore configuré).', quotes: 'Soumissions téléchargées', reorderNone: 'Ces articles ne sont plus au catalogue.'
  } : {
    home: 'Home', hiName: 'Hello {n}', hiSub: 'What would you like to do today?', hAskT: 'Describe your need', hAskS: 'Speak or type: the assistant finds the blower and its accessories, with your prices.', hAskPh: 'E.g. 200 CFM at 5 psi to aerate a basin', hAsk: 'Ask',
    hCatT: 'Browse the catalog', hCatS: 'All blowers and accessories, with your prices and datasheets.', hCat: 'Open the catalog', hSel: 'Selector by flow and pressure', hRecent: 'Your latest orders', again: 'Order again', againDone: 'Items added to the cart.',
    sol: 'Add the complete solution', solDone: 'Blower, filter and relief valve added to the cart.', solPick: 'Add (choose vacuum or pressure)', addOne: 'Add',
    quote: 'Download a quote (PDF)', quoteT: 'QUOTATION', quoteNo: 'No.', quoteDate: 'Date', quoteValid: 'Valid until', quoteFor: 'Prepared for', quoteDesc: 'Description', quoteQty: 'Qty', quoteUnit: 'Unit price', quoteLine: 'Total', quoteDisc: 'Discount applied',
    quoteNotes: 'Prices in US dollars (USD), discount included. FOB Longueuil (Quebec), freight extra. Canadian taxes according to the delivery province.', quoteNotesUS: 'Prices in US dollars (USD), discount included. Ships from our warehouse in Florida: tariffs included, no brokerage or customs fees. Freight extra.', quoteOrder: 'To order: drop this quote or your purchase order on the customer portal (stratovac.ca/portal), or write to abruens@stratovac.ca.', quoteMaking: 'Preparing the quote…', quoteErr: 'The quote could not be created. Try again.', quoteOk: 'Quote {n} downloaded.',
    freight: 'Estimated freight', freightNote: 'estimate, not included; confirmed and invoiced at shipping', lead: 'Lead time', page: 'Page',
    curveT: '60 Hz performance curve (air at 68 °F / 20 °C, sea level)', curveP: 'Pressure', curveV: 'Vacuum', yourPt: 'Your point',
    tracking: 'Tracking no.', setTitle: 'Freight and lead time shown to customers', setLeadFr: 'Lead time (French)', setLeadEn: 'Lead time (English), e.g. in stock, ships within 3 business days', setFreight: 'Estimated freight per blower (USD), by motor size', setSmall: 'Motor ≤ 3 kW', setMed: 'Motor 3 to 11 kW', setLarge: 'Motor > 11 kW', setAcc: 'Accessories only (per order)', setHint: 'Leave empty to show nothing. Freight stays an estimate: it is not added to the total paid.',
    region: { QC: 'Quebec', ON: 'Ontario', ATL: 'Atlantic', WEST: 'West', NORTH: 'Territories', US: 'United States' }, emailed: 'Email sent to the customer.', noEmail: 'Saved. Customer email not sent (email service not set up yet).', quotes: 'Downloaded quotes', reorderNone: 'These items are no longer in the catalog.'
  });
  Object.assign(T, FR ? {
    plate: 'Photo de la plaque', plateT: 'Prenez en photo la plaque signalétique de votre surpresseur actuel : nous proposons le modèle ID équivalent.', plateReading: 'Lecture de la plaque…', plateBad: 'La plaque n’est pas lisible. Reprenez la photo de plus près, bien éclairée et sans reflet.', plateMsg: 'Je veux remplacer mon surpresseur actuel. Plaque signalétique :', plateYou: '📷 Photo de la plaque de mon surpresseur actuel',
    talk: 'Parler à Anthony', talkT: 'Écrire à Anthony', talkS: 'Anthony reçoit votre conversation avec l’assistant et votre panier, et vous répond par courriel.', talkPh: 'Votre message (facultatif)', talkSend: 'Envoyer à Anthony', talkOk: 'C’est envoyé. Anthony vous répondra par courriel à {e}.', talkErr: 'Le message n’a pas pu être envoyé. Écrivez directement à abruens@stratovac.ca.',
    energy: 'Électricité / an', hours: 'Heures / an', rate: '$ US / kWh', energyNote: 'Coût d’électricité estimé : puissance au point, moteur à 90 % de rendement, selon vos heures et votre tarif.',
    report: 'Rapport technique (PDF)', repT: 'RAPPORT DE SÉLECTION', repCond: 'Conditions de service', repRes: 'Résultat au point de fonctionnement', repAcc: 'Accessoires recommandés', repUse: 'Service', repFlowReq: 'Débit demandé', repLevel: 'Pression / vide', repGas: 'Gaz', repAlt: 'Altitude', repTemp: 'Température à l’aspiration', repVolt: 'Moteur', repFlowAt: 'Débit au point', repMargin: 'Marge de débit', repPow: 'Puissance absorbée au point', repLim: 'Limite du modèle', repEnergy: 'Électricité estimée', repEq: 'Point équivalent en air (courbes)', repNote: 'Sélection calculée sur les courbes de performance à 60 Hz, air à 20 °C (68 °F) au niveau de la mer, tolérance ±10 %, corrigée selon la densité du gaz aux conditions indiquées. Document technique sans valeur contractuelle ; la soumission fait foi pour les prix.', repFilter: 'Filtre', repValve: 'Soupape de sûreté', repCart: 'Cartouche de rechange', repPrepared: 'Préparé pour', repMaking: 'Préparation du rapport…',
    team: 'Votre équipe', teamNone: 'Votre compte n’est pas relié à des collègues. Pour ajouter un acheteur ou un collègue de votre entreprise, demandez-lui de créer un compte, puis écrivez-nous : nous relions les comptes.', approveSend: 'Envoyer pour approbation', approveSent: 'Panier envoyé à votre équipe pour approbation.', approveErr: 'Le panier n’a pas pu être envoyé.', toApprove: 'Paniers à approuver', mySent: 'Paniers que vous avez envoyés', load: 'Charger dans mon panier', dismiss: 'Ignorer', loaded: 'Panier chargé : vérifiez et commandez.', by: 'par', stOpen: 'en attente', stOrdered: 'repris', stDismissed: 'ignoré', orgLink: 'Même entreprise que', orgNone: '— aucun —', orgSaved: 'Comptes reliés.',
    carrier: 'Transporteur', track: 'Suivre le colis', steps: ['Reçue', 'Confirmée', 'En préparation', 'Expédiée'],
    cadNote: '≈ {v} $ CA', cadBasis: 'Montant en dollars canadiens à titre indicatif (taux de la Banque du Canada du {d}). Le prix et le paiement sont en dollars américains.',
    cadT: 'Plans et fichiers 3D', cadNone: 'Plans et fichiers 3D disponibles sur demande.', cadUp: 'Ajouter des fichiers (admin)', cadDel: 'Supprimer',
    tryPublic: 'Pas encore de compte ? Essayez l’assistant de sélection sans compte.'
  } : {
    plate: 'Nameplate photo', plateT: 'Take a photo of the nameplate of your current blower: we propose the equivalent ID model.', plateReading: 'Reading the nameplate…', plateBad: 'The nameplate is not readable. Take the photo closer, well lit and without glare.', plateMsg: 'I want to replace my current blower. Nameplate:', plateYou: '📷 Photo of my current blower’s nameplate',
    talk: 'Talk to Anthony', talkT: 'Write to Anthony', talkS: 'Anthony receives your conversation with the assistant and your cart, and answers you by email.', talkPh: 'Your message (optional)', talkSend: 'Send to Anthony', talkOk: 'Sent. Anthony will answer you by email at {e}.', talkErr: 'The message could not be sent. Write directly to abruens@stratovac.ca.',
    energy: 'Electricity / yr', hours: 'Hours / yr', rate: 'US$ / kWh', energyNote: 'Estimated electricity cost: power at the point, 90 % motor efficiency, with your hours and rate.',
    report: 'Technical report (PDF)', repT: 'SELECTION REPORT', repCond: 'Service conditions', repRes: 'Result at the operating point', repAcc: 'Recommended accessories', repUse: 'Service', repFlowReq: 'Required flow', repLevel: 'Pressure / vacuum', repGas: 'Gas', repAlt: 'Altitude', repTemp: 'Inlet temperature', repVolt: 'Motor', repFlowAt: 'Flow at the point', repMargin: 'Flow margin', repPow: 'Power absorbed at the point', repLim: 'Model limit', repEnergy: 'Estimated electricity', repEq: 'Equivalent air point (curves)', repNote: 'Selection calculated from the 60 Hz performance curves, air at 68 °F (20 °C) at sea level, ±10 % tolerance, corrected for the gas density at the stated conditions. Technical document, not contractual; prices are given by the quotation.', repFilter: 'Filter', repValve: 'Relief valve', repCart: 'Spare cartridge', repPrepared: 'Prepared for', repMaking: 'Preparing the report…',
    team: 'Your team', teamNone: 'Your account is not linked to colleagues. To add a buyer or a colleague from your company, ask them to create an account, then write to us: we link the accounts.', approveSend: 'Send for approval', approveSent: 'Cart sent to your team for approval.', approveErr: 'The cart could not be sent.', toApprove: 'Carts to approve', mySent: 'Carts you sent', load: 'Load into my cart', dismiss: 'Dismiss', loaded: 'Cart loaded: review and order.', by: 'by', stOpen: 'pending', stOrdered: 'taken', stDismissed: 'dismissed', orgLink: 'Same company as', orgNone: '— none —', orgSaved: 'Accounts linked.',
    carrier: 'Carrier', track: 'Track the package', steps: ['Received', 'Confirmed', 'In preparation', 'Shipped'],
    cadNote: '≈ CA${v}', cadBasis: 'Canadian dollar amount for information only (Bank of Canada rate of {d}). Price and payment are in US dollars.',
    cadT: 'Drawings and 3D files', cadNone: 'Drawings and 3D files available on request.', cadUp: 'Add files (admin)', cadDel: 'Delete',
    tryPublic: 'No account yet? Try the selection assistant without an account.'
  });
  var CARRIERS = { purolator: ['Purolator', 'https://www.purolator.com/en/shipping/tracker?pin='], ups: ['UPS', 'https://www.ups.com/track?tracknum='], fedex: ['FedEx', 'https://www.fedex.com/fedextrack/?trknbr='], canpar: ['Canpar', 'https://www.canpar.com/en/tracking/track.htm?barcode='], dhl: ['DHL', 'https://www.dhl.com/ca-en/home/tracking/tracking-express.html?submit=1&tracking-id='], canadapost: ['Postes Canada / Canada Post', 'https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor='], other: [FR ? 'Autre' : 'Other', ''] };
  var PROV = [['QC', 'Québec'], ['ON', 'Ontario'], ['NB', 'New Brunswick / Nouveau-Brunswick'], ['NS', 'Nova Scotia / Nouvelle-Écosse'], ['PE', 'PEI / Î.-P.-É.'], ['NL', 'Newfoundland / Terre-Neuve'], ['MB', 'Manitoba'], ['SK', 'Saskatchewan'], ['AB', 'Alberta'], ['BC', 'British Columbia / C.-B.'], ['YT', 'Yukon'], ['NT', 'NWT / T.N.-O.'], ['NU', 'Nunavut']];
  var TAX = { QC: [['TPS/GST', 5], ['TVQ/QST', 9.975]], ON: [['TVH/HST', 13]], NB: [['TVH/HST', 15]], NL: [['TVH/HST', 15]], PE: [['TVH/HST', 15]], NS: [['TVH/HST', 14]], BC: [['TPS/GST', 5]], AB: [['TPS/GST', 5]], SK: [['TPS/GST', 5]], MB: [['TPS/GST', 5]], YT: [['TPS/GST', 5]], NT: [['TPS/GST', 5]], NU: [['TPS/GST', 5]] };

  var root = document.getElementById('portal');
  if (!root) return;
  if (!CFG.url || !window.supabase) { root.innerHTML = '<p class="pt-note">' + (FR ? 'Espace client bientôt disponible.' : 'Customer portal coming soon.') + '</p>'; return; }
  var sb = window.supabase.createClient(CFG.url, CFG.key);
  var S = { user: null, prof: null, prods: [], bySku: {}, tab: 'home', set: {}, f: { q: '', fam: '', v: '6', st: '', min: '' } };
  var cart = []; try { cart = JSON.parse(localStorage.getItem('sv_portal_cart') || '[]'); } catch (e) { cart = []; }
  function saveCart() { try { localStorage.setItem('sv_portal_cart', JSON.stringify(cart)); } catch (e) {} }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function r2(n) { return Math.round(n * 100) / 100; }
  function usd(n) { return n == null ? T.onReq : (FR ? n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $ US' : 'US$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })); }
  function cad(n) { return S.fx && n != null ? T.cadNote.replace('{v}', (n * S.fx.rate).toLocaleString(FR ? 'fr-CA' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : ''; }
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
    html += '<p class="pt-note"><a href="' + (FR ? '/fr/assistant-selection/' : '/selection-assistant/') + '">' + T.tryPublic + '</a></p>';
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
    var tabs = [['home', T.home], ['sel', T.sel], ['cat', T.cat], ['cart', T.cart + (n ? ' (' + n + ')' : '')], ['orders', T.orders], ['account', T.account]];
    if (S.prof && S.prof.is_admin) tabs.push(['admin', T.admin]);
    var bar = '<div class="pt-bar"><div class="pt-tabs" role="tablist">' + tabs.map(function (t) { return '<button type="button" data-t="' + t[0] + '" aria-selected="' + (S.tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div><div class="pt-who"><span>' + esc(S.prof.company || S.prof.email) + (disc() ? ' · ' + T.yourDisc + ' ' + num(disc()) + ' %' : '') + '</span><button class="pt-link" type="button" id="pt-out-btn">' + T.logout + '</button></div></div><div id="pt-view"></div>';
    root.innerHTML = bar;
    root.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { S.tab = b.dataset.t; history.replaceState(null, '', '#' + S.tab); shell(); }; });
    $('pt-out-btn').onclick = function () { sb.auth.signOut(); };
    if (S.tab === 'prod') return productView($('pt-view'));
    if (S.tab === 'sel') return selView($('pt-view'));
    ({ home: homeView, cat: catView, cart: cartView, orders: ordersView, account: accountView, admin: adminView }[S.tab] || homeView)($('pt-view'));
  }

  // ---------- catalogue ----------
  function catView(el) {
    var f = S.f;
    el.innerHTML = '<p class="pt-pohint">' + T.poHave + ' <button class="pt-link" type="button" id="pt-pogo">' + T.poGo + ' →</button></p><h2 class="pt-h">' + T.blowers + '</h2><div class="pt-filters">' +
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
        return '<tr><td><a class="pt-model" href="#p/' + encodeURIComponent(p.sku) + '"><strong>' + esc(p.sku) + '</strong></a><br><small>' + esc(pname(p)) + (s.double_flow ? ', ' + T.dbl : '') + '</small>' + '</td><td>' + num(s.cfm, 0) + ' · ' + num(s.m3h, 0) + '</td><td>' + num(s.hp) + ' · ' + num(s.kw) + '</td><td>' + s.stages + '</td><td>' + vlabel(s.volt) + '</td><td>' + esc(s.port || '') + '</td><td class="r pt-old">' + usd(p.list_price == null ? null : Number(p.list_price)) + '</td><td class="r"><strong>' + usd(net(p.list_price)) + '</strong>' + (S.fx && p.list_price != null ? '<br><small>' + cad(net(p.list_price)) + '</small>' : '') + '</td><td><button class="pt-add" type="button" data-b="' + esc(p.sku) + '"' + (p.list_price == null ? ' disabled' : '') + '>' + T.add + '</button></td></tr>';
      }).join('') || '<tr><td colspan="9">' + T.none + '</td></tr>';
      $('pt-rows').querySelectorAll('[data-b]').forEach(function (b) { b.onclick = function () { blowerDialog(S.bySku[b.dataset.b]); }; });
    }
    $('pt-acc').innerHTML = S.prods.filter(function (p) { return p.kind !== 'blower'; }).map(function (p) {
      return '<tr><td><strong>' + esc(p.sku) + '</strong></td><td>' + esc(pname(p)) + (p.acc && p.acc.cartridge ? '<br><small>' + T.spare + ' : ' + esc(p.acc.cartridge) + '</small>' : '') + '</td><td>' + esc(p.specs.port || '') + (p.specs.scfm ? ' · ' + p.specs.scfm + ' SCFM' : '') + '</td><td class="r pt-old">' + usd(Number(p.list_price)) + '</td><td class="r"><strong>' + usd(net(p.list_price)) + '</strong></td><td><button class="pt-add" type="button" data-a="' + esc(p.sku) + '">' + T.add + '</button></td></tr>';
    }).join('');
    $('pt-acc').querySelectorAll('[data-a]').forEach(function (b) { b.onclick = function () { addLine(b.dataset.a, 1, null); flash(b); }; });
    $('pt-pogo').onclick = function () { S.tab = 'cart'; history.replaceState(null, '', '#cart'); shell(); };
    [['pf-q', 'q'], ['pf-fam', 'fam'], ['pf-v', 'v'], ['pf-st', 'st'], ['pf-min', 'min']].forEach(function (x) { $(x[0]).oninput = $(x[0]).onchange = function () { f[x[1]] = $(x[0]).value; rows(); }; });
    rows();
  }
  function dsLink(p) { return p.datasheet ? '<br><button class="pt-link" type="button" data-ds="' + esc(p.datasheet) + '">' + T.datasheet + ' (PDF)</button>' : ''; }
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-ds]'); if (!b) return;
    sb.storage.from('datasheets').createSignedUrl(b.dataset.ds, 600).then(function (r) { if (r.data) window.open(r.data.signedUrl, '_blank', 'noopener'); });
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pof]'); if (!b) return;
    sb.storage.from('po-uploads').createSignedUrl(b.dataset.pof, 600).then(function (r) { if (r.data) window.open(r.data.signedUrl, '_blank', 'noopener'); });
  });
  function flash(b) { var t = b.textContent; b.textContent = '✓'; setTimeout(function () { b.textContent = t; }, 1200); shellCount(); }
  function shellCount() { var n = cart.reduce(function (s, l) { return s + l.qty; }, 0), b = root.querySelector('[data-t="cart"]'); if (b) b.textContent = T.cart + (n ? ' (' + n + ')' : ''); }
  function addLine(sku, qty, mode) {
    var l = cart.filter(function (x) { return x.sku === sku && (x.mode || null) === (mode || null); })[0];
    if (l) l.qty = Math.min(50, l.qty + qty); else cart.push({ sku: sku, qty: qty, mode: mode || null });
    saveCart();
  }

  // vacuum / pressure dialog with recommended filter + relief valve
  function blowerDialog(p, preset) {
    var dlg = h('div', { class: 'pt-dlg-bg' }), box = h('div', { class: 'pt-dlg', role: 'dialog', 'aria-modal': 'true', 'aria-label': p.sku });
    dlg.appendChild(box); document.body.appendChild(dlg);
    var mode = preset || null;
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

  // ---------- selector: flow + pressure/vacuum -> blowers that do the job ----------
  var DP = { inH2O: 1, psi: 27.7076, bar: 401.865, mbar: 0.401865, kPa: 4.01865, inHg: 13.5951 };
  var QU = { CFM: 1, 'm³/h': 0.588578, 'L/min': 0.0353147 };
  function lerp(c, x) { if (!c || !c.length || x < c[0][0] || x > c[c.length - 1][0]) return null; for (var i = 1; i < c.length; i++) if (x <= c[i][0]) { var a = c[i - 1], b = c[i]; return b[0] === a[0] ? a[1] : a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return c[c.length - 1][1]; }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  function aiMsg(m, idx) {
    var t = esc(m.content).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\b(ID[A-Z]{1,4}[0-9A-Z.\-]*[0-9A-Z])\b/g, function (x) { return S.bySku[x] ? '<a class="pt-model" href="#p/' + encodeURIComponent(x) + '"><strong>' + x + '</strong></a>' : x; }).replace(/\n/g, '<br>');
    return '<div class="pt-ai-m pt-ai-' + (m.role === 'user' ? 'u' : 'a') + '"><small>' + (m.role === 'user' ? T.aiYou : T.aiBot) + '</small><p>' + t + '</p>' + aiActions(m, idx) + '</div>';
  }
  function selView(el) {
    var f = S.selF || (S.selF = { mode: 'press', q: '', qu: 'CFM', dp: '', du: 'psi', v: '6' });
    if (f.h == null) f.h = '8760'; if (f.r == null) f.r = '0.10';
    function opts(o, cur) { return Object.keys(o).map(function (k) { return '<option' + (k === cur ? ' selected' : '') + '>' + k + '</option>'; }).join(''); }
    var ai = S.ai || (S.ai = { msgs: [], busy: false });
    el.innerHTML = '<section class="pt-ai" aria-label="' + T.aiT + '"><div class="pt-ai-hd"><h2 class="pt-h">' + T.aiT + '</h2>' + '<span class="pt-acts">' + '<button class="pt-link" type="button" id="ai-talk">' + T.talk + '</button>' + (ai.msgs.length ? '<button class="pt-link" type="button" id="ai-new">' + T.aiNew + '</button>' : '') + '</span></div><p class="pt-note">' + T.aiIntro + '</p>' +
      '<div id="ai-log" class="pt-ai-log" aria-live="polite">' + ai.msgs.map(function (m, i) { return aiMsg(m, i); }).join('') + (ai.busy ? '<p class="pt-note">' + T.aiThink + '</p>' : '') + '</div>' +
      '<form id="ai-f" class="pt-ai-f">' + (SR || window.MediaRecorder ? '<button class="pt-mic' + (ai.listening ? ' on' : '') + '" type="button" id="ai-mic" aria-label="' + T.aiMic + '" title="' + T.aiMic + '"' + (ai.busy ? ' disabled' : '') + '><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z"/></svg></button>' : '') + '<label class="pt-cam" title="' + T.plateT + '"><input type="file" id="ai-cam" accept="image/*" capture="environment"' + (ai.busy ? ' disabled' : '') + '><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M9 4 7.2 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.2L15 4H9Zm3 4.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/></svg><span class="pt-vh">' + T.plate + '</span></label>' + '<textarea id="ai-in" rows="2" placeholder="' + T.aiPh + '" aria-label="' + T.aiPh + '"' + (ai.busy ? ' disabled' : '') + '></textarea><button class="btn btn--solid" type="submit"' + (ai.busy ? ' disabled' : '') + '>' + T.aiSend + '</button></form>' + (ai.listening ? '<p class="pt-note" role="status">' + T.aiListen + '</p>' : '') + (ai.speaking ? '<button class="pt-link" type="button" id="ai-shh">' + T.aiStop + '</button>' : '') + '</section>' +
      '<h2 class="pt-h" style="margin-top:6px">' + T.sel + '</h2><p class="pt-note" style="margin-top:0">' + T.selIntro + '</p>' +
      '<form id="sf" class="pt-selform"><div class="pt-seg pt-seg--sm"><button type="button" data-m="press" aria-pressed="' + (f.mode === 'press') + '">' + T.press + '</button><button type="button" data-m="vac" aria-pressed="' + (f.mode === 'vac') + '">' + T.vac + '</button></div>' +
      '<label>' + T.flow + '<span class="pt-in"><input id="sf-q" type="number" min="0" step="any" required value="' + esc(f.q) + '"><select id="sf-qu">' + opts(QU, f.qu) + '</select></span></label>' +
      '<label id="sf-dpl">' + (f.mode === 'vac' ? T.vacLvl : T.pressLvl) + '<span class="pt-in"><input id="sf-dp" type="number" min="0" step="any" required value="' + esc(f.dp) + '"><select id="sf-du">' + opts(DP, f.du) + '</select></span></label>' +
      '<label>' + T.volt + '<select id="sf-v"><option value="6"' + (f.v === '6' ? ' selected' : '') + '>' + T.v6 + '</option><option value="5"' + (f.v === '5' ? ' selected' : '') + '>' + T.v5 + '</option><option value="3"' + (f.v === '3' ? ' selected' : '') + '>' + T.v3 + '</option></select></label>' +
      '<label>' + T.hours + '<input id="sf-h" type="number" min="1" max="8760" step="1" value="' + esc(f.h) + '" style="width:110px"></label><label>' + T.rate + '<input id="sf-r" type="number" min="0" step="0.01" value="' + esc(f.r) + '" style="width:100px"></label>' +
      '<button class="btn btn--solid" type="submit">' + T.find + '</button></form><div id="sf-out"></div><p class="pt-note">' + T.selNote + '</p>';
    el.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { read(); f.mode = b.dataset.m; if (f.mode === 'vac' && f.du === 'psi') f.du = 'inHg'; if (f.mode === 'press' && f.du === 'inHg') f.du = 'psi'; selView(el); }; });
    function read() { f.q = v('sf-q'); f.qu = v('sf-qu'); f.dp = v('sf-dp'); f.du = v('sf-du'); f.v = v('sf-v'); f.h = v('sf-h') || '8760'; f.r = v('sf-r') || '0.10'; }
    $('sf').onsubmit = function (e) { e.preventDefault(); read(); run(); };
    var log = $('ai-log'); log.scrollTop = log.scrollHeight;
    if ($('ai-new')) $('ai-new').onclick = function () { S.ai = { msgs: [], busy: false }; selView(el); };
    $('ai-talk').onclick = function () { talkDialog(); };
    $('ai-cam').onchange = function () {
      var file = $('ai-cam').files[0]; if (!file) return;
      ai.msgs.push({ role: 'user', content: T.plateYou, local: true }); ai.busy = true; selView(el);
      shrink(file, 1600).then(function (img) { return sb.functions.invoke('read-plate', { body: { image: img.b64, mime: 'image/jpeg' } }); }).then(function (r) {
        ai.busy = false; var pl = r.data && r.data.plate;
        if (!pl || !pl.readable) { ai.msgs.pop(); aiNote(r.error && r.error.context && r.error.context.status === 429 ? T.aiLimit : T.plateBad); return; }
        var parts = [];
        if (pl.power_kw) parts.push(num(pl.power_kw) + ' kW'); else if (pl.power_hp) parts.push(num(pl.power_hp) + ' HP');
        if (pl.voltage) parts.push(pl.voltage + ' V' + (pl.phase ? (pl.phase === 1 ? (FR ? ' monophasé' : ' single-phase') : (FR ? ' triphasé' : ' three-phase')) : ''));
        if (pl.hz) parts.push(pl.hz + ' Hz'); if (pl.rpm) parts.push(pl.rpm + (FR ? ' tr/min' : ' rpm'));
        if (pl.max_flow) parts.push((FR ? 'débit max ' : 'max flow ') + pl.max_flow + ' ' + (pl.max_flow_unit || ''));
        if (pl.max_pressure) parts.push((FR ? 'pression max ' : 'max pressure ') + pl.max_pressure + ' ' + (pl.level_unit || ''));
        if (pl.max_vacuum) parts.push((FR ? 'vide max ' : 'max vacuum ') + pl.max_vacuum + ' ' + (pl.level_unit || ''));
        if (pl.stages) parts.push(pl.stages + (FR ? ' étage(s)' : ' stage(s)'));
        if (!parts.length) { ai.msgs.pop(); aiNote(T.plateBad); return; }
        ai.msgs.pop(); selView(el); $('ai-in').value = T.plateMsg + ' ' + parts.join(', ') + '.'; $('ai-f').requestSubmit();
      }).catch(function () { ai.busy = false; ai.msgs.pop(); aiNote(T.plateBad); });
    };
    $('ai-in').onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('ai-f').requestSubmit(); } };
    $('ai-f').onsubmit = function (e) {
      e.preventDefault(); var q = v('ai-in'); if (!q || ai.busy) return;
      read(); var byVoice = ai.voice; ai.voice = false; ai.msgs.push({ role: 'user', content: q.slice(0, 2000) }); ai.busy = true; selView(el);
      sb.functions.invoke('assistant', { body: { messages: ai.msgs, lang: FR ? 'fr' : 'en' } }).then(function (r) {
        var d = r.data || {}; ai.busy = false;
        if (r.error || !d.reply) { var st = r.error && r.error.context && r.error.context.status; ai.msgs.push({ role: 'assistant', content: st === 429 ? T.aiLimit : T.aiErr, err: true }); }
        else { ai.msgs.push({ role: 'assistant', content: d.reply, mode: d.mode || null, report: d.report || null }); if (d.selector) Object.assign(f, d.selector); if (byVoice) say(d.reply); }
        if (S.tab === 'sel') selView(el);
        if (d.selector && $('sf-out')) $('sf-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }).catch(function () { ai.busy = false; ai.msgs.push({ role: 'assistant', content: T.aiErr, err: true }); if (S.tab === 'sel') selView(el); });
    };
    if (!ai.busy && !ai.listening) $('ai-in').focus({ preventScroll: true });
    if ($('ai-shh')) $('ai-shh').onclick = function () { try { speechSynthesis.cancel(); } catch (e) {} ai.speaking = false; selView(el); };
    function aiNote(t) { ai.msgs.push({ role: 'assistant', content: t, err: true }); selView(el); }
    function sendVoice(text) { selView(el); $('ai-in').value = text; ai.voice = true; $('ai-f').requestSubmit(); }
    if ($('ai-mic')) $('ai-mic').onclick = function () {
      if (ai.listening) { if (ai.stop) ai.stop(); return; }
      try { speechSynthesis.cancel(); } catch (e) {} ai.speaking = false;
      if (window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !ai.noStt) return record();
      browserSR();
    };
    // record the voice and have the server transcribe it (works in every browser, Brave included)
    function record() {
      navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(function (stream) {
        var mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'].filter(function (m) { return MediaRecorder.isTypeSupported(m); })[0] || '';
        var mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined), chunks = [], spoke = false, quiet = 0, t0 = Date.now();
        var AC = window.AudioContext || window.webkitAudioContext, ac = AC ? new AC() : null, an = null, buf = null, tick = null;
        if (ac) { an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(stream).connect(an); buf = new Float32Array(an.fftSize); }
        mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        ai.stop = function () { try { if (mr.state !== 'inactive') mr.stop(); } catch (e) {} };
        tick = setInterval(function () {
          var el2 = Date.now() - t0;
          if (an) { an.getFloatTimeDomainData(buf); var sum = 0; for (var i = 0; i < buf.length; i++) sum += buf[i] * buf[i]; var rms = Math.sqrt(sum / buf.length); if (rms > 0.02) { spoke = true; quiet = 0; } else if (spoke) quiet += 100; }
          else spoke = true;
          if ((spoke && quiet >= 1500) || el2 > 30000 || (!spoke && el2 > 8000)) ai.stop();
        }, 100);
        mr.onstop = function () {
          clearInterval(tick); stream.getTracks().forEach(function (t) { t.stop(); }); try { if (ac) ac.close(); } catch (e) {}
          ai.listening = false; ai.stop = null;
          if (!spoke || !chunks.length) return aiNote(T.aiNoHear);
          var blob = new Blob(chunks, { type: mr.mimeType || mime || 'audio/webm' });
          if (blob.size > 2500000) return aiNote(T.aiNoHear);
          ai.busy = true; selView(el);
          var fr = new FileReader();
          fr.onload = function () {
            var b64 = String(fr.result).split(',')[1];
            sb.functions.invoke('transcribe', { body: { audio: b64, mime: blob.type, lang: FR ? 'fr' : 'en' } }).then(function (r) {
              ai.busy = false; var d = r.data || {};
              var txt = String(d.text || '').replace(/\[?\b\d{1,2}:\d{2}(:\d{2})?\b\]?/g, ' ').trim();
              if (/[A-Za-zÀ-ÿ]{2}/.test(txt)) return sendVoice(txt);
              if (!r.error) return aiNote(T.aiNoHear);
              var ctx = r.error.context;
              (ctx && ctx.json ? ctx.json().catch(function () { return {}; }) : Promise.resolve({})).then(function (j) {
                if (j.error === 'stt_unavailable') { ai.noStt = true; selView(el); return browserSR(); }
                aiNote(T.aiNet);
              });
            }).catch(function () { ai.busy = false; aiNote(T.aiNet); });
          };
          fr.readAsDataURL(blob);
        };
        mr.start(250); ai.listening = true; selView(el);
      }).catch(function () { ai.listening = false; aiNote(T.aiNoMic); });
    }
    // fallback: the browser's own dictation (Chrome, Edge, Safari; not Brave or Firefox)
    function browserSR() {
      if (!SR || navigator.brave) return aiNote(T.aiBrave);
      var rec = new SR(); ai.stop = function () { try { rec.stop(); } catch (e) {} }; rec.lang = FR ? 'fr-CA' : 'en-US'; rec.interimResults = true; rec.continuous = false;
      var heard = '';
      rec.onresult = function (e) { heard = Array.prototype.map.call(e.results, function (r) { return r[0].transcript; }).join(' '); var t = $('ai-in'); if (t) t.value = heard; };
      rec.onerror = function (e) { ai.micErr = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? T.aiNoMic : e.error === 'network' ? T.aiNet : e.error === 'no-speech' ? T.aiNoHear : e.error === 'aborted' ? '' : T.aiNet; };
      var guard = setTimeout(function () { try { rec.abort(); } catch (e) {} }, 15000);
      rec.onend = function () {
        clearTimeout(guard); ai.listening = false; ai.stop = null;
        if (heard.trim()) sendVoice(heard.trim());
        else { selView(el); if (ai.micErr) { ai.msgs.push({ role: 'assistant', content: ai.micErr, err: true }); ai.micErr = ''; selView(el); } }
      };
      ai.listening = true; selView(el);
      // use on-device recognition when the browser offers it (no dependence on the browser's cloud service)
      (SR.available ? SR.available({ langs: [rec.lang], processLocally: true }).catch(function () { return 'unavailable'; }) : Promise.resolve('unavailable')).then(function (st) {
        if (st === 'available') rec.processLocally = true;
        try { rec.start(); } catch (e) { clearTimeout(guard); ai.listening = false; aiNote(T.aiNet); }
      });
    }
    function say(text) {
      if (!window.speechSynthesis) return;
      var clean = text.replace(/\*\*/g, '').replace(/^\s*[-•]\s*/gm, '').replace(/m³\/h/g, FR ? 'mètres cubes heure' : 'cubic meters per hour').replace(/\bCFM\b/g, 'C F M').replace(/\$ US|US\$/g, FR ? 'dollars américains' : 'US dollars');
      var u = new SpeechSynthesisUtterance(clean); u.lang = FR ? 'fr-CA' : 'en-US'; u.rate = 1.05;
      var vs = speechSynthesis.getVoices().filter(function (x) { return x.lang && x.lang.toLowerCase().indexOf(FR ? 'fr' : 'en') === 0; });
      u.voice = vs.filter(function (x) { return /ca/i.test(x.lang); })[0] || vs[0] || null;
      u.onend = function () { ai.speaking = false; if (S.tab === 'sel' && $('ai-shh')) $('ai-shh').remove(); };
      speechSynthesis.cancel(); ai.speaking = true; speechSynthesis.speak(u);
    }
    if (f.q && f.dp) run();
    function run() {
      var out = $('sf-out'), Q = Number(f.q) * QU[f.qu], dp = Number(f.dp) * DP[f.du];
      if (!(Q > 0) || !(dp >= 0)) return;
      out.innerHTML = '<p class="pt-note">' + T.working + '</p>';
      (S.curves ? Promise.resolve() : sb.from('perf_curves').select('*').then(function (r) { S.curves = {}; (r.data || []).forEach(function (x) { S.curves[x.frame] = x.data; }); })).then(function () {
        var press = f.mode === 'press', res = [], pair = [];
        S.prods.forEach(function (p) {
          if (p.kind !== 'blower' || !p.specs.perf || p.sku.slice(-1) !== f.v || p.list_price == null) return;
          var pf = p.specs.perf, cv = S.curves[pf.frame]; if (!cv) return;
          var lim = press ? pf.max_p : pf.max_v; if (!lim || dp > lim) return;
          var qa = lerp(press ? cv.flow_press : cv.flow_vac, dp); if (qa == null) return;
          var hp = lerp(press ? cv.power_press : cv.power_vac, dp);
          var r = { p: p, qa: qa, hp: hp, lim: lim, est: pf.est, price: net(p.list_price) };
          if (qa >= Q) res.push(r); else if (qa * 2 >= Q) pair.push(r);
        });
        res.sort(function (a, b) { return a.price - b.price || b.qa - a.qa; });
        pair.sort(function (a, b) { return a.price - b.price; });
        var head = '<p class="pt-point">' + T.point + ' <strong>' + num(Q, 0) + ' CFM · ' + num(Q / 0.588578, 0) + ' m³/h</strong> ' + T.at + ' <strong>' + (press ? '' : '−') + num(dp / DP.psi, 2) + ' psi · ' + num(dp / DP.mbar, 0) + ' mbar · ' + num(dp, 1) + ' inH₂O</strong>' + (press ? '' : ' (' + num(dp / DP.inHg, 2) + ' inHg)') + '</p>';
        function rows(list, k) {
          return '<div class="pt-tw"><table class="pt-t"><thead><tr><th>' + T.model + '</th><th>' + T.flowAt + '<br><small>CFM · m³/h</small></th><th>' + T.margin + '</th><th>' + T.maxDp + '<br><small>psi · mbar</small></th>' + '<th>' + T.powerAt + '<br><small>HP · kW</small></th><th class="r">' + T.energy + '</th><th class="r">' + T.yours + '</th><th></th></tr></thead><tbody>' +
            list.slice(0, 15).map(function (r, i) {
              var s = r.p.specs;
              return '<tr' + (i === 0 ? ' class="pt-best"' : '') + '><td>' + (k > 1 ? '<strong>2 ×</strong> ' : '') + '<a class="pt-model" href="#p/' + encodeURIComponent(r.p.sku) + '"><strong>' + esc(r.p.sku) + '</strong></a>' + (i === 0 && k === 1 ? ' <span class="pt-tag">' + T.cheapest + '</span>' : '') + '<br><small>' + (s.double_flow ? T.dbl : s.stages + ' ' + T.stg) + ' · ' + num(s.kw) + ' kW · ' + esc(s.port || '') + '</small></td>' +
                '<td>' + num(r.qa * k, 0) + ' · ' + num(r.qa * k / 0.588578, 0) + '</td><td>+' + num((r.qa * k / Q - 1) * 100, 0) + ' %</td><td>' + num(r.lim / DP.psi, 2) + ' · ' + num(r.lim / DP.mbar, 0) + (r.est ? '<br><small>' + T.est + '</small>' : '') + '</td>' +
                '<td>' + (r.hp != null ? num(r.hp * k, 2) + ' · ' + num(r.hp * k * 0.7457, 2) : '–') + '</td><td class="r">' + (r.hp != null ? usd(Math.round(r.hp * k * 0.7457 / 0.9 * (Number(f.h) || 8760) * (Number(f.r) || 0.1))) : '–') + '</td><td class="r"><strong>' + usd(r.price * k) + '</strong></td><td><button class="pt-add" type="button" data-sa="' + esc(r.p.sku) + '" data-k="' + k + '">' + T.add + '</button>' + (k === 1 ? '<br><button class="pt-link" type="button" data-srep="' + esc(r.p.sku) + '">' + T.report + '</button>' : '') + '</td></tr>';
            }).join('') + '</tbody></table></div>';
        }
        var html = head;
        if (res.length) html += '<p class="pt-note">' + res.length + ' ' + T.found + '</p>' + rows(res, 1);
        else html += '<p class="pt-msg">' + T.noFit + '</p>' + (pair.length ? '<p class="pt-note">' + T.twoUnits + '</p>' + rows(pair, 2) : '');
        out.innerHTML = html + '<p class="pt-note">' + T.energyNote + '</p>';
        out.querySelectorAll('[data-srep]').forEach(function (b) { b.onclick = function () { var r = res.filter(function (x) { return x.p.sku === b.dataset.srep; })[0]; if (!r) return; makeReport({ p: r.p, mode: press ? 'pressure' : 'vacuum', acfm: Q, given: f.q + ' ' + f.qu, psi: dp / DP.psi, dpAir: dp, rho: 1, gas: 'air', alt: 0, temp: 68, qa: r.qa, kw: r.hp != null ? r.hp * 0.7457 : null, lim_psi: r.lim / DP.psi, energy: r.hp != null ? Math.round(r.hp * 0.7457 / 0.9 * (Number(f.h) || 8760) * (Number(f.r) || 0.1)) : null, hours: Number(f.h) || 8760, rate: Number(f.r) || 0.1 }); }; });
        out.querySelectorAll('[data-sa]').forEach(function (b) { b.onclick = function () { blowerDialog(S.bySku[b.dataset.sa], press ? 'pressure' : 'vacuum'); }; });
      });
    }
  }

  // ---------- product page (#p/SKU) ----------
  function route(first) {
    var hsh = decodeURIComponent((location.hash || '').slice(1));
    if (hsh.indexOf('p/') === 0 && S.bySku[hsh.slice(2)]) { S.tab = 'prod'; S.sku = hsh.slice(2); }
    else if (['home', 'sel', 'cat', 'cart', 'orders', 'account', 'admin'].indexOf(hsh) >= 0) S.tab = hsh;
    else if (!first) S.tab = 'home';
    if (!first) { shell(); window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 90 }); }
  }
  function productView(el) {
    var p = S.bySku[S.sku], s = p.specs, a = p.acc || {};
    var sib = S.prods.filter(function (q) { return q.kind === 'blower' && q.sku.slice(0, -1) === p.sku.slice(0, -1) && q.sku !== p.sku; });
    function accRow(sku, lab) { var q = S.bySku[sku]; return q ? '<tr><th>' + lab + '</th><td><strong>' + esc(q.sku) + '</strong> · ' + esc(T.kind[q.kind]) + ' ' + esc(q.specs.port || '') + '</td><td class="r">' + usd(net(q.list_price)) + '</td></tr>' : ''; }
    el.innerHTML = '<p><a class="pt-link" href="#cat">← ' + T.back + '</a></p><div class="pt-prod"><div><h2 class="pt-h" style="margin-top:6px">' + esc(p.sku) + '</h2><p class="pt-note" style="margin-top:0">' + esc(pname(p)) + (s.double_flow ? ', ' + T.dbl : '') + '</p>' +
      '<div class="pt-tw"><table class="pt-t pt-spec"><tbody>' +
      '<tr><th>' + T.flow + '</th><td colspan="2">' + num(s.cfm, 0) + ' CFM · ' + num(s.m3h, 0) + ' m³/h</td></tr>' +
      '<tr><th>' + T.power + '</th><td colspan="2">' + num(s.hp) + ' HP · ' + num(s.kw) + ' kW</td></tr>' +
      '<tr><th>' + T.stages + '</th><td colspan="2">' + s.stages + (s.double_flow ? ' (' + T.dbl + ')' : '') + '</td></tr>' +
      '<tr><th>' + T.volt + '</th><td colspan="2">' + vlabel(s.volt) + ', 60 Hz</td></tr>' +
      '<tr><th>' + T.port + '</th><td colspan="2">' + esc(s.port || '') + ' NPT</td></tr>' +
      '<tr><th>' + T.list + '</th><td colspan="2" class="pt-old">' + usd(p.list_price == null ? null : Number(p.list_price)) + '</td></tr>' +
      '<tr><th>' + T.yours + '</th><td colspan="2"><strong>' + usd(net(p.list_price)) + '</strong>' + (S.fx && p.list_price != null ? ' <small>' + cad(net(p.list_price)) + '</small>' : '') + '</td></tr>' +
      (S.set.lead_fr || S.set.lead_en ? '<tr><th>' + T.lead + '</th><td colspan="2">' + esc(FR ? S.set.lead_fr || S.set.lead_en : S.set.lead_en || S.set.lead_fr) + '</td></tr>' : '') +
      '</tbody></table></div>' +
      '<div id="pp-curve" class="pt-curve"></div><div id="pp-cad"></div>' +
      (sib.length ? '<p class="pt-note">' + T.otherV + ' ' + sib.map(function (q) { return '<a href="#p/' + encodeURIComponent(q.sku) + '">' + esc(q.sku) + '</a> (' + vlabel(q.specs.volt) + ')'; }).join(' · ') + '</p>' : '') +
      '<div class="pt-acts" style="margin-top:14px"><button class="btn btn--solid" type="button" id="pp-add"' + (p.list_price == null ? ' disabled' : '') + '>' + T.addCart + '</button>' + (p.datasheet ? '<button class="btn btn--line" type="button" id="pp-dl">' + T.dlSheet + '</button>' : '') + '</div>' +
      '<h3 class="pt-sub">' + T.rec + '</h3><div class="pt-tw"><table class="pt-t pt-spec"><tbody>' + accRow(a.vac_filter, T.vac) + accRow(a.vac_valve, T.vac) + accRow(a.press_filter, T.press) + accRow(a.press_valve, T.press) + '</tbody></table></div></div>' +
      '<div class="pt-sheet" id="pp-sheet">' + (p.datasheet ? '<p class="pt-note">' + T.working + '</p>' : '<p class="pt-note">' + T.noSheet + '</p>') + '</div></div>';
    $('pp-add').onclick = function () { blowerDialog(p); };
    loadCurves().then(function () { var c = $('pp-curve'); if (c) c.innerHTML = curveSvg(p); });
    cadFiles(p);
    if (p.datasheet) {
      sb.storage.from('datasheets').createSignedUrl(p.datasheet, 3600).then(function (r) {
        if (!r.data) { $('pp-sheet').innerHTML = '<p class="pt-note">' + T.noSheet + '</p>'; return; }
        var u = r.data.signedUrl;
        $('pp-sheet').innerHTML = '<iframe title="' + esc(T.datasheet) + ' ' + esc(p.sku) + '" src="' + esc(u) + '#view=FitH"></iframe><p class="pt-note"><a href="' + esc(u) + '" target="_blank" rel="noopener">' + T.openSheet + '</a></p>';
        $('pp-dl').onclick = function () { window.open(u, '_blank', 'noopener'); };
      });
    }
  }

  // ---------- cart + checkout ----------
  function poBox() {
    var po = S.po; if (!po) return '';
    var miss = (po.lines || []).filter(function (l) { return !l.sku; });
    return '<div class="pt-ok pt-poread" role="status"><p>' + esc(po.msg) + '</p>' +
      (miss.length ? '<p class="pt-sub">' + T.poMiss + '</p><ul>' + miss.map(function (l) { return '<li>' + l.qty + ' × ' + esc(l.raw) + '</li>'; }).join('') + '</ul>' : '') +
      '<p><button class="pt-link" type="button" data-pof="' + esc(po.path) + '">' + T.poFile + ' : ' + esc(po.name) + '</button> · <button class="pt-link" type="button" id="po-x">' + T.poDetach + '</button></p></div>';
  }
  function dropZone(el, after) {
    var z = h('label', { class: 'pt-drop', for: 'po-in' }, '<input type="file" id="po-in" accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"><strong>' + T.poTitle + '</strong><span>' + T.poSub + '</span><small>' + T.poTypes + '</small><span class="pt-msg" id="po-msg" role="status"></span>');
    el.prepend(z);
    var inp = z.querySelector('input');
    inp.onchange = function () { if (inp.files[0]) readPO(inp.files[0], after); };
    ['dragenter', 'dragover'].forEach(function (ev) { z.addEventListener(ev, function (e) { e.preventDefault(); z.classList.add('on'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { z.addEventListener(ev, function (e) { e.preventDefault(); z.classList.remove('on'); }); });
    z.addEventListener('drop', function (e) { var f = e.dataTransfer && e.dataTransfer.files[0]; if (f) readPO(f, after); });
  }
  function readPO(file, after) {
    var msg = $('po-msg'), ext = (file.name.split('.').pop() || '').toLowerCase(); if (ext === 'jpeg') ext = 'jpg';
    if (['pdf', 'png', 'jpg', 'webp'].indexOf(ext) < 0) { msg.textContent = T.poBadType; return; }
    if (file.size > 15 * 1024 * 1024) { msg.textContent = T.poBig; return; }
    var name = file.name.replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80), path = S.user.id + '/' + Date.now() + '_' + name.replace(/\.[^.]*$/, '') + '.' + ext;
    var zone = root.querySelector('.pt-drop'); if (zone) zone.classList.add('busy');
    msg.textContent = T.poReading.replace('{f}', file.name);
    sb.storage.from('po-uploads').upload(path, file, { contentType: file.type || (ext === 'pdf' ? 'application/pdf' : 'image/' + (ext === 'jpg' ? 'jpeg' : ext)), upsert: false }).then(function (u) {
      if (u.error) throw u.error;
      return sb.functions.invoke('read-po', { body: { path: path } });
    }).then(function (r) {
      var d = r.data || {};
      if (r.error || !d.po) {
        var ctx = r.error && r.error.context;
        return (ctx && ctx.json ? ctx.json().catch(function () { return {}; }) : Promise.resolve({})).then(function (j) {
          if (j.error === 'ai_unavailable') { S.po = { path: path, name: file.name, lines: [], msg: T.poAi.replace('{f}', file.name) }; return after(); }
          if (zone) zone.classList.remove('busy'); msg.textContent = T.poErr;
        });
      }
      var po = d.po, n = 0;
      (po.lines || []).forEach(function (l) {
        if (l.sku && S.bySku[l.sku]) { addLine(l.sku, l.qty, l.mode === 'vacuum' || l.mode === 'pressure' ? l.mode : null); n++; }
        else l.sku = null;
      });
      var st = po.ship_to || {};
      S.po = { path: path, name: file.name, number: po.po_number || '', ship: st, lines: po.lines || [], notes: po.notes || '',
        msg: (n ? T.poRead.replace('{n}', n) : T.poNone).replace('{f}', file.name) };
      shellCount(); after();
    }).catch(function () { if (zone) zone.classList.remove('busy'); msg.textContent = T.poErr; });
  }
  function cartView(el) {
    cart = cart.filter(function (l) { return S.bySku[l.sku] && l.qty > 0; }); saveCart();
    var again = function () { cartView(el); };
    if (!cart.length) { el.innerHTML = poBox() + '<p class="pt-note">' + T.empty + '</p>'; dropZone(el, again); poX(); return; }
    var pr = S.prof || {}, po = S.po || {}, st = po.ship || {};
    function pick(a, b) { return a ? String(a) : b; }
    var miss = (po.lines || []).filter(function (l) { return !l.sku; }).map(function (l) { return l.qty + ' × ' + l.raw; });
    var noteVal = miss.length ? T.poMiss + '\n' + miss.join('\n') : '';
    var shipCn = st.country === 'US' || st.country === 'CA' ? st.country : pr.country, shipPv = st.province && /^[A-Z]{2}$/.test(String(st.province).toUpperCase()) ? String(st.province).toUpperCase() : pr.province;
    el.innerHTML = poBox() + '<div class="pt-cart"><div><div class="pt-tw"><table class="pt-t"><tbody id="pc-l"></tbody></table></div><div id="pc-tot" class="pt-tot"></div></div><div><h3>' + T.ship + '</h3><div class="pt-form">' +
      field('ps-nm', T.name, 'text', pick(st.name, pr.full_name)) + field('ps-co', T.company, 'text', pick(st.company, pr.company)) + field('ps-ph', T.phone, 'tel', pick(st.phone, pr.phone)) + countrySelect('ps-cn', shipCn) + provSelect('ps-pv', shipPv) +
      field('ps-ad', T.address, 'text', pick(st.address, pr.address)) + field('ps-ci', T.city, 'text', pick(st.city, pr.city)) + field('ps-pc', T.postal, 'text', pick(st.postal, pr.postal)) + field('ps-po', T.po, 'text', po.number || '') +
      '<div class="pt-f"><label for="ps-nt">' + T.note + '</label><textarea id="ps-nt" rows="' + (miss.length ? 4 : 2) + '">' + esc(noteVal) + '</textarea></div></div>' +
      '<div class="pt-acts pt-pay"><button class="btn btn--line" type="button" id="pc-quote">' + T.quote + '</button>' + (S.prof.org_id ? '<button class="btn btn--line" type="button" id="pc-appr">' + T.approveSend + '</button>' : '') + '</div>' +
      '<div class="pt-acts pt-pay"><button class="btn btn--line" type="button" id="pc-inv">' + T.payInv + '</button><button class="btn btn--solid" type="button" id="pc-card">' + T.payCard + '</button></div><p class="pt-msg" id="pc-msg" role="status"></p><p class="pt-note">' + T.terms + '</p></div></div>';
    function lines() {
      $('pc-l').innerHTML = cart.map(function (l, i) {
        var p = S.bySku[l.sku], u = net(p.list_price);
        var pl = S.po && (S.po.lines || []).filter(function (x) { return x.sku === l.sku; })[0];
        var modeSel = p.kind === 'blower' ? '<br><select class="pt-msel" data-mi="' + i + '" aria-label="' + T.useQ + '"><option value="">' + T.useSel + '</option><option value="vacuum"' + (l.mode === 'vacuum' ? ' selected' : '') + '>' + T.mode.vacuum + '</option><option value="pressure"' + (l.mode === 'pressure' ? ' selected' : '') + '>' + T.mode.pressure + '</option></select>' : (l.mode ? ' · ' + T.mode[l.mode] : '');
        var flag = pl ? (pl.confidence === 'low' ? ' <span class="pt-tag pt-tag--warn">' + T.poLow + '</span>' : '') + (pl.po_unit_price != null && Math.abs(Number(pl.po_unit_price) - u) > 0.5 ? '<br><small>' + T.poPrice + ' : ' + usd(Number(pl.po_unit_price)) + '</small>' : '') : '';
        return '<tr><td><strong>' + esc(p.sku) + '</strong>' + flag + '<br><small>' + esc(p.kind === 'blower' ? pname(p) : T.kind[p.kind]) + '</small>' + modeSel + '</td><td class="pt-q"><button type="button" data-i="' + i + '" data-d="-1" aria-label="−">−</button><span>' + l.qty + '</span><button type="button" data-i="' + i + '" data-d="1" aria-label="+">+</button></td><td class="r">' + usd(r2(u * l.qty)) + '<br><button class="pt-link" type="button" data-rm="' + i + '">' + T.remove + '</button></td></tr>';
      }).join('');
      $('pc-l').querySelectorAll('[data-d]').forEach(function (b) { b.onclick = function () { var l = cart[+b.dataset.i]; l.qty = Math.max(0, Math.min(50, l.qty + +b.dataset.d)); cart = cart.filter(function (x) { return x.qty > 0; }); saveCart(); shellCount(); cart.length ? lines() : cartView(el); }; });
      $('pc-l').querySelectorAll('[data-mi]').forEach(function (s) { s.onchange = function () { cart[+s.dataset.mi].mode = s.value || null; saveCart(); }; });
      $('pc-l').querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { cart.splice(+b.dataset.rm, 1); saveCart(); shellCount(); cart.length ? lines() : cartView(el); }; });
      tot();
    }
    function tot() {
      var s = r2(cart.reduce(function (a, l) { return a + net(S.bySku[l.sku].list_price) * l.qty; }, 0));
      var tx = v('ps-cn') === 'CA' ? (TAX[v('ps-pv')] || []).map(function (t) { return [t[0] + ' ' + num(t[1], 3) + ' %', r2(s * t[1] / 100)]; }) : [];
      var t = r2(s + tx.reduce(function (a, x) { return a + x[1]; }, 0));
      var fr8 = freightEst(cart, v('ps-cn'), v('ps-pv')), ld = FR ? S.set.lead_fr || S.set.lead_en : S.set.lead_en || S.set.lead_fr;
      $('pc-tot').innerHTML = '<div><span>' + T.sub + '</span><span>' + usd(s) + '</span></div>' + tx.map(function (x) { return '<div><span>' + x[0] + '</span><span>' + usd(x[1]) + '</span></div>'; }).join('') + '<div class="t"><span>' + T.total + '</span><span>' + usd(t) + '</span></div>' + (S.fx ? '<div class="pt-cadl"><span></span><span>' + cad(t) + '</span></div><p class="pt-note">' + T.cadBasis.replace('{d}', S.fx.date) + '</p>' : '') +
        (fr8 != null ? '<div class="pt-est"><span>' + T.freight + '<br><small>' + T.freightNote + '</small></span><span>' + usd(fr8) + '</span></div>' : '') + (ld ? '<p class="pt-note">' + T.lead + ' : ' + esc(ld) + '</p>' : '');
    }
    $('ps-cn').onchange = $('ps-pv').onchange = tot;
    $('pc-inv').onclick = function () { submit('invoice'); };
    $('pc-quote').onclick = function () { makeQuote(); };
    if ($('pc-appr')) $('pc-appr').onclick = function () {
      var b = $('pc-appr'), msg = $('pc-msg'); b.disabled = true;
      sb.from('shared_carts').insert({ org_id: S.prof.org_id, from_user: S.user.id, items: cart.map(function (l) { return { sku: l.sku, qty: l.qty, mode: l.mode }; }), note: v('ps-nt') || null }).select('id').single().then(function (r) {
        if (r.error || !r.data) { b.disabled = false; msg.textContent = T.approveErr; return; }
        mailCustomer({ kind: 'cart_shared', cart_id: r.data.id }); msg.textContent = T.approveSent; b.disabled = false;
      });
    };
    $('pc-card').onclick = function () { submit('card'); };
    lines(); dropZone(el, again); poX();
  }
  function poX() { var x = $('po-x'); if (x) x.onclick = function () { S.po = null; shell(); }; }
  function submit(method) {
    var msg = $('pc-msg'), ship = { name: v('ps-nm'), company: v('ps-co'), phone: v('ps-ph'), country: v('ps-cn'), province: v('ps-pv'), address: v('ps-ad'), city: v('ps-ci'), postal: v('ps-pc') };
    if (!ship.name || !ship.address || !ship.city || !ship.postal || (ship.country === 'CA' && !ship.province)) { msg.textContent = T.need; return; }
    var btns = [$('pc-inv'), $('pc-card')]; btns.forEach(function (b) { b.disabled = true; }); msg.textContent = T.working;
    var payload = { pay_method: method, items: cart.map(function (l) { return { sku: l.sku, qty: l.qty, mode: l.mode }; }), ship: ship, po_number: v('ps-po'), note: v('ps-nt'), po_file: S.po ? S.po.path : null };
    sb.functions.invoke('place-order', { body: payload }).then(function (r) {
      var d = r.data || {};
      if (r.error && !d.order_id) { var ctx = r.error.context; if (ctx && ctx.json) return ctx.json().then(function (j) { fail(j.error === 'card_unavailable' ? T.cardOff : T.err); }); return fail(T.err); }
      var summary = function (status) { return 'Commande no ' + d.order_id + ' (' + status + ')\nClient : ' + (S.prof.company || '') + ' – ' + S.prof.email + '\nTotal : ' + d.total + ' USD\n\n' + cart.map(function (l) { return l.qty + ' × ' + l.sku + (l.mode ? ' (' + l.mode + ')' : ''); }).join('\n') + '\n\nLivraison : ' + [ship.name, ship.company, ship.address, ship.city, ship.province, ship.postal, ship.country].filter(Boolean).join(', ') + (payload.po_number ? '\nPO client : ' + payload.po_number : '') + (payload.note ? '\nNote : ' + payload.note : '') + (payload.po_file ? '\nBon de commande du client joint (voir l’onglet Administration)' : '') + '\n\nhttps://stratovac.ca/fr/portail/#admin'; };
      if (method === 'invoice') { mailCustomer({ kind: 'order', order_id: d.order_id }); notify('Commande no ' + d.order_id + ' – facture à envoyer', summary('facture à envoyer')); done(T.okInv.replace('{n}', d.order_id)); return; }
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
            mailCustomer({ kind: 'order', order_id: d.order_id });
            done((ok ? T.okCard : T.payPending).replace('{n}', d.order_id));
          });
        } else if (ev.data.eventStatus === 'ABORTED') { msg.textContent = T.declined; btns.forEach(function (b) { b.disabled = false; }); }
        else if (ev.data.eventStatus === 'HIDE') { window.removeEventListener('message', on); btns.forEach(function (b) { b.disabled = false; }); }
      }
      window.addEventListener('message', on);
      msg.textContent = ''; window.appendHelcimPayIframe(d.checkoutToken);
    }).catch(function () { fail(T.err); });
    function fail(t) { msg.textContent = t; btns.forEach(function (b) { b.disabled = false; }); }
    function done(t) { cart = []; S.po = null; saveCart(); S.tab = 'orders'; shell(); var p = h('p', { class: 'pt-ok', role: 'status' }, esc(t)); $('pt-view').prepend(p); }
  }

  // ---------- orders ----------
  function orderTable(list, admin) {
    if (!list.length) return '<p class="pt-note">' + T.noOrders + '</p>';
    return '<div class="pt-tw"><table class="pt-t"><thead><tr><th>#</th><th>' + T.date + '</th>' + (admin ? '<th>' + T.company + '</th>' : '') + '<th>' + T.items + '</th><th class="r">' + T.total + '</th><th>' + T.status + '</th></tr></thead><tbody>' +
      list.map(function (o) {
        var st = admin ? '<select data-os="' + o.id + '">' + Object.keys(T.st).map(function (k) { return '<option value="' + k + '"' + (k === o.status ? ' selected' : '') + '>' + T.st[k] + '</option>'; }).join('') + '</select><br><select class="pt-trk" data-oc="' + o.id + '" aria-label="' + T.carrier + '"><option value="">' + T.carrier + '</option>' + Object.keys(CARRIERS).map(function (k) { return '<option value="' + k + '"' + (o.carrier === k ? ' selected' : '') + '>' + CARRIERS[k][0] + '</option>'; }).join('') + '</select><br><input class="pt-trk" data-ot="' + o.id + '" placeholder="' + T.tracking + '" value="' + esc(o.tracking || '') + '" aria-label="' + T.tracking + '">'
          : timeline(o) + '<button class="pt-add" type="button" data-re="' + o.id + '">' + T.again + '</button>';
        return '<tr><td>' + o.id + (o.po_file ? '<br><button class="pt-link" type="button" data-pof="' + esc(o.po_file) + '">' + T.poFile + '</button>' : '') + '</td><td>' + new Date(o.created_at).toLocaleDateString(FR ? 'fr-CA' : 'en-CA') + '</td>' + (admin ? '<td>' + esc((o.ship && o.ship.company) || '') + '<br><small>' + esc((o.ship && o.ship.name) || '') + (o.po_number ? ' · PO ' + esc(o.po_number) : '') + '</small></td>' : '') +
          '<td><small>' + (o.items || []).map(function (i) { return i.qty + ' × ' + esc(i.sku) + (i.mode ? ' (' + T.mode[i.mode] + ')' : ''); }).join('<br>') + '</small></td><td class="r">' + usd(Number(o.total)) + '<br><small>' + (o.pay_method === 'card' ? T.payCard : T.payInv) + '</small></td><td>' + st + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function ordersView(el) {
    el.innerHTML = '<p class="pt-note">' + T.working + '</p>';
    var ids = (S.team && S.team.length ? S.team.map(function (t) { return t.id; }) : []).concat([S.user.id]);
    sb.from('orders').select('*').in('user_id', ids).order('created_at', { ascending: false }).then(function (r) { var list = r.data || []; el.innerHTML = orderTable(list, false); wireReorder(el, list); });
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
    teamBox(el);
    $('pa-pwb').onclick = function () { sb.auth.updateUser({ password: $('pa-pw').value }).then(function (r) { $('pa-msg').textContent = r.error ? r.error.message : T.passSaved; }); };
  }

  // ---------- admin ----------
  function adminView(el) {
    el.innerHTML = '<p class="pt-note">' + T.working + '</p>';
    Promise.all([sb.from('profiles').select('*').order('created_at', { ascending: false }), sb.from('orders').select('*').order('created_at', { ascending: false }).limit(200), sb.from('quotes').select('*').order('created_at', { ascending: false }).limit(30)]).then(function (rs) {
      var users = rs[0].data || [], orders = rs[1].data || [], quotes = rs[2].data || [];
      var byId = {}; users.forEach(function (u) { byId[u.id] = u; });
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
        '<h2 class="pt-h">' + T.customers + ' (' + rest.length + ')</h2><p class="pt-note">' + T.clickCust + '</p><div class="pt-tw"><table class="pt-t">' + head + '<tbody>' + rest.map(urow).join('') + '</tbody></table></div>' +
        '<h2 class="pt-h">' + T.quotes + ' (' + quotes.length + ')</h2>' + (quotes.length ? '<div class="pt-tw"><table class="pt-t"><thead><tr><th>' + T.quoteNo + '</th><th>' + T.date + '</th><th>' + T.company + '</th><th>' + T.items + '</th><th class="r">' + T.sub + '</th></tr></thead><tbody>' + quotes.map(function (q) { var u = byId[q.user_id] || {}; return '<tr><td>' + esc(q.number) + '</td><td>' + new Date(q.created_at).toLocaleDateString(FR ? 'fr-CA' : 'en-CA') + '</td><td>' + esc(u.company || u.email || '') + '</td><td><small>' + (q.items || []).map(function (i) { return i.qty + ' × ' + esc(i.sku); }).join('<br>') + '</small></td><td class="r">' + usd(Number(q.subtotal)) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="pt-note">' + T.none + '</p>') +
        settingsForm();
      function say(t) { $('ad-msg').textContent = t; }
      function upd(id, patch) { sb.from('profiles').update(patch).eq('id', id).then(function (r) { if (r.error) return say(r.error.message); adminView(el); setTimeout(function () { say(T.saved); }, 600); }); }
      function dval(id) { return Math.max(0, Math.min(90, Number(el.querySelector('[data-ud="' + id + '"]').value) || 0)); }
      el.querySelectorAll('[data-ua]').forEach(function (b) { b.onclick = function () { var id = b.dataset.ua; sb.from('profiles').update({ status: 'approved', discount_pct: dval(id) }).eq('id', id).then(function (r) { if (r.error) return say(r.error.message); mailCustomer({ kind: 'approved', user_id: id }).then(function (ok) { adminView(el); setTimeout(function () { say(ok ? T.saved + ' ' + T.emailed : T.noEmail); }, 600); }); }); }; });
      el.querySelectorAll('[data-us]').forEach(function (b) { b.onclick = function () { upd(b.dataset.us, { discount_pct: dval(b.dataset.us) }); }; });
      el.querySelectorAll('[data-ur]').forEach(function (b) { b.onclick = function () { upd(b.dataset.ur, { status: 'rejected' }); }; });
      function saveOrder(id) {
        var s = el.querySelector('[data-os="' + id + '"]'), t = el.querySelector('[data-ot="' + id + '"]'), c = el.querySelector('[data-oc="' + id + '"]'), prev = (orders.filter(function (o) { return o.id === id; })[0] || {}).status;
        sb.from('orders').update({ status: s.value, tracking: t.value.trim() || null, carrier: c.value || null }).eq('id', id).then(function (r) {
          if (r.error) return say(r.error.message);
          if (s.value === 'shipped' && prev !== 'shipped') { mailCustomer({ kind: 'shipped', order_id: id }).then(function (ok) { say(ok ? T.saved + ' ' + T.emailed : T.noEmail); }); orders.forEach(function (o) { if (o.id === id) o.status = 'shipped'; }); }
          else say(T.saved);
        });
      }
      el.querySelectorAll('[data-os]').forEach(function (s) { s.onchange = function () { saveOrder(+s.dataset.os); }; });
      el.querySelectorAll('[data-ot]').forEach(function (t) { t.onchange = function () { saveOrder(+t.dataset.ot); }; });
      el.querySelectorAll('[data-oc]').forEach(function (t) { t.onchange = function () { saveOrder(+t.dataset.oc); }; });
      wireSettings(el, say);
      el.querySelectorAll('[data-uv]').forEach(function (b) { b.onclick = function () { customerDialog(users.filter(function (u) { return u.id === b.dataset.uv; })[0], users, function () { adminView(el); }); }; });
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
  function customerDialog(u, users, onChange) {
    if (!u) return;
    users = users || [];
    var dlg = h('div', { class: 'pt-dlg-bg' }), box = h('div', { class: 'pt-dlg pt-dlg--wide', role: 'dialog', 'aria-modal': 'true', 'aria-label': u.company || u.email });
    dlg.appendChild(box); document.body.appendChild(dlg);
    function close() { dlg.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey); dlg.onclick = function (e) { if (e.target === dlg) close(); };
    var info = '<button class="pt-x" type="button" aria-label="' + T.close + '">×</button><h3>' + esc(u.company || u.email) + '</h3>' +
      '<p class="pt-note">' + esc(u.full_name || '') + ' · <a href="mailto:' + esc(u.email) + '">' + esc(u.email) + '</a>' + (u.phone ? ' · <a href="tel:' + esc(u.phone) + '">' + esc(u.phone) + '</a>' : '') + '<br>' +
      esc([u.address, u.city, u.province, u.postal, u.country].filter(Boolean).join(', ')) + '<br>' + T.status + ' : ' + esc(T.us[u.status] || u.status) + ' · ' + T.disc + ' : ' + num(Number(u.discount_pct)) + ' % · ' + T.since + ' ' + new Date(u.created_at).toLocaleDateString(FR ? 'fr-CA' : 'en-CA') + '</p>' + (u.is_admin ? '' : '<p class="pt-note"><label>' + T.orgLink + ' <select id="cd-org"><option value="">' + T.orgNone + '</option>' + users.filter(function (x) { return x.id !== u.id && !x.is_admin && x.status === 'approved'; }).map(function (x) { var same = u.org_id && (x.org_id === u.org_id); return '<option value="' + x.id + '"' + (same ? ' selected' : '') + '>' + esc((x.company || x.email) + ' – ' + (x.full_name || x.email)) + '</option>'; }).join('') + '</select></label> <span id="cd-om" role="status"></span></p>') + '<div id="cd-o"><p class="pt-note">' + T.working + '</p></div>';
    box.innerHTML = info; box.querySelector('.pt-x').onclick = close; box.querySelector('.pt-x').focus();
    if ($('cd-org')) $('cd-org').onchange = function () {
      var tid = $('cd-org').value, t = users.filter(function (x) { return x.id === tid; })[0];
      var org = t ? (t.org_id || t.id) : null;
      var jobs = [sb.from('profiles').update({ org_id: org }).eq('id', u.id)];
      if (t && !t.org_id) jobs.push(sb.from('profiles').update({ org_id: org }).eq('id', t.id));
      Promise.all(jobs).then(function (rs) { var e = rs.filter(function (r) { return r.error; })[0]; $('cd-om').textContent = e ? e.error.message : T.orgSaved; if (!e) { u.org_id = org; if (t) t.org_id = org; if (onChange) onChange(); } });
    };
    sb.from('orders').select('*').eq('user_id', u.id).order('created_at', { ascending: false }).then(function (r) {
      var list = r.data || [], live = list.filter(function (o) { return o.status !== 'cancelled'; });
      var spent = live.reduce(function (a, o) { return a + Number(o.subtotal || 0); }, 0);
      $('cd-o').innerHTML = '<div class="pt-stats"><div><span>' + T.nOrders + '</span><strong>' + list.length + '</strong></div><div><span>' + T.spent + '</span><strong>' + usd(r2(spent)) + '</strong></div><div><span>' + T.lastOrder + '</span><strong>' + (list[0] ? new Date(list[0].created_at).toLocaleDateString(FR ? 'fr-CA' : 'en-CA') : '–') + '</strong></div></div>' +
        (list.length ? '<div class="pt-tw"><table class="pt-t"><thead><tr><th>#</th><th>' + T.date + '</th><th>' + T.items + '</th><th class="r">' + T.total + '</th><th>' + T.status + '</th></tr></thead><tbody>' + list.map(function (o) {
          return '<tr><td>' + o.id + (o.po_number ? '<br><small>PO ' + esc(o.po_number) + '</small>' : '') + (o.po_file ? '<br><button class="pt-link" type="button" data-pof="' + esc(o.po_file) + '">' + T.poFile + '</button>' : '') + '</td><td>' + new Date(o.created_at).toLocaleDateString(FR ? 'fr-CA' : 'en-CA') + '</td><td><small>' + (o.items || []).map(function (i) { return i.qty + ' × ' + esc(i.sku) + (i.mode ? ' (' + T.mode[i.mode] + ')' : '') + (i.unit_price != null ? ' – ' + usd(Number(i.unit_price)) : ''); }).join('<br>') + '</small></td><td class="r">' + usd(Number(o.total)) + '<br><small>' + (o.pay_method === 'card' ? T.payCard : T.payInv) + '</small></td><td>' + esc(T.st[o.status] || o.status) + '</td></tr>';
        }).join('') + '</tbody></table></div>' : '<p class="pt-note">' + T.noOrders + '</p>');
    });
  }

  // ---------- home ----------
  function homeView(el) {
    var nm = String(S.prof.full_name || '').split(' ')[0];
    var mic = SR || window.MediaRecorder ? '<button class="pt-mic" type="button" id="hm-mic" aria-label="' + T.aiMic + '" title="' + T.aiMic + '"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z"/></svg></button>' : '';
    el.innerHTML = '<div class="pt-home"><h2 class="pt-h" style="margin-top:4px">' + esc(T.hiName.replace('{n}', nm).replace(/\s+$/, '')) + '</h2><p class="pt-note" style="margin-top:0">' + T.hiSub + '</p><div class="pt-cards">' +
      '<section class="pt-card pt-card--ask"><h3>' + T.hAskT + '</h3><p>' + T.hAskS + '</p><form id="hm-f" class="pt-ai-f">' + mic + '<textarea id="hm-q" rows="2" placeholder="' + esc(T.hAskPh) + '" aria-label="' + T.hAskT + '"></textarea><button class="btn btn--solid" type="submit">' + T.hAsk + '</button></form></section>' +
      '<section class="pt-card pt-card--po" id="hm-po"></section>' +
      '<section class="pt-card"><h3>' + T.hCatT + '</h3><p>' + T.hCatS + '</p><div class="pt-acts"><a class="btn btn--line" href="#cat">' + T.hCat + '</a><a class="pt-link" href="#sel">' + T.hSel + '</a></div></section>' +
      '</div><div id="hm-recent"></div></div>';
    function goAsk(q, useMic) { S.tab = 'sel'; history.replaceState(null, '', '#sel'); shell(); if (q) { $('ai-in').value = q; $('ai-f').requestSubmit(); } else if (useMic && $('ai-mic')) $('ai-mic').click(); }
    $('hm-f').onsubmit = function (e) { e.preventDefault(); var q = v('hm-q'); if (q) goAsk(q); };
    $('hm-q').onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('hm-f').requestSubmit(); } };
    if ($('hm-mic')) $('hm-mic').onclick = function () { goAsk(null, true); };
    dropZone($('hm-po'), function () { S.tab = 'cart'; history.replaceState(null, '', '#cart'); shell(); });
    sb.from('orders').select('*').eq('user_id', S.user.id).order('created_at', { ascending: false }).limit(3).then(function (r) {
      var list = r.data || []; if (!list.length || !$('hm-recent')) return;
      $('hm-recent').innerHTML = '<h3 class="pt-sub">' + T.hRecent + '</h3>' + orderTable(list, false); wireReorder($('hm-recent'), list);
    });
  }
  function wireReorder(el, list) {
    el.querySelectorAll('[data-re]').forEach(function (b) {
      b.onclick = function () {
        var o = list.filter(function (x) { return String(x.id) === b.dataset.re; })[0], n = 0; if (!o) return;
        (o.items || []).forEach(function (i) { if (S.bySku[i.sku] && S.bySku[i.sku].list_price != null) { addLine(i.sku, i.qty, i.mode || null); n++; } });
        if (!n) { toast(T.reorderNone); return; }
        toast(T.againDone); S.tab = 'cart'; history.replaceState(null, '', '#cart'); shell();
      };
    });
  }

  // ---------- assistant: one-click buttons under a reply ----------
  function kitSkus(p, mode) { var a = p.acc || {}; return [p.sku].concat(mode === 'vacuum' ? [a.vac_filter, a.vac_valve] : mode === 'pressure' ? [a.press_filter, a.press_valve] : []).filter(function (x) { return x && S.bySku[x] && S.bySku[x].list_price != null; }); }
  function aiActions(m, idx) {
    if (m.role !== 'assistant' || m.err) return '';
    var seen = {}, list = [];
    (m.content.match(/\bID[A-Z]{1,4}[0-9A-Z.\-]*[0-9A-Z]\b/g) || []).forEach(function (x) { if (S.bySku[x] && !seen[x] && S.bySku[x].list_price != null) { seen[x] = 1; list.push(S.bySku[x]); } });
    var bl = list.filter(function (p) { return p.kind === 'blower'; }).slice(0, 3), inKit = {};
    bl.forEach(function (p) { kitSkus(p, m.mode).forEach(function (x) { inKit[x] = 1; }); });
    var acc = list.filter(function (p) { return p.kind !== 'blower' && !inKit[p.sku]; }).slice(0, 4);
    if (!bl.length && !acc.length) return '';
    return '<div class="pt-ai-acts">' + bl.map(function (p) {
      var k = kitSkus(p, m.mode), tot = r2(k.reduce(function (a, x) { return a + net(S.bySku[x].list_price); }, 0));
      return m.mode ? '<button class="btn btn--solid pt-sol" type="button" data-sol="' + esc(p.sku) + '" data-mode="' + m.mode + '"><span>' + T.sol + '</span><small>' + esc(k.join(' + ')) + ' · ' + usd(tot) + '</small></button>'
        : '<button class="btn btn--line pt-sol" type="button" data-pick="' + esc(p.sku) + '"><span>' + T.solPick + '</span><small>' + esc(p.sku) + '</small></button>';
    }).join('') + (m.report && m.report.rows ? bl.filter(function (p) { return m.report.rows.some(function (r) { return r.model === p.sku; }); }).map(function (p) { return '<button class="pt-add" type="button" data-arep="' + idx + '|' + esc(p.sku) + '">' + T.report + ' · ' + esc(p.sku) + '</button>'; }).join('') : '') + acc.map(function (p) { return '<button class="pt-add" type="button" data-one="' + esc(p.sku) + '">' + T.addOne + ' ' + esc(p.sku) + ' · ' + usd(net(p.list_price)) + '</button>'; }).join('') + '</div>';
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-sol],[data-one],[data-pick],[data-arep],[data-cadf],[data-cadx]'); if (!b) return;
    if (b.dataset.cadf) { sb.storage.from('cad').createSignedUrl(b.dataset.cadf, 600, { download: true }).then(function (r) { if (r.data) window.open(r.data.signedUrl, '_blank', 'noopener'); }); return; }
    if (b.dataset.cadx) { sb.storage.from('cad').remove([b.dataset.cadx]).then(function () { cadFiles(S.bySku[S.sku]); }); return; }
    if (b.dataset.arep) {
      var pr = b.dataset.arep.split('|'), m = S.ai && S.ai.msgs[+pr[0]], rp = m && m.report, row = rp && rp.rows.filter(function (r) { return r.model === pr[1]; })[0]; if (!row) return;
      return makeReport({ p: S.bySku[pr[1]], mode: rp.mode, acfm: rp.acfm, given: rp.given, psi: rp.psi, dpAir: rp.dp_air_inh2o, rho: rp.rho, gas: rp.gas, mw: rp.mw, alt: rp.altitude_ft, temp: rp.inlet_temp_f, qa: row.acfm, kw: row.kw, lim_psi: row.lim_psi, energy: row.energy, hours: rp.hours, rate: rp.rate });
    }
    if (b.dataset.pick) return blowerDialog(S.bySku[b.dataset.pick]);
    if (b.dataset.one) { addLine(b.dataset.one, 1, null); shellCount(); toast(T.added); return; }
    var p = S.bySku[b.dataset.sol], mode = b.dataset.mode; if (!p) return;
    kitSkus(p, mode).forEach(function (x) { addLine(x, 1, mode); });
    shellCount(); toast(T.solDone); b.classList.add('done'); b.querySelector('span').textContent = '✓ ' + T.solDone;
  });

  // ---------- performance curve (SVG) ----------
  function loadCurves() { return S.curves ? Promise.resolve() : sb.from('perf_curves').select('*').then(function (r) { S.curves = {}; (r.data || []).forEach(function (x) { S.curves[x.frame] = x.data; }); }); }
  function niceStep(span) { var e = Math.pow(10, Math.floor(Math.log10(span))), f = span / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e; }
  function curveSvg(p) {
    var pf = p.specs.perf, cv = pf && S.curves && S.curves[pf.frame]; if (!cv) return '';
    var sets = [];
    if (cv.flow_press && cv.flow_press.length && pf.max_p) sets.push({ k: 'p', c: cv.flow_press.filter(function (q) { return q[0] <= pf.max_p * 1.001; }) });
    if (cv.flow_vac && cv.flow_vac.length && pf.max_v) sets.push({ k: 'v', c: cv.flow_vac.filter(function (q) { return q[0] <= pf.max_v * 1.001; }) });
    sets = sets.filter(function (s) { return s.c.length > 1; }); if (!sets.length) return '';
    var f = S.selF, pt = null;
    if (f && f.q && f.dp) { var Q = Number(f.q) * QU[f.qu], dp = Number(f.dp) * DP[f.du], k = f.mode === 'vac' ? 'v' : 'p'; if (Q > 0 && dp >= 0 && sets.some(function (s) { return s.k === k; })) pt = { x: dp / DP.psi, y: Q, k: k }; }
    var xmax = 0, ymax = 0;
    sets.forEach(function (s) { s.c.forEach(function (q) { xmax = Math.max(xmax, q[0] / DP.psi); ymax = Math.max(ymax, q[1]); }); });
    if (pt) { xmax = Math.max(xmax, pt.x); ymax = Math.max(ymax, pt.y); }
    var xs = niceStep(xmax / 5), ys = niceStep(ymax / 5); xmax = Math.ceil(xmax / xs) * xs; ymax = Math.ceil(ymax * 1.05 / ys) * ys;
    var W = 560, H = 320, L = 70, R = 16, Tp = 14, B = 52, iw = W - L - R, ih = H - Tp - B;
    function X(x) { return L + x / xmax * iw; } function Y(y) { return Tp + ih - y / ymax * ih; }
    var g = '';
    for (var x = 0; x <= xmax + 1e-9; x += xs) g += '<line x1="' + X(x) + '" y1="' + Tp + '" x2="' + X(x) + '" y2="' + (Tp + ih) + '" class="gr"/><text x="' + X(x) + '" y="' + (Tp + ih + 16) + '" text-anchor="middle">' + num(x, 2) + '</text><text x="' + X(x) + '" y="' + (Tp + ih + 29) + '" text-anchor="middle" class="sub">' + num(x * 0.0689476, 2) + '</text>';
    for (var y = 0; y <= ymax + 1e-9; y += ys) g += '<line x1="' + L + '" y1="' + Y(y) + '" x2="' + (L + iw) + '" y2="' + Y(y) + '" class="gr"/><text x="' + (L - 8) + '" y="' + (Y(y) - 1) + '" text-anchor="end">' + num(y, 0) + '</text><text x="' + (L - 8) + '" y="' + (Y(y) + 11) + '" text-anchor="end" class="sub">' + num(y / 0.588578, 0) + '</text>';
    var lines = sets.map(function (s) { return '<polyline class="' + (s.k === 'p' ? 'cp' : 'cvv') + '" points="' + s.c.map(function (q) { return X(q[0] / DP.psi).toFixed(1) + ',' + Y(q[1]).toFixed(1); }).join(' ') + '"/>'; }).join('');
    var dot = pt ? '<circle cx="' + X(pt.x) + '" cy="' + Y(pt.y) + '" r="6" class="pt-dot"/><text x="' + (X(pt.x) + 9) + '" y="' + (Y(pt.y) - 8) + '" class="lab">' + T.yourPt + '</text>' : '';
    var leg = sets.map(function (s, i) { return '<span class="lg lg-' + s.k + '">' + (s.k === 'p' ? T.curveP : T.curveV) + '</span>'; }).join('');
    return '<h3 class="pt-sub">' + T.curveT + '</h3><div class="pt-legend">' + leg + '</div><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(T.curveT + ' ' + p.sku) + '">' + g +
      '<text x="' + (L + iw / 2) + '" y="' + (H - 4) + '" text-anchor="middle" class="ax">psi · bar</text><text transform="translate(14 ' + (Tp + ih / 2) + ') rotate(-90)" text-anchor="middle" class="ax">CFM · m³/h</text>' + lines + dot + '</svg>';
  }

  // ---------- freight estimate ----------
  function regionOf(country, prov) {
    if (country === 'US') return 'US'; if (country !== 'CA') return null;
    return prov === 'QC' ? 'QC' : prov === 'ON' ? 'ON' : ['NB', 'NS', 'PE', 'NL'].indexOf(prov) >= 0 ? 'ATL' : ['MB', 'SK', 'AB', 'BC'].indexOf(prov) >= 0 ? 'WEST' : ['YT', 'NT', 'NU'].indexOf(prov) >= 0 ? 'NORTH' : null;
  }
  function freightEst(lines, country, prov) {
    var fr8 = S.set.freight, rg = regionOf(country, prov); if (!fr8 || !rg) return null;
    var tot = 0, blowers = 0, ok = true;
    lines.forEach(function (l) {
      var p = S.bySku[l.sku]; if (!p || p.kind !== 'blower') return;
      var kw = Number(p.specs.kw) || 0, band = kw <= 3 ? 'small' : kw <= 11 ? 'med' : 'large', rate = fr8[band] && fr8[band][rg];
      if (rate === '' || rate == null || isNaN(Number(rate))) ok = false; else { tot += Number(rate) * l.qty; blowers += l.qty; }
    });
    if (!blowers) { var a = fr8.acc && fr8.acc[rg]; if (a === '' || a == null || isNaN(Number(a)) || !lines.length) return null; return Number(a); }
    return ok ? r2(tot) : null;
  }

  // ---------- admin: freight + lead time settings ----------
  var REG = ['QC', 'ON', 'ATL', 'WEST', 'NORTH', 'US'];
  function settingsForm() {
    var st = S.set || {}, fr8 = st.freight || {};
    function row(band, lab) { return '<tr><th>' + lab + '</th>' + REG.map(function (r) { var val = fr8[band] && fr8[band][r]; return '<td><input class="pt-num" type="number" min="0" step="1" data-fb="' + band + '" data-fr="' + r + '" value="' + (val == null ? '' : esc(val)) + '" aria-label="' + esc(lab + ' ' + T.region[r]) + '"></td>'; }).join('') + '</tr>'; }
    return '<h2 class="pt-h">' + T.setTitle + '</h2><div class="pt-form" style="max-width:820px">' + field('st-lf', T.setLeadFr, 'text', st.lead_fr || '') + field('st-le', T.setLeadEn, 'text', st.lead_en || '') + '</div>' +
      '<p class="pt-sub">' + T.setFreight + '</p><div class="pt-tw"><table class="pt-t pt-set"><thead><tr><th></th>' + REG.map(function (r) { return '<th>' + T.region[r] + '</th>'; }).join('') + '</tr></thead><tbody>' + row('small', T.setSmall) + row('med', T.setMed) + row('large', T.setLarge) + row('acc', T.setAcc) + '</tbody></table></div>' +
      '<p class="pt-note">' + T.setHint + '</p><button class="btn btn--solid" type="button" id="st-save">' + T.save + '</button>';
  }
  function wireSettings(el, say) {
    var b = $('st-save'); if (!b) return;
    b.onclick = function () {
      var fr8 = { small: {}, med: {}, large: {}, acc: {} };
      el.querySelectorAll('[data-fb]').forEach(function (i) { var val = i.value.trim(); if (val !== '') fr8[i.dataset.fb][i.dataset.fr] = Math.max(0, Number(val) || 0); });
      var data = { lead_fr: v('st-lf'), lead_en: v('st-le'), freight: fr8 };
      sb.from('portal_settings').upsert({ id: 1, data: data }).then(function (r) { if (r.error) return say(r.error.message); S.set = data; say(T.saved); });
    };
  }

  // ---------- customer emails (silently skipped until the email service is set up) ----------
  function mailCustomer(body) {
    return sb.functions.invoke('customer-email', { body: body }).then(function (r) { return !!(r.data && r.data.sent); }).catch(function () { return false; });
  }

  // ---------- quote PDF ----------
  function loadScript(src) { return new Promise(function (ok, ko) { if (document.querySelector('script[src="' + src + '"]')) return ok(); var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function imgData(src) { return new Promise(function (ok) { var i = new Image(); i.onload = function () { var c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext('2d').drawImage(i, 0, 0); ok({ d: c.toDataURL('image/png'), w: i.naturalWidth, h: i.naturalHeight }); }; i.onerror = function () { ok(null); }; i.src = src; }); }
  function pm(n) { return usd(n).replace(/[  ]/g, ' '); }
  function pt(s) { return String(s == null ? '' : s).replace(/[  ]/g, ' ').replace(/[≤]/g, '<=').replace(/[^\x00-\xff’–—…€]/g, ''); }
  function makeQuote() {
    var msg = $('pc-msg'), btn = $('pc-quote'); btn.disabled = true; msg.textContent = T.quoteMaking;
    var ship = { name: v('ps-nm'), company: v('ps-co'), phone: v('ps-ph'), country: v('ps-cn'), province: v('ps-pv'), address: v('ps-ad'), city: v('ps-ci'), postal: v('ps-pc') };
    var now = new Date(), until = new Date(now.getTime() + 30 * 864e5), d2 = function (x) { return x.toLocaleDateString(FR ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' }); };
    var number = 'Q' + String(now.getFullYear()).slice(2) + ('0' + (now.getMonth() + 1)).slice(-2) + ('0' + now.getDate()).slice(-2) + '-' + String(Math.floor(1000 + Math.random() * 9000));
    var lines = cart.map(function (l) { var p = S.bySku[l.sku], u = net(p.list_price); return { sku: l.sku, qty: l.qty, mode: l.mode, unit: u, total: r2(u * l.qty), desc: (p.kind === 'blower' ? pname(p) + ', ' + num(p.specs.cfm, 0) + ' CFM (' + num(p.specs.m3h, 0) + ' m³/h), ' + num(p.specs.hp) + ' HP (' + num(p.specs.kw) + ' kW), ' + vlabel(p.specs.volt) : T.kind[p.kind] + (p.specs.port ? ' ' + p.specs.port : '')) + (l.mode ? ' – ' + T.mode[l.mode] : '') }; });
    var sub = r2(lines.reduce(function (a, l) { return a + l.total; }, 0));
    var tx = ship.country === 'CA' ? (TAX[ship.province] || []).map(function (t) { return [t[0] + ' ' + num(t[1], 3) + ' %', r2(sub * t[1] / 100)]; }) : [];
    var total = r2(sub + tx.reduce(function (a, x) { return a + x[1]; }, 0)), fr8 = freightEst(cart, ship.country, ship.province), ld = FR ? S.set.lead_fr || S.set.lead_en : S.set.lead_en || S.set.lead_fr;
    Promise.all([loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'), imgData('/assets/img/stratovac-logo.png'), imgData('/assets/img/id-mark.webp')]).then(function (rs) {
      var doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' }), W = 612, M = 44, y = 40, logo = rs[1], idm = rs[2];
      var ink = [21, 32, 43], mute = [91, 102, 115], acc = [30, 111, 217];
      if (logo) doc.addImage(logo.d, 'PNG', M, y, 34 * logo.w / logo.h, 34);
      if (idm) doc.addImage(idm.d, 'PNG', W - M - 30 * idm.w / idm.h, y + 2, 30 * idm.w / idm.h, 30);
      y += 56; doc.setDrawColor(acc[0], acc[1], acc[2]); doc.setLineWidth(2); doc.line(M, y, W - M, y); y += 26;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(ink[0], ink[1], ink[2]); doc.text(T.quoteT, M, y);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      [[T.quoteNo, number], [T.quoteDate, d2(now)], [T.quoteValid, d2(until)]].forEach(function (r, i) { doc.setTextColor(mute[0], mute[1], mute[2]); doc.text(pt(r[0]), W - M - 150, y - 12 + i * 14); doc.setTextColor(ink[0], ink[1], ink[2]); doc.text(pt(r[1]), W - M, y - 12 + i * 14, { align: 'right' }); });
      y += 34;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(mute[0], mute[1], mute[2]); doc.text(pt(FR ? 'Fournisseur' : 'Supplier'), M, y); doc.text(pt(T.quoteFor), M + 270, y); y += 13;
      doc.setFontSize(10); doc.setTextColor(ink[0], ink[1], ink[2]);
      var seller = ['Stratovac · Part of ID Industries', '1396 des Mouettes', 'Longueuil (QC) J4J 5K2, Canada', '+1 438-880-4655 · abruens@stratovac.ca'];
      var buyer = [ship.company || S.prof.company || '', ship.name || S.prof.full_name || '', S.prof.email || '', ship.address, [ship.city, ship.province, ship.postal].filter(Boolean).join(' '), ship.country === 'US' ? 'United States' : ship.country === 'CA' ? 'Canada' : ''].filter(Boolean);
      for (var i = 0; i < Math.max(seller.length, buyer.length); i++) { if (seller[i]) doc.text(pt(seller[i]), M, y + i * 13); if (buyer[i]) doc.text(pt(buyer[i]), M + 270, y + i * 13); }
      y += Math.max(seller.length, buyer.length) * 13 + 20;
      var cx = [M, M + 118, W - M - 170, W - M - 85, W - M];
      function headRow() { doc.setFillColor(238, 242, 247); doc.rect(M, y - 12, W - 2 * M, 20, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(ink[0], ink[1], ink[2]); doc.text(pt(T.model), cx[0] + 4, y + 1); doc.text(pt(T.quoteDesc), cx[1], y + 1); doc.text(pt(T.quoteQty), cx[2] + 6, y + 1, { align: 'center' }); doc.text(pt(T.quoteUnit), cx[3] + 10, y + 1, { align: 'right' }); doc.text(pt(T.quoteLine), cx[4] - 4, y + 1, { align: 'right' }); y += 22; doc.setFont('helvetica', 'normal'); }
      function footer() { doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(mute[0], mute[1], mute[2]); doc.text(pt('Stratovac · Part of ID Industries · stratovac.ca · ' + T.quoteNo + ' ' + number), M, 770); }
      headRow();
      lines.forEach(function (l) {
        var dl = doc.splitTextToSize(pt(l.desc), cx[2] - cx[1] - 14), h = Math.max(1, dl.length) * 12 + 8;
        if (y + h > 690) { footer(); doc.addPage(); y = 60; headRow(); }
        doc.setFontSize(9.5); doc.setTextColor(ink[0], ink[1], ink[2]); doc.setFont('helvetica', 'bold'); doc.text(pt(l.sku), cx[0] + 4, y); doc.setFont('helvetica', 'normal');
        doc.text(dl, cx[1], y); doc.text(String(l.qty), cx[2] + 6, y, { align: 'center' }); doc.text(pt(pm(l.unit)), cx[3] + 10, y, { align: 'right' }); doc.text(pt(pm(l.total)), cx[4] - 4, y, { align: 'right' });
        y += h - 4; doc.setDrawColor(227, 232, 238); doc.setLineWidth(0.6); doc.line(M, y - 6, W - M, y - 6); y += 6;
      });
      if (y > 600) { footer(); doc.addPage(); y = 60; }
      y += 6; var tx0 = W - M - 230;
      function trow(lab, val, bold) { doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(bold ? 11 : 10); doc.text(pt(lab), tx0, y); doc.text(pt(val), W - M - 4, y, { align: 'right' }); y += bold ? 18 : 15; }
      if (disc()) { doc.setFontSize(9); doc.setTextColor(mute[0], mute[1], mute[2]); doc.text(pt(T.quoteDisc + ' : ' + num(disc()) + ' %'), M, y); doc.setTextColor(ink[0], ink[1], ink[2]); }
      trow(T.sub, pm(sub)); tx.forEach(function (x) { trow(x[0], pm(x[1])); });
      doc.setDrawColor(ink[0], ink[1], ink[2]); doc.setLineWidth(1); doc.line(tx0, y - 10, W - M, y - 10); y += 4; trow(T.total, pm(total), true);
      if (fr8 != null) { doc.setTextColor(mute[0], mute[1], mute[2]); trow(T.freight, pm(fr8)); doc.setFontSize(8); doc.text(pt('(' + T.freightNote + ')'), W - M - 4, y - 6, { align: 'right' }); y += 8; doc.setTextColor(ink[0], ink[1], ink[2]); }
      y += 16; doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(mute[0], mute[1], mute[2]);
      [ld ? T.lead + ' : ' + ld : '', ship.country === 'US' ? T.quoteNotesUS : T.quoteNotes, T.quoteOrder].filter(Boolean).forEach(function (t) { var tl = doc.splitTextToSize(pt(t), W - 2 * M); doc.text(tl, M, y); y += tl.length * 12 + 4; });
      footer();
      var n = doc.getNumberOfPages(); for (var pg = 1; pg <= n; pg++) { doc.setPage(pg); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(mute[0], mute[1], mute[2]); doc.text(pt(T.page + ' ' + pg + ' / ' + n), W - M, 770, { align: 'right' }); }
      doc.save((FR ? 'Soumission-Stratovac-' : 'Quote-Stratovac-') + number + '.pdf');
      sb.from('quotes').insert({ user_id: S.user.id, number: number, items: lines.map(function (l) { return { sku: l.sku, qty: l.qty, mode: l.mode, unit_price: l.unit }; }), subtotal: sub }).then(function () {});
      notify('Soumission ' + number + ' téléchargée – ' + (ship.company || S.prof.company || S.prof.email), 'Soumission ' + number + ' (' + pm(sub) + ' avant taxes)\nClient : ' + (S.prof.company || '') + ' – ' + S.prof.email + '\n\n' + lines.map(function (l) { return l.qty + ' × ' + l.sku + (l.mode ? ' (' + l.mode + ')' : '') + ' – ' + pm(l.total); }).join('\n') + '\n\nhttps://stratovac.ca/fr/portail/#admin');
      btn.disabled = false; msg.textContent = T.quoteOk.replace('{n}', number);
    }).catch(function () { btn.disabled = false; msg.textContent = T.quoteErr; });
  }

  // ---------- order progress ----------
  function timeline(o) {
    if (o.status === 'cancelled') return '<span class="pt-tag pt-tag--warn">' + esc(T.st.cancelled) + '</span><br>';
    var at = { invoice_requested: 0, awaiting_payment: 0, paid: 1, processing: 2, shipped: 3 }[o.status]; if (at == null) at = 0;
    var c = o.carrier && CARRIERS[o.carrier], link = o.tracking && c && c[1] ? c[1] + encodeURIComponent(o.tracking) : null;
    return '<ol class="pt-steps">' + T.steps.map(function (s, i) { return '<li class="' + (i < at ? 'done' : i === at ? 'now' : '') + '">' + esc(s) + '</li>'; }).join('') + '</ol>' +
      (o.tracking ? '<small>' + (c ? esc(c[0]) + ' · ' : '') + T.tracking + ' : ' + esc(o.tracking) + '</small>' + (link ? '<br><a class="pt-link" href="' + esc(link) + '" target="_blank" rel="noopener">' + T.track + ' →</a>' : '') + '<br>' : '');
  }

  // ---------- team (company accounts) ----------
  function teamBox(el) {
    var box = h('div', { class: 'pt-team' }); el.appendChild(box);
    if (!S.prof.org_id) { box.innerHTML = '<h2 class="pt-h">' + T.team + '</h2><p class="pt-note">' + T.teamNone + '</p>'; return; }
    Promise.all([sb.from('profiles').select('id,full_name,email,company,status').eq('org_id', S.prof.org_id), sb.from('shared_carts').select('*').eq('org_id', S.prof.org_id).order('created_at', { ascending: false }).limit(30)]).then(function (rs) {
      var team = rs[0].data || [], carts = rs[1].data || [], byId = {}; S.team = team; team.forEach(function (t) { byId[t.id] = t; });
      var inc = carts.filter(function (c) { return c.from_user !== S.user.id; }), mine = carts.filter(function (c) { return c.from_user === S.user.id; });
      function who(id) { var t = byId[id] || {}; return t.full_name || t.email || ''; }
      function list(c, actions) { return '<tr><td>' + new Date(c.created_at).toLocaleDateString(FR ? 'fr-CA' : 'en-CA') + '<br><small>' + T.by + ' ' + esc(who(c.from_user)) + '</small></td><td><small>' + (c.items || []).map(function (i) { return i.qty + ' × ' + esc(i.sku) + (i.mode ? ' (' + T.mode[i.mode] + ')' : ''); }).join('<br>') + '</small>' + (c.note ? '<br><small><em>' + esc(c.note) + '</em></small>' : '') + '</td><td>' + (actions && c.status === 'open' ? '<button class="pt-add" type="button" data-scl="' + c.id + '">' + T.load + '</button> <button class="pt-link" type="button" data-scd="' + c.id + '">' + T.dismiss + '</button>' : esc({ open: T.stOpen, ordered: T.stOrdered, dismissed: T.stDismissed }[c.status] || c.status)) + '</td></tr>'; }
      box.innerHTML = '<h2 class="pt-h">' + T.team + '</h2><ul class="pt-teaml">' + team.map(function (t) { return '<li><strong>' + esc(t.full_name || t.email) + '</strong> · ' + esc(t.email) + (t.id === S.user.id ? ' ✓' : '') + '</li>'; }).join('') + '</ul>' +
        '<h3 class="pt-sub">' + T.toApprove + '</h3>' + (inc.length ? '<div class="pt-tw"><table class="pt-t"><tbody>' + inc.map(function (c) { return list(c, true); }).join('') + '</tbody></table></div>' : '<p class="pt-note">' + T.none + '</p>') +
        (mine.length ? '<h3 class="pt-sub">' + T.mySent + '</h3><div class="pt-tw"><table class="pt-t"><tbody>' + mine.map(function (c) { return list(c, false); }).join('') + '</tbody></table></div>' : '');
      box.querySelectorAll('[data-scl]').forEach(function (b) { b.onclick = function () { var c = carts.filter(function (x) { return String(x.id) === b.dataset.scl; })[0]; if (!c) return; cart = []; (c.items || []).forEach(function (i) { if (S.bySku[i.sku]) addLine(i.sku, i.qty, i.mode || null); }); sb.from('shared_carts').update({ status: 'ordered' }).eq('id', c.id).then(function () {}); toast(T.loaded); S.tab = 'cart'; history.replaceState(null, '', '#cart'); shell(); }; });
      box.querySelectorAll('[data-scd]').forEach(function (b) { b.onclick = function () { sb.from('shared_carts').update({ status: 'dismissed' }).eq('id', +b.dataset.scd).then(function () { box.remove(); teamBox(el); }); }; });
    });
  }

  // ---------- talk to Anthony ----------
  function talkDialog() {
    var dlg = h('div', { class: 'pt-dlg-bg' }), box = h('div', { class: 'pt-dlg', role: 'dialog', 'aria-modal': 'true', 'aria-label': T.talkT });
    dlg.appendChild(box); document.body.appendChild(dlg);
    function close() { dlg.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey); dlg.onclick = function (e) { if (e.target === dlg) close(); };
    box.innerHTML = '<button class="pt-x" type="button" aria-label="' + T.close + '">×</button><h3>' + T.talkT + '</h3><p class="pt-note">' + T.talkS + '</p><div class="pt-form"><textarea id="tk-m" rows="4" placeholder="' + T.talkPh + '" aria-label="' + T.talkPh + '"></textarea></div><p class="pt-msg" id="tk-o" role="status"></p><div class="pt-acts"><button class="btn btn--line" type="button" data-c>' + T.cancel + '</button><button class="btn btn--solid" type="button" id="tk-s">' + T.talkSend + '</button></div>';
    box.querySelector('.pt-x').onclick = box.querySelector('[data-c]').onclick = close; $('tk-m').focus();
    $('tk-s').onclick = function () {
      var b = $('tk-s'); b.disabled = true; $('tk-o').textContent = T.working;
      var tr = ((S.ai && S.ai.msgs) || []).filter(function (m) { return !m.err && !m.local; }).map(function (m) { return { role: m.role, content: m.content }; });
      sb.functions.invoke('customer-email', { body: { kind: 'handoff', message: v('tk-m'), transcript: tr, cart: cart } }).then(function (r) {
        if (r.data && r.data.sent) { close(); toast(T.talkOk.replace('{e}', S.prof.email)); if (S.ai) { S.ai.msgs.push({ role: 'assistant', content: T.talkOk.replace('{e}', S.prof.email), err: true }); if (S.tab === 'sel') shell(); } }
        else { b.disabled = false; $('tk-o').textContent = T.talkErr; }
      }).catch(function () { b.disabled = false; $('tk-o').textContent = T.talkErr; });
    };
  }

  // ---------- photo helper: shrink to JPEG ----------
  function shrink(file, max) {
    return new Promise(function (ok, ko) {
      var u = URL.createObjectURL(file), i = new Image();
      i.onload = function () { var k = Math.min(1, max / Math.max(i.naturalWidth, i.naturalHeight)), c = document.createElement('canvas'); c.width = Math.round(i.naturalWidth * k); c.height = Math.round(i.naturalHeight * k); c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok({ b64: c.toDataURL('image/jpeg', 0.86).split(',')[1] }); };
      i.onerror = function () { URL.revokeObjectURL(u); ko(new Error('image')); }; i.src = u;
    });
  }

  // ---------- drawings and 3D files (cad/<model base>/...) ----------
  function cadBase(p) { return p.sku.replace(/-\d$/, ''); }
  function cadFiles(p) {
    var el = $('pp-cad'); if (!el || !p) return; var base = cadBase(p), admin = S.prof && S.prof.is_admin;
    sb.storage.from('cad').list(base, { limit: 50 }).then(function (r) {
      var files = (r.data || []).filter(function (f) { return f.name && f.name !== '.emptyFolderPlaceholder'; });
      if (!files.length && !admin) { el.innerHTML = ''; return; }
      el.innerHTML = '<h3 class="pt-sub">' + T.cadT + '</h3>' + (files.length ? '<ul class="pt-files">' + files.map(function (f) { return '<li><button class="pt-link" type="button" data-cadf="' + esc(base + '/' + f.name) + '">' + esc(f.name) + '</button>' + (f.metadata && f.metadata.size ? ' <small>' + num(f.metadata.size / 1048576, 1) + ' Mo</small>' : '') + (admin ? ' <button class="pt-link pt-del" type="button" data-cadx="' + esc(base + '/' + f.name) + '">' + T.cadDel + '</button>' : '') + '</li>'; }).join('') + '</ul>' : '<p class="pt-note">' + T.cadNone + '</p>') +
        (admin ? '<label class="pt-note">' + T.cadUp + ' <input type="file" id="cad-up" multiple accept=".step,.stp,.igs,.iges,.dwg,.dxf,.pdf,.zip,.sat,.x_t"></label>' : '');
      if ($('cad-up')) $('cad-up').onchange = function () {
        var fs = Array.prototype.slice.call($('cad-up').files);
        Promise.all(fs.map(function (f) { return sb.storage.from('cad').upload(base + '/' + f.name.replace(/[^A-Za-z0-9._-]+/g, '_'), f, { upsert: true, contentType: f.type || 'application/octet-stream' }); })).then(function () { cadFiles(p); });
      };
    });
  }

  // ---------- technical selection report (PDF) ----------
  function curveSvgPlain(p, ptx) {
    var pf = p.specs.perf, cv = pf && S.curves && S.curves[pf.frame]; if (!cv) return null;
    var k = ptx.mode === 'vacuum' ? 'v' : 'p', c = (k === 'p' ? cv.flow_press : cv.flow_vac) || [], lim = k === 'p' ? pf.max_p : pf.max_v;
    c = c.filter(function (q) { return q[0] <= lim * 1.001; }); if (c.length < 2) return null;
    var xmax = Math.max(c[c.length - 1][0], ptx.x) / DP.psi, ymax = 0; c.forEach(function (q) { ymax = Math.max(ymax, q[1]); }); ymax = Math.max(ymax, ptx.y);
    var xs = niceStep(xmax / 5), ys = niceStep(ymax / 5); xmax = Math.ceil(xmax / xs) * xs; ymax = Math.ceil(ymax * 1.05 / ys) * ys;
    var W = 640, H = 340, L = 74, R = 18, Tp = 16, B = 56, iw = W - L - R, ih = H - Tp - B, g = '';
    function X(x) { return L + x / xmax * iw; } function Y(y) { return Tp + ih - y / ymax * ih; }
    var st = 'font-family:Arial,Helvetica,sans-serif;font-size:12px;fill:#3a4652';
    for (var x = 0; x <= xmax + 1e-9; x += xs) g += '<line x1="' + X(x) + '" y1="' + Tp + '" x2="' + X(x) + '" y2="' + (Tp + ih) + '" stroke="#e3e8ee"/><text x="' + X(x) + '" y="' + (Tp + ih + 17) + '" text-anchor="middle" style="' + st + '">' + num(x, 2) + '</text><text x="' + X(x) + '" y="' + (Tp + ih + 31) + '" text-anchor="middle" style="' + st + ';font-size:10px;fill:#7a8591">' + num(x * 0.0689476, 2) + '</text>';
    for (var y = 0; y <= ymax + 1e-9; y += ys) g += '<line x1="' + L + '" y1="' + Y(y) + '" x2="' + (L + iw) + '" y2="' + Y(y) + '" stroke="#e3e8ee"/><text x="' + (L - 8) + '" y="' + (Y(y) - 1) + '" text-anchor="end" style="' + st + '">' + num(y, 0) + '</text><text x="' + (L - 8) + '" y="' + (Y(y) + 12) + '" text-anchor="end" style="' + st + ';font-size:10px;fill:#7a8591">' + num(y / 0.588578, 0) + '</text>';
    var line = '<polyline fill="none" stroke="#1e6fd9" stroke-width="3"' + (k === 'v' ? ' stroke-dasharray="8 5"' : '') + ' points="' + c.map(function (q) { return X(q[0] / DP.psi).toFixed(1) + ',' + Y(q[1]).toFixed(1); }).join(' ') + '"/>';
    var dot = '<circle cx="' + X(ptx.x / DP.psi) + '" cy="' + Y(ptx.y) + '" r="7" fill="#d92d20" stroke="#fff" stroke-width="2"/><text x="' + (X(ptx.x / DP.psi) + 11) + '" y="' + (Y(ptx.y) - 9) + '" style="' + st + ';font-weight:bold;fill:#15202b">' + esc(T.yourPt) + '</text>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><rect width="100%" height="100%" fill="#fff"/>' + g + '<text x="' + (L + iw / 2) + '" y="' + (H - 5) + '" text-anchor="middle" style="' + st + ';fill:#15202b">' + (k === 'v' ? esc(T.curveV) : esc(T.curveP)) + ' (psi · bar)</text><text transform="translate(16 ' + (Tp + ih / 2) + ') rotate(-90)" text-anchor="middle" style="' + st + ';fill:#15202b">CFM · m³/h</text>' + line + dot + '</svg>';
  }
  function svgPng(svg) { return new Promise(function (ok) { var i = new Image(); i.onload = function () { var c = document.createElement('canvas'); c.width = i.width * 2; c.height = i.height * 2; var x = c.getContext('2d'); x.scale(2, 2); x.drawImage(i, 0, 0); ok({ d: c.toDataURL('image/png'), w: i.width, h: i.height }); }; i.onerror = function () { ok(null); }; i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }); }
  function makeReport(r) {
    var p = r.p; if (!p) return; toast(T.repMaking);
    var a = p.acc || {}, filt = r.mode === 'vacuum' ? a.vac_filter : a.press_filter, valve = r.mode === 'vacuum' ? a.vac_valve : a.press_valve, crt = filt && S.bySku[filt] && S.bySku[filt].acc && S.bySku[filt].acc.cartridge;
    loadCurves().then(function () {
      var svg = curveSvgPlain(p, { mode: r.mode, x: r.dpAir, y: r.acfm });
      return Promise.all([loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'), imgData('/assets/img/stratovac-logo.png'), imgData('/assets/img/id-mark.webp'), svg ? svgPng(svg) : Promise.resolve(null)]);
    }).then(function (rs) {
      var doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' }), W = 612, M = 44, y = 40, logo = rs[1], idm = rs[2], chart = rs[3];
      var ink = [21, 32, 43], mute = [91, 102, 115], acc = [30, 111, 217], s = p.specs;
      if (logo) doc.addImage(logo.d, 'PNG', M, y, 34 * logo.w / logo.h, 34);
      if (idm) doc.addImage(idm.d, 'PNG', W - M - 30 * idm.w / idm.h, y + 2, 30 * idm.w / idm.h, 30);
      y += 56; doc.setDrawColor(acc[0], acc[1], acc[2]); doc.setLineWidth(2); doc.line(M, y, W - M, y); y += 26;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(ink[0], ink[1], ink[2]); doc.text(pt(T.repT), M, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text(pt(new Date().toLocaleDateString(FR ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' })), W - M, y, { align: 'right' });
      y += 16; doc.setTextColor(mute[0], mute[1], mute[2]); doc.text(pt(T.repPrepared + ' : ' + (S.prof.company || '') + ' – ' + (S.prof.full_name || S.prof.email)), M, y);
      y += 24; doc.setTextColor(ink[0], ink[1], ink[2]); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(pt(p.sku), M, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); y += 14;
      var dl = doc.splitTextToSize(pt(pname(p) + (s.double_flow ? ', ' + T.dbl : '') + ' · ' + s.stages + ' ' + T.stg + ' · ' + num(s.hp) + ' HP (' + num(s.kw) + ' kW) · ' + vlabel(s.volt) + ', 60 Hz · ' + (s.port || '') + ' NPT'), W - 2 * M); doc.text(dl, M, y); y += dl.length * 12 + 12;
      function sec(t) { doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(acc[0], acc[1], acc[2]); doc.text(pt(t), M, y); y += 6; doc.setDrawColor(227, 232, 238); doc.setLineWidth(0.8); doc.line(M, y, W - M, y); y += 14; doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(ink[0], ink[1], ink[2]); }
      function row(l, val) { var vl = doc.splitTextToSize(pt(val), W - 2 * M - 200); doc.setTextColor(mute[0], mute[1], mute[2]); doc.text(pt(l), M, y); doc.setTextColor(ink[0], ink[1], ink[2]); doc.text(vl, M + 200, y); y += 13 * vl.length + 3; }
      var gasName = { air: 'air', biogas: FR ? 'biogaz (60 % CH4 / 40 % CO2)' : 'biogas (60 % CH4 / 40 % CO2)', methane: FR ? 'méthane' : 'methane', natural_gas: FR ? 'gaz naturel' : 'natural gas', nitrogen: FR ? 'azote' : 'nitrogen', oxygen: FR ? 'oxygène' : 'oxygen', co2: 'CO2', argon: 'argon', helium: FR ? 'hélium' : 'helium', hydrogen: FR ? 'hydrogène' : 'hydrogen', landfill_gas: FR ? 'gaz d’enfouissement' : 'landfill gas' }[r.gas] || r.gas;
      var tF = r.temp == null ? 68 : r.temp;
      sec(T.repCond);
      row(T.repUse, r.mode === 'vacuum' ? T.vac : T.press);
      row(T.repFlowReq, (r.given && !/^[\d.,\s]+(A|I)?CFM$/i.test(r.given) ? r.given + ' = ' : '') + num(r.acfm, 0) + ' CFM · ' + num(r.acfm / 0.588578, 0) + ' m³/h ' + (FR ? '(débit réel à l’aspiration)' : '(actual inlet flow)'));
      row(T.repLevel, (r.mode === 'vacuum' ? '-' : '') + num(r.psi, 2) + ' psi · ' + num(r.psi * 0.0689476, 3) + ' bar');
      row(T.repGas, gasName + (r.mw ? ' (M = ' + num(r.mw, 1) + ' g/mol)' : ''));
      row(T.repAlt, num(r.alt || 0, 0) + ' ft · ' + num((r.alt || 0) * 0.3048, 0) + ' m');
      row(T.repTemp, num(tF, 0) + ' °F · ' + num((tF - 32) / 1.8, 0) + ' °C');
      row(T.repVolt, vlabel(s.volt) + ', 60 Hz');
      if (r.rho && Math.abs(r.rho - 1) > 0.02) row(T.repEq, num(r.dpAir / DP.psi, 2) + ' psi · ' + num(r.dpAir / DP.bar, 3) + ' bar (' + (FR ? 'densité relative ' : 'density ratio ') + num(r.rho, 2) + ')');
      y += 8; sec(T.repRes);
      row(T.repFlowAt, num(r.qa, 0) + ' CFM · ' + num(r.qa / 0.588578, 0) + ' m³/h');
      row(T.repMargin, '+' + num((r.qa / r.acfm - 1) * 100, 0) + ' %');
      if (r.kw != null) row(T.repPow, num(r.kw, 2) + ' kW · ' + num(r.kw / 0.7457, 2) + ' HP');
      if (r.lim_psi) row(T.repLim, num(r.lim_psi, 2) + ' psi · ' + num(r.lim_psi * 0.0689476, 3) + ' bar');
      if (r.energy != null) row(T.repEnergy, pm(r.energy) + (FR ? ' / an (' : ' / yr (') + num(r.hours, 0) + ' h, ' + num(r.rate, 2) + (FR ? ' $ US/kWh, rendement moteur 90 %)' : ' US$/kWh, 90 % motor efficiency)'));
      if (chart) { y += 6; var cw = W - 2 * M, chh = cw * chart.h / chart.w, avail = 735 - y; if (chh > avail) { if (avail >= 190) { cw = cw * avail / chh; chh = avail; } else { doc.addPage(); y = 50; } } doc.addImage(chart.d, 'PNG', M + (W - 2 * M - cw) / 2, y, cw, chh); y += chh + 16; }
      if (y > 640) { doc.addPage(); y = 50; }
      sec(T.repAcc);
      if (filt) row(T.repFilter, filt + (S.bySku[filt] ? ' · ' + T.kind[S.bySku[filt].kind] + ' ' + (S.bySku[filt].specs.port || '') : ''));
      if (valve) row(T.repValve, valve + (S.bySku[valve] ? ' · ' + T.kind[S.bySku[valve].kind] + ' ' + (S.bySku[valve].specs.port || '') : ''));
      if (crt) row(T.repCart, crt);
      y += 10; doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(mute[0], mute[1], mute[2]); var nt = doc.splitTextToSize(pt(T.repNote), W - 2 * M); if (y + nt.length * 11 > 750) { doc.addPage(); y = 50; } doc.text(nt, M, y);
      var n = doc.getNumberOfPages(); for (var pg = 1; pg <= n; pg++) { doc.setPage(pg); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(mute[0], mute[1], mute[2]); doc.text(pt('Stratovac · Part of ID Industries · stratovac.ca · +1 438-880-4655'), M, 770); doc.text(pt(T.page + ' ' + pg + ' / ' + n), W - M, 770, { align: 'right' }); }
      doc.save((FR ? 'Rapport-selection-' : 'Selection-report-') + p.sku + '.pdf');
    }).catch(function () { toast(T.quoteErr); });
  }

  // ---------- boot ----------
  var recovering = false;
  function boot() {
    sb.auth.getSession().then(function (r) {
      var ses = r.data && r.data.session;
      if (recovering) return authView('recover');
      if (!ses) { S.user = null; return authView(location.hash === '#signup' ? 'signup' : 'login'); }
      S.user = ses.user;
      sb.from('profiles').select('*').eq('id', S.user.id).single().then(function (pr) {
        S.prof = pr.data;
        if (!S.prof || (S.prof.status !== 'approved' && !S.prof.is_admin)) {
          root.innerHTML = '<p class="pt-msg">' + (S.prof && S.prof.status === 'rejected' ? T.rejected : T.pending) + '</p><button class="pt-link" type="button" id="pt-out-btn">' + T.logout + '</button>';
          $('pt-out-btn').onclick = function () { sb.auth.signOut(); }; return;
        }
        Promise.all([sb.from('products').select('*').order('sort'), sb.from('portal_settings').select('data').eq('id', 1).maybeSingle()]).then(function (rs) {
          var pp = rs[0]; S.set = (rs[1].data && rs[1].data.data) || {};
          sb.functions.invoke('fx', { body: {} }).then(function (r) { if (r.data && r.data.rate) { S.fx = r.data; if (['cart', 'prod', 'cat'].indexOf(S.tab) >= 0) shell(); } }).catch(function () {});
          S.team = [];
          if (S.prof.org_id) sb.from('profiles').select('id,full_name,email,company,status').eq('org_id', S.prof.org_id).then(function (t) { S.team = t.data || []; });
          S.prods = pp.data || []; S.bySku = {}; S.prods.forEach(function (p) { S.bySku[p.sku] = p; });
          route(true);
          window.addEventListener('hashchange', function () { route(false); });
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
