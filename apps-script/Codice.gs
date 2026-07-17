/**
 * Orto Sociale — riceve i lead dal modulo del sito, li salva su Google Sheet
 * e (se configurato) li iscrive automaticamente a una lista Brevo.
 *
 * ── SALVATAGGIO SU FOGLIO ──────────────────────────────────────────────
 * Funziona da subito: ogni invio del modulo aggiunge una riga a questo foglio.
 *
 * ── ISCRIZIONE AUTOMATICA A BREVO (facoltativa ma consigliata) ─────────
 * Per attivarla basta inserire la chiave API di Brevo nelle Proprietà script:
 *   1. In alto a sinistra: ⚙ Impostazioni progetto
 *   2. Sezione "Proprietà script" → "Aggiungi proprietà script"
 *   3. Proprietà:  BREVO_API_KEY
 *      Valore:     (incolla la tua chiave API v3 di Brevo — la trovi su
 *                   Brevo → in alto a destra sul tuo nome → "SMTP e API" →
 *                   scheda "Chiavi API" → Genera una nuova chiave API)
 *   4. Salva.
 * La lista "ORTO SOCIALE - SITO" viene creata da sola al primo lead con email.
 * (Facoltativo) puoi forzare una lista esistente aggiungendo la proprietà
 * BREVO_LIST_ID con l'ID numerico della lista.
 *
 * ── AGGIORNARE QUESTO CODICE ───────────────────────────────────────────
 * Dopo aver modificato il codice: Distribuisci → Gestisci distribuzioni →
 * (matita) → Versione: Nuova versione → Distribuisci. L'URL /exec non cambia.
 */

// ⬇️ Lascia vuoto per non ricevere email, oppure metti "tuamail@esempio.it"
var NOTIFICA_EMAIL = '';

// Nome della lista Brevo creata/usata per i lead del sito.
var BREVO_LIST_NAME = 'ORTO SOCIALE - SITO';

var HEADERS = ['Data e ora', 'Nome', 'Telefono', 'Email', 'Interesse', 'Messaggio', 'Pagina'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // evita scritture sovrapposte
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Se il foglio è vuoto, scrivi le intestazioni.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var now = Utilities.formatDate(new Date(), 'Europe/Rome', 'dd/MM/yyyy HH:mm:ss');
    sheet.appendRow([
      now,
      p.name || '',
      p.phone || '',
      p.email || '',
      p.interest || '',
      p.message || '',
      p.page || ''
    ]);

    // Iscrizione a Brevo (non blocca mai il salvataggio del foglio).
    try { addToBrevo_(p); } catch (bErr) { console.error('Brevo: ' + bErr); }

    if (NOTIFICA_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFICA_EMAIL,
        subject: '🌱 Nuova richiesta dal sito Orto Sociale — ' + (p.name || 'senza nome'),
        body: 'Nome: ' + (p.name || '-') +
              '\nTelefono: ' + (p.phone || '-') +
              '\nEmail: ' + (p.email || '-') +
              '\nInteresse: ' + (p.interest || '-') +
              '\nMessaggio: ' + (p.message || '-') +
              '\n\nRicevuto il ' + now
      });
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Utile per un test rapido aprendo l'URL /exec nel browser.
function doGet() {
  return json({ ok: true, message: 'Orto Sociale endpoint attivo.' });
}

/* ─────────────────────────── BREVO ─────────────────────────── */

// Aggiunge/aggiorna il contatto nella lista Brevo. Silenzioso se non configurato
// o se manca l'email (Brevo identifica i contatti tramite email).
function addToBrevo_(p) {
  var key = PropertiesService.getScriptProperties().getProperty('BREVO_API_KEY');
  if (!key) return;                 // Brevo non ancora configurato → salta
  if (!p.email) return;             // senza email non si crea un contatto Brevo

  var listId = brevoListId_(key);
  if (!listId) return;

  brevoApi_('POST', 'https://api.brevo.com/v3/contacts', {
    email: String(p.email).trim(),
    updateEnabled: true,            // aggiorna se il contatto esiste già
    attributes: {
      NOME: p.name || '',
      TELEFONO: p.phone || '',
      FONTE: 'Sito Orto Sociale'
    },
    listIds: [listId]
  }, key);
}

// Ritorna l'ID della lista Brevo, creandola se non esiste. Memorizza l'ID
// nelle Proprietà script così le chiamate successive sono immediate.
function brevoListId_(key) {
  var props = PropertiesService.getScriptProperties();
  var cached = props.getProperty('BREVO_LIST_ID');
  if (cached) return Number(cached);

  // 1) Cerca una lista con lo stesso nome (max 50 liste, ordinate per data).
  var lists = brevoApi_('GET', 'https://api.brevo.com/v3/contacts/lists?limit=50&offset=0&sort=desc', null, key);
  if (lists && lists.lists) {
    for (var i = 0; i < lists.lists.length; i++) {
      if (lists.lists[i].name === BREVO_LIST_NAME) {
        props.setProperty('BREVO_LIST_ID', String(lists.lists[i].id));
        return lists.lists[i].id;
      }
    }
  }

  // 2) Serve un folder per creare la lista: usa il primo o creane uno.
  var folderId;
  var folders = brevoApi_('GET', 'https://api.brevo.com/v3/contacts/folders?limit=10&offset=0', null, key);
  if (folders && folders.folders && folders.folders.length) {
    folderId = folders.folders[0].id;
  } else {
    var nf = brevoApi_('POST', 'https://api.brevo.com/v3/contacts/folders', { name: 'Orto Sociale' }, key);
    folderId = nf.id;
  }

  // 3) Crea la lista e memorizza l'ID.
  var created = brevoApi_('POST', 'https://api.brevo.com/v3/contacts/lists', { name: BREVO_LIST_NAME, folderId: folderId }, key);
  if (created && created.id) {
    props.setProperty('BREVO_LIST_ID', String(created.id));
    return created.id;
  }
  return null;
}

// Piccolo wrapper per le chiamate REST a Brevo.
function brevoApi_(method, url, body, key) {
  var opt = {
    method: method,
    headers: { 'api-key': key, 'accept': 'application/json' },
    muteHttpExceptions: true
  };
  if (body) {
    opt.contentType = 'application/json';
    opt.payload = JSON.stringify(body);
  }
  var res = UrlFetchApp.fetch(url, opt);
  var txt = res.getContentText();
  try { return txt ? JSON.parse(txt) : {}; }
  catch (e) { return { _raw: txt, _code: res.getResponseCode() }; }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
