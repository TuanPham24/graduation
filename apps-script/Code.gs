// Paste this into Extensions > Apps Script of your Google Sheet, then deploy as a Web App.
const RSVP_SHEET = 'RSVP';
const WISH_SHEET = 'Wishes';
const RSVP_HEADERS = ['Thời gian', 'Tên', 'Tham dự', 'Ghi chú', 'Tên trong link mời', 'Mã phản hồi'];
const WISH_HEADERS = ['Thời gian', 'Tên', 'Lời chúc', 'Ẩn'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === 'rsvp') {
      const name = clean(data.name, 100);
      if (!name) return json({ ok: false, error: 'Name required' });
      const sheet = getSheet(ss, RSVP_SHEET, RSVP_HEADERS);
      ensureHeaders(sheet, RSVP_HEADERS);
      // Each guest's browser sends a random id with its answer. Editing the answer
      // re-sends the same id, so we update that row instead of adding a duplicate.
      // Different people with the same name have different ids, so they never clash.
      const id = String(data.id || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 64);
      const row = [
        new Date(),
        name,
        data.attending === 'yes' ? 'Có' : 'Không',
        clean(data.note, 500),
        clean(data.invitedAs, 40),
        id,
      ];
      const existing = id ? findRowById(sheet, RSVP_HEADERS.length, id) : 0;
      if (existing) {
        sheet.getRange(existing, 1, 1, row.length).setValues([row]);
      } else {
        sheet.appendRow(row);
      }
      return json({ ok: true, updated: Boolean(existing) });
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

// Adds header cells missing from sheets created by an older version of this script.
function ensureHeaders(sheet, headers) {
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  headers.forEach((h, i) => {
    if (current[i] !== h) sheet.getRange(1, i + 1).setValue(h).setFontWeight('bold');
  });
}

// Row number (1-based) whose id column equals `id`, or 0 if none.
function findRowById(sheet, idCol, id) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const hit = sheet.getRange(2, idCol, last - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
  return hit ? hit.getRow() : 0;
}

// Trims, limits length, and stops values like "=IMPORTXML(...)" from running as formulas.
function clean(value, max) {
  const s = String(value == null ? '' : value).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
