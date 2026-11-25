// Paste this into Extensions > Apps Script of your Google Sheet, then deploy as a Web App.
const RSVP_SHEET = 'RSVP';
const WISH_SHEET = 'Wishes';
const RSVP_HEADERS = ['Thời gian', 'Tên', 'Tham dự', 'Ghi chú', 'Tên trong link mời', 'Mã phản hồi', 'Cập nhật lúc'];
const WISH_HEADERS = ['Thời gian', 'Tên', 'Lời chúc', 'Ẩn', 'Mã lời chúc', 'Cập nhật lúc'];
const RSVP_ID_COL = 6;
const WISH_HIDDEN_COL = 4;
const WISH_ID_COL = 5;

// Each guest's browser sends a random id with its answer/wish. Sending again with
// the same id updates that row instead of adding a new one. Two people with the
// same name have different ids, so they always stay separate rows.
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const id = cleanId(data.id);
    const now = new Date();

    if (data.type === 'rsvp') {
      const name = clean(data.name, 100);
      if (!name) return json({ ok: false, error: 'Name required' });
      const sheet = getSheet(ss, RSVP_SHEET, RSVP_HEADERS);
      const fields = [
        name,
        data.attending === 'yes' ? 'Có' : 'Không',
        clean(data.note, 500),
        clean(data.invitedAs, 40),
      ];
      const row = id ? findRowById(sheet, RSVP_ID_COL, id) : 0;
      if (row) {
        // Keep the first-sent time in column A; columns B..E get the new answer.
        sheet.getRange(row, 2, 1, fields.length).setValues([fields]);
        sheet.getRange(row, 7).setValue(now);
      } else {
        sheet.appendRow([now, ...fields, id, '']);
      }
      return json({ ok: true, updated: Boolean(row) });
    }

    if (data.type === 'wish') {
      const name = clean(data.name, 60);
      const message = clean(data.message, 300);
      if (!name || !message) return json({ ok: false, error: 'Name and message required' });
      const sheet = getSheet(ss, WISH_SHEET, WISH_HEADERS);
      let row = id ? findRowById(sheet, WISH_ID_COL, id) : 0;
      const updated = Boolean(row);
      if (row) {
        // The "Ẩn" box is left as it is, so editing never un-hides a wish you hid.
        sheet.getRange(row, 2, 1, 2).setValues([[name, message]]);
        sheet.getRange(row, 6).setValue(now);
      } else {
        sheet.appendRow([now, name, message, false, id, '']);
        row = sheet.getLastRow();
      }
      ensureCheckbox(sheet, row, WISH_HIDDEN_COL);
      return json({ ok: true, updated });
    }

    return json({ ok: false, error: 'Unknown type' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Public endpoint: returns ONLY wishes (no ids). RSVP data is never exposed.
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
    // No pre-filled checkbox column here: an unchecked box holds FALSE, which counts
    // as data, so appendRow would skip past it and write far below the real rows.
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  } else {
    ensureHeaders(sheet, headers);
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

// Turns one cell into a checkbox while keeping its current ticked/unticked value
// (insertCheckboxes on its own would reset it to unticked).
function ensureCheckbox(sheet, row, col) {
  const cell = sheet.getRange(row, col);
  const rule = cell.getDataValidation();
  if (rule && rule.getCriteriaType() === SpreadsheetApp.DataValidationCriteria.CHECKBOX) return;
  const checked = String(cell.getValue()).toUpperCase() === 'TRUE';
  cell.insertCheckboxes();
  cell.setValue(checked);
}

// Row number (1-based) whose id column equals `id`, or 0 if none.
function findRowById(sheet, idCol, id) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const hit = sheet.getRange(2, idCol, last - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
  return hit ? hit.getRow() : 0;
}

function cleanId(value) {
  return String(value || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 64);
}

// Trims, limits length, and stops values like "=IMPORTXML(...)" from running as formulas.
function clean(value, max) {
  const s = String(value == null ? '' : value).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
