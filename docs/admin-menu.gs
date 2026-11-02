/**
 * KHARAWA admin menu: adds a "KHARAWA" menu at the top of the Google Sheet.
 * Click a row (or select several rows) in the sheet "ฝากขาย", then pick a menu item
 * to set its status. "ลงขาย" shows the item on the website; "ซ่อน" hides it.
 * Add this as a NEW file in Extensions > Apps Script (do not replace the other code).
 */
var ADMIN_SHEET_NAME = 'ฝากขาย';       // ฝากขาย
var ADMIN_STATUS_COL = 13;                                          // column M = สถานะ

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🛍️ KHARAWA')
    .addItem('✅ ลงขาย (แสดงบนเว็บ)', 'setOnSale')
    .addItem('🔒 จองแล้ว', 'setReserved')
    .addItem('💰 ขายแล้ว', 'setSold')
    .addSeparator()
    .addItem('🚫 ซ่อน (ไม่แสดงบนเว็บ)', 'setHidden')
    .addToUi();
}

function setOnSale()   { setStatus_('ลงขาย'); }
function setReserved() { setStatus_('จองแล้ว'); }
function setSold()     { setStatus_('ขายแล้ว'); }
function setHidden()   { setStatus_('รอตรวจสอบ'); }

function setStatus_(value) {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== ADMIN_SHEET_NAME) {
    ui.alert('กรุณาเปิดแท็บ "ฝากขาย" แล้วคลิกแถวสินค้าก่อน');
    return;
  }
  var range = sheet.getActiveRange();
  var first = Math.max(range.getRow(), 2);
  var last = range.getLastRow();
  if (last < first) { ui.alert('กรุณาคลิกแถวสินค้าก่อน'); return; }
  sheet.getRange(first, ADMIN_STATUS_COL, last - first + 1, 1).setValue(value);
  SpreadsheetApp.getActive().toast('เปลี่ยน ' + (last - first + 1) + ' แถวเป็น "' + value + '" แล้ว', 'KHARAWA', 4);
}
