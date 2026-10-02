// Paste this into Extensions > Apps Script of your Google Sheet, then deploy as a Web App.
const RSVP_SHEET = 'RSVP';
const WISH_SHEET = 'Wishes';
const RSVP_HEADERS = ['Timestamp', 'Name', 'Attending', 'Guests', 'Note', 'Invite link name'];
const WISH_HEADERS = ['Timestamp', 'Name', 'Message', 'Hidden'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === 'rsvp') {
      const name = clean(data.name, 100);
      if (!name) return json({ ok: false, error: 'Name required' });
      const attending = data.attending === 'yes';
      getSheet(ss, RSVP_SHEET, RSVP_HEADERS).appendRow([
        new Date(),
        name,
        attending ? 'Yes' : 'No',
        attending ? Math.min(10, Math.max(1, Number(data.guests) || 1)) : 0,
        clean(data.note, 500),
        clean(data.invitedAs, 40),
      ]);
      return json({ ok: true });
    }

    if (data.type === 'wish') {
      const name = clean(data.name, 60);
      const message = clean(data.message, 300);
      if (!name || !message) return json({ ok: false, error: 'Name and message required' });
      getSheet(ss, WISH_SHEET, WISH_HEADERS).appendRow([new Date(), name, message, false]);
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Unknown type' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Public endpoint: returns ONLY wishes. RSVP data is never exposed.
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WISH_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return json({ ok: true, wishes: [] });
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  const wishes = rows
    .filter((r) => r[1] && r[2] && String(r[3]).toUpperCase() !== 'TRUE')
    .map((r) => ({ name: String(r[1]), message: String(r[2]) }))
    .reverse();
  return json({ ok: true, wishes });
}

function getSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    if (name === WISH_SHEET) {
      sheet.getRange('D2:D1000').insertCheckboxes();
    }
  }
  return sheet;
}

// Trims, limits length, and stops values like "=IMPORTXML(...)" from running as formulas.
function clean(value, max) {
  const s = String(value == null ? '' : value).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
