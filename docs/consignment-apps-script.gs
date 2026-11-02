/**
 * KHARAWA: รับรายการฝากขายจากหน้าเว็บ -> บันทึกลง Google Sheet, เก็บรูปใน Google Drive, ส่งอีเมลแจ้งเจ้าของ
 * วางโค้ดนี้ใน Extensions > Apps Script ของ Google Sheet (ดูขั้นตอนใน docs/ตั้งค่าฟอร์มฝากขาย_Google_Sheet.md)
 */
var OWNER_EMAIL = '';            // อีเมลที่ต้องการรับแจ้งเตือน (เว้นว่าง = ไม่ส่งอีเมล)
var SHEET_NAME = 'ฝากขาย';
var FOLDER_NAME = 'KHARAWA ฝากขาย (รูป)';
var MAX_PHOTOS = 4;
var MAX_PHOTO_CHARS = 2500000;    // ~1.8 MB ต่อรูปหลังย่อ (base64)
var HEADERS = ['เวลาที่ส่ง', 'เลขอ้างอิง', 'แบรนด์', 'ชื่อสินค้า', 'หมวดหมู่', 'ไซซ์', 'สภาพ', 'ราคาที่ต้องการ (บาท)', 'ช่องทางติดต่อ', 'รายละเอียด', 'จำนวนรูป', 'ลิงก์รูป', 'สถานะ'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse(e.postData.contents);
    if (d.website) return out_({ ok: true });                       // honeypot: บอทกรอกช่องที่ซ่อนไว้
    if (!d.consent || !d.itemName || !d.contact || !d.size || !d.ref) return out_({ ok: false, error: 'invalid' });
    if (!/^KH-C-\d{6}-[A-Z2-9]{4}$/.test(String(d.ref))) return out_({ ok: false, error: 'invalid-ref' });

    var sheet = getSheet_();
    var links = savePhotos_(d);
    sheet.appendRow([
      new Date(), s_(d.ref, 30), s_(d.brand, 80), s_(d.itemName, 200), s_(d.category, 60), s_(d.size, 60),
      s_(d.condition, 60), s_(d.price, 20), s_(d.contact, 200), s_(d.details, 2000), links.length, links.join('\n'), 'รอตรวจสอบ'
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

// ตัดความยาว และกันสูตร (ค่าที่ขึ้นต้นด้วย = + - @ จะถูกตีความเป็นสูตรใน Sheet)
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
    links.push(folder.createFile(blob).getUrl());               // ไฟล์เป็นส่วนตัว เปิดได้เฉพาะเจ้าของบัญชีนี้
  });
  return links;
}

function notify_(d, links) {
  if (!OWNER_EMAIL) return;
  var body = ['มีรายการฝากขายใหม่', '', 'เลขอ้างอิง: ' + d.ref, 'แบรนด์: ' + d.brand, 'สินค้า: ' + d.itemName, 'หมวดหมู่: ' + d.category,
    'ไซซ์: ' + d.size, 'สภาพ: ' + d.condition, 'ราคาที่ต้องการ: ' + (d.price || '-'), 'ติดต่อ: ' + d.contact, 'รายละเอียด: ' + (d.details || '-'), '',
    'รูป: ' + (links.length ? '\n' + links.join('\n') : 'ไม่มี'), '', 'ดูทั้งหมดใน Google Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()].join('\n');
  MailApp.sendEmail(OWNER_EMAIL, '[KHARAWA] ฝากขายใหม่ ' + d.ref, body);
}
