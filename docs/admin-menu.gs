/**
 * KHARAWA admin menu: adds a "KHARAWA" menu at the top of the Google Sheet.
 * Click a row (or select several rows) in the sheet "ฝากขาย", then pick a menu item
 * to set its status. "ลงขาย" shows the item on the website; "ซ่อน" hides it.
 * Add this as a NEW file in Extensions > Apps Script (do not replace the other code).
 *
 * AI label: every time rows are set to "ลงขาย", the menu asks whether their photos were made or edited
 * with AI (column P) for any row not answered yet, and warns when an AI label will be added to the Facebook post.
 */
var ADMIN_SHEET_NAME = 'ฝากขาย';       // ฝากขาย
var ADMIN_STATUS_COL = 13;                                          // column M = สถานะ
var ADMIN_AI_COL = 16;                                              // column P = ภาพแต่งด้วย AI (ใช่ / ไม่ใช่)

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🛍️ KHARAWA')
    .addItem('✅ ลงขาย (แสดงบนเว็บ)', 'setOnSale')
    .addItem('🔒 จองแล้ว', 'setReserved')
    .addItem('💰 ขายแล้ว', 'setSold')
    .addSeparator()
    .addItem('🚫 ซ่อน (ไม่แสดงบนเว็บ)', 'setHidden')
    .addSeparator()
    .addItem('🤖 ภาพแต่งด้วย AI (โพสต์จะมีคำกำกับ)', 'setAiYes')
    .addItem('📷 ภาพจริง ไม่ได้แต่งด้วย AI', 'setAiNo')
    .addToUi();
}

function setOnSale()   { setStatus_('ลงขาย'); }
function setReserved() { setStatus_('จองแล้ว'); }
function setSold()     { setStatus_('ขายแล้ว'); }
function setHidden()   { setStatus_('รอตรวจสอบ'); }
function setAiYes()    { setAi_('ใช่'); }
function setAiNo()     { setAi_('ไม่ใช่'); }

/** Selected product rows on the "ฝากขาย" tab, or null (after telling the owner what to do). */
function selectedRows_() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== ADMIN_SHEET_NAME) {
    ui.alert('กรุณาเปิดแท็บ "ฝากขาย" แล้วคลิกแถวสินค้าก่อน');
    return null;
  }
  var range = sheet.getActiveRange();
  var first = Math.max(range.getRow(), 2);
  var last = range.getLastRow();
  if (last < first) { ui.alert('กรุณาคลิกแถวสินค้าก่อน'); return null; }
  if (!String(sheet.getRange(1, ADMIN_AI_COL).getValue())) sheet.getRange(1, ADMIN_AI_COL).setValue('ภาพแต่งด้วย AI').setFontWeight('bold');
  return { sheet: sheet, first: first, count: last - first + 1 };
}

function aiFlag_(v) {
  if (v === true) return 'yes';
  var s = String(v).trim().toLowerCase();
  if (s === 'ไม่ใช่' || s === 'ไม่' || s === 'no' || s === 'n' || s === 'false') return 'no';
  if (s === 'ใช่' || s === 'yes' || s === 'y' || s === 'true' || s === 'ai') return 'yes';
  return '';
}

function setStatus_(value) {
  var ui = SpreadsheetApp.getUi();
  var sel = selectedRows_();
  if (!sel) return;
  var aiRange = sel.sheet.getRange(sel.first, ADMIN_AI_COL, sel.count, 1);
  var ai = aiRange.getValues();
  if (value === 'ลงขาย') {
    var missing = ai.filter(function (r) { return !aiFlag_(r[0]); }).length;
    if (missing) {
      var answer = ui.alert('⚠️ ภาพแต่งด้วย AI หรือไม่?',
        'สินค้า ' + missing + ' ชิ้นที่เลือกยังไม่ได้ระบุ\n\n' +
        'ภาพของสินค้าเหล่านี้สร้างหรือแต่งด้วย AI หรือไม่?\n\n' +
        'Yes = แต่งด้วย AI (โพสต์ Facebook จะมีคำว่า "ภาพนี้สร้าง/แต่งด้วย AI")\n' +
        'No = ภาพจริง ไม่ได้แต่ง\n' +
        'Cancel = ยกเลิก ยังไม่ลงขาย', ui.ButtonSet.YES_NO_CANCEL);
      if (answer !== ui.Button.YES && answer !== ui.Button.NO) return;
      var fill = answer === ui.Button.YES ? 'ใช่' : 'ไม่ใช่';
      ai = ai.map(function (r) { return [aiFlag_(r[0]) ? r[0] : fill]; });
      aiRange.setValues(ai);
    }
  }
  sel.sheet.getRange(sel.first, ADMIN_STATUS_COL, sel.count, 1).setValue(value);
  var msg = 'เปลี่ยน ' + sel.count + ' แถวเป็น "' + value + '" แล้ว';
  var aiCount = ai.filter(function (r) { return aiFlag_(r[0]) === 'yes'; }).length;
  if (value === 'ลงขาย' && aiCount) msg += '\n⚠️ ' + aiCount + ' ชิ้นภาพแต่งด้วย AI โพสต์ Facebook จะมีคำกำกับ';
  SpreadsheetApp.getActive().toast(msg, 'KHARAWA', aiCount ? 8 : 4);
}

function setAi_(value) {
  var sel = selectedRows_();
  if (!sel) return;
  sel.sheet.getRange(sel.first, ADMIN_AI_COL, sel.count, 1).setValue(value);
  SpreadsheetApp.getActive().toast(sel.count + ' แถว: ภาพแต่งด้วย AI = "' + value + '"' +
    (value === 'ใช่' ? '\n⚠️ โพสต์ Facebook จะมีคำว่า "ภาพนี้สร้าง/แต่งด้วย AI"' : ''), 'KHARAWA', 6);
}
