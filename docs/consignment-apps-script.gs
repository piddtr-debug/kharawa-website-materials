/**
 * KHARAWA: receive consignment requests from the website -> save to Google Sheet, store photos in Google Drive, email the owner.
 * Paste this in Extensions > Apps Script of your Google Sheet (setup guide in the docs folder).
 */
var OWNER_EMAIL = '';            // put your email between the quotes to get notifications (leave empty for none)
var SHEET_NAME = '\u0e1d\u0e32\u0e01\u0e02\u0e32\u0e22';
var FOLDER_NAME = 'KHARAWA \u0e1d\u0e32\u0e01\u0e02\u0e32\u0e22 (\u0e23\u0e39\u0e1b)';
var MAX_PHOTOS = 4;
var MAX_PHOTO_CHARS = 2500000;    // about 1.8 MB per photo after resizing (base64)
var HEADERS = ['\u0e40\u0e27\u0e25\u0e32\u0e17\u0e35\u0e48\u0e2a\u0e48\u0e07', '\u0e40\u0e25\u0e02\u0e2d\u0e49\u0e32\u0e07\u0e2d\u0e34\u0e07', '\u0e41\u0e1a\u0e23\u0e19\u0e14\u0e4c', '\u0e0a\u0e37\u0e48\u0e2d\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32', '\u0e2b\u0e21\u0e27\u0e14\u0e2b\u0e21\u0e39\u0e48', '\u0e44\u0e0b\u0e0b\u0e4c', '\u0e2a\u0e20\u0e32\u0e1e', '\u0e23\u0e32\u0e04\u0e32\u0e17\u0e35\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23 (\u0e1a\u0e32\u0e17)', '\u0e0a\u0e48\u0e2d\u0e07\u0e17\u0e32\u0e07\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d', '\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14', '\u0e08\u0e33\u0e19\u0e27\u0e19\u0e23\u0e39\u0e1b', '\u0e25\u0e34\u0e07\u0e01\u0e4c\u0e23\u0e39\u0e1b', '\u0e2a\u0e16\u0e32\u0e19\u0e30'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse(e.postData.contents);
    if (d.website) return out_({ ok: true });                       // honeypot: bots fill the hidden field
    if (!d.consent || !d.itemName || !d.contact || !d.size || !d.ref) return out_({ ok: false, error: 'invalid' });
    if (!/^KH-C-\d{6}-[A-Z2-9]{4}$/.test(String(d.ref))) return out_({ ok: false, error: 'invalid-ref' });

    var sheet = getSheet_();
    var links = savePhotos_(d);
    sheet.appendRow([
      new Date(), s_(d.ref, 30), s_(d.brand, 80), s_(d.itemName, 200), s_(d.category, 60), s_(d.size, 60),
      s_(d.condition, 60), s_(d.price, 20), s_(d.contact, 200), s_(d.details, 2000), links.length, links.join('\n'), '\u0e23\u0e2d\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a'
    ]);
    notify_(d, links);
    return out_({ ok: true, ref: d.ref });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet() { return out_({ ok: true, service: 'kharawa-consignment' }); }

function out_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

// Trim length and neutralise formulas (a value starting with = + - @ would be read as a formula in Sheets)
function s_(v, max) {
  var t = String(v == null ? '' : v).replace(/\s+$/, '').substring(0, max);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function savePhotos_(d) {
  var links = [];
  var photos = (d.photos || []).slice(0, MAX_PHOTOS);
  if (!photos.length) return links;
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  var root = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
  var folder = root.createFolder(String(d.ref));
  photos.forEach(function (p, i) {
    if (!p || !p.data || p.data.length > MAX_PHOTO_CHARS || p.mime !== 'image/jpeg') return;
    var blob = Utilities.newBlob(Utilities.base64Decode(p.data), 'image/jpeg', d.ref + '-' + (i + 1) + '.jpg');
    links.push(folder.createFile(blob).getUrl());               // files stay private to this Google account
  });
  return links;
}

function notify_(d, links) {
  if (!OWNER_EMAIL) return;
  var body = ['\u0e21\u0e35\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e1d\u0e32\u0e01\u0e02\u0e32\u0e22\u0e43\u0e2b\u0e21\u0e48', '', '\u0e40\u0e25\u0e02\u0e2d\u0e49\u0e32\u0e07\u0e2d\u0e34\u0e07: ' + d.ref, '\u0e41\u0e1a\u0e23\u0e19\u0e14\u0e4c: ' + d.brand, '\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32: ' + d.itemName, '\u0e2b\u0e21\u0e27\u0e14\u0e2b\u0e21\u0e39\u0e48: ' + d.category,
    '\u0e44\u0e0b\u0e0b\u0e4c: ' + d.size, '\u0e2a\u0e20\u0e32\u0e1e: ' + d.condition, '\u0e23\u0e32\u0e04\u0e32\u0e17\u0e35\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23: ' + (d.price || '-'), '\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d: ' + d.contact, '\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14: ' + (d.details || '-'), '',
    '\u0e23\u0e39\u0e1b: ' + (links.length ? '\n' + links.join('\n') : '\u0e44\u0e21\u0e48\u0e21\u0e35'), '', '\u0e14\u0e39\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e43\u0e19 Google Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()].join('\n');
  MailApp.sendEmail(OWNER_EMAIL, '[KHARAWA] \u0e1d\u0e32\u0e01\u0e02\u0e32\u0e22\u0e43\u0e2b\u0e21\u0e48 ' + d.ref, body);
}
