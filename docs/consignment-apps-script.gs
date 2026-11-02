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
    if (d.events) return lineWebhook_(d);                           // LINE chat webhook (line-chat.gs)
    if (d.action && /^chat/.test(String(d.action))) return chatAdmin_(d);   // admin chat page (line-chat.gs)
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

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'list') {
    try { return out_(listItems_()); } catch (err) { return out_({ ok: false, error: String(err) }); }
  }
  return out_({ ok: true, service: 'kharawa-consignment' });
}

// ---- Public listing: rows whose status column says Listed / Reserved / Sold (Thai words below) ----
// Customer contact details are never returned. Photos of listed rows are shared as "anyone with the link can view".
var STATUS_MAP = { '\u0e25\u0e07\u0e02\u0e32\u0e22': 'available', '\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e02\u0e32\u0e22': 'available', '\u0e08\u0e2d\u0e07\u0e41\u0e25\u0e49\u0e27': 'reserved', '\u0e02\u0e32\u0e22\u0e41\u0e25\u0e49\u0e27': 'sold' };
var CONDITION_MAP = { '\u0e40\u0e2b\u0e21\u0e37\u0e2d\u0e19\u0e43\u0e2b\u0e21\u0e48': 'new', '\u0e2a\u0e20\u0e32\u0e1e\u0e14\u0e35': 'good', '\u0e21\u0e35\u0e23\u0e48\u0e2d\u0e07\u0e23\u0e2d\u0e22\u0e01\u0e32\u0e23\u0e43\u0e0a\u0e49\u0e07\u0e32\u0e19': 'used', 'like new': 'new', 'good condition': 'good', 'visible wear': 'used' };
var CATEGORY_MAP = { '\u0e40\u0e2a\u0e37\u0e49\u0e2d\u0e22\u0e37\u0e14': 'tee', '\u0e40\u0e2a\u0e37\u0e49\u0e2d\u0e40\u0e0a\u0e34\u0e49\u0e15 / \u0e40\u0e2a\u0e37\u0e49\u0e2d\u0e21\u0e35\u0e01\u0e23\u0e30\u0e14\u0e38\u0e21': 'shirt', '\u0e41\u0e08\u0e47\u0e01\u0e40\u0e01\u0e47\u0e15 / \u0e40\u0e2a\u0e37\u0e49\u0e2d\u0e04\u0e25\u0e38\u0e21': 'outer', '\u0e01\u0e32\u0e07\u0e40\u0e01\u0e07 / \u0e01\u0e23\u0e30\u0e42\u0e1b\u0e23\u0e07': 'bottoms', '\u0e2b\u0e21\u0e27\u0e01': 'cap', '\u0e41\u0e2d\u0e47\u0e01\u0e40\u0e0b\u0e2a\u0e0b\u0e2d\u0e23\u0e35': 'accessory', '\u0e2d\u0e37\u0e48\u0e19\u0e46': 'other',
  'tee': 'tee', 'shirt / button-up': 'shirt', 'jacket / outerwear': 'outer', 'trousers / skirt': 'bottoms', 'cap': 'cap', 'accessory': 'accessory', 'other': 'other' };
var CACHE_SECONDS = 120;

function listItems_() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('list-v1');
  if (hit) return JSON.parse(hit);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var items = [];
  if (sheet) applyStatusDropdown_(sheet);
  if (sheet && sheet.getLastRow() > 1) {
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues();
    rows.forEach(function (r) {
      var status = STATUS_MAP[String(r[12]).trim()];
      if (!status || !r[1] || !r[3]) return;
      var photos = publicPhotos_(String(r[11]));
      var cond = CONDITION_MAP[String(r[6]).trim().toLowerCase()] || 'good';
      var cat = String(r[4]).trim();
      items.push({
        id: String(r[1]), brand: String(r[2]) || 'KHARAWA', name: String(r[3]), category: cat, categoryCode: CATEGORY_MAP[cat.toLowerCase()] || 'other',
        size: String(r[5]), condition: cond, price: Number(r[7]) > 0 ? Number(r[7]) : null,
        details: String(r[9]).substring(0, 400), status: status, photos: photos,
        listedAt: r[0] instanceof Date ? r[0].getTime() : 0
      });
    });
    items.sort(function (a, b) { return b.listedAt - a.listedAt; });
  }
  var result = { ok: true, items: items, updatedAt: new Date().getTime() };
  try { cache.put('list-v1', JSON.stringify(result), CACHE_SECONDS); } catch (x) {}
  return result;
}

function publicPhotos_(linksText) {
  var urls = [];
  var re = /\/d\/([A-Za-z0-9_-]+)/g, m;
  while ((m = re.exec(linksText)) !== null) {
    var id = m[1];
    try {
      var file = DriveApp.getFileById(id);
      if (file.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK && file.getSharingAccess() !== DriveApp.Access.ANYONE) {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }
      urls.push('https://lh3.googleusercontent.com/d/' + id + '=w1000');
    } catch (err) { /* file removed or not shareable: skip */ }
  }
  return urls;
}

function out_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

// Trim length and neutralise formulas (a value starting with = + - @ would be read as a formula in Sheets)
function s_(v, max) {
  var t = String(v == null ? '' : v).replace(/\s+$/, '').substring(0, max);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}


// Status dropdown in the last column, so the owner picks a value instead of typing it.
var STATUS_CHOICES = ['\u0e23\u0e2d\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a', '\u0e25\u0e07\u0e02\u0e32\u0e22', '\u0e08\u0e2d\u0e07\u0e41\u0e25\u0e49\u0e27', '\u0e02\u0e32\u0e22\u0e41\u0e25\u0e49\u0e27', '\u0e44\u0e21\u0e48\u0e23\u0e31\u0e1a\u0e1d\u0e32\u0e01'];
function applyStatusDropdown_(sheet) {
  try {
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUS_CHOICES, true).setAllowInvalid(false).build();
    sheet.getRange(2, HEADERS.length, 1000, 1).setDataValidation(rule);
  } catch (err) { /* cosmetic only */ }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  applyStatusDropdown_(sh);
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
