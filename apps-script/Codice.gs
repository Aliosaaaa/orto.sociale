/**
 * Orto Sociale — ricezione lead dal modulo del sito e salvataggio su Google Sheet.
 *
 * COME INSTALLARLO (una volta sola):
 *  1. Apri il foglio Google:
 *     https://docs.google.com/spreadsheets/d/1fIQrf27cQi525pIdnzeSwmVDRU4cpyS9XLE9hCZFThs/edit
 *  2. Menu: Estensioni → Apps Script
 *  3. Cancella tutto il codice di esempio e incolla QUESTO file.
 *  4. (Facoltativo) In NOTIFICA_EMAIL metti la tua email per ricevere un avviso a ogni richiesta.
 *  5. Salva (icona floppy).
 *  6. In alto: Distribuisci → Nuova distribuzione → tipo "App web".
 *        - Descrizione: "Modulo Orto Sociale"
 *        - Esegui come: Me (il tuo account)
 *        - Chi ha accesso: Chiunque
 *     → Distribuisci → autorizza (scegli il tuo account, "Consenti").
 *  7. Copia l'URL che finisce con "/exec".
 *  8. Incollalo in assets/js/main.js nella riga  var SCRIPT_URL = '...';
 *
 * Per aggiornare il codice in futuro: Distribuisci → Gestisci distribuzioni →
 * (matita) → Versione: Nuova versione → Distribuisci. L'URL /exec resta lo stesso.
 */

// ⬇️ Lascia vuoto per non ricevere email, oppure metti "tuamail@esempio.it"
var NOTIFICA_EMAIL = '';

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

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
