/**
 * KHARAWA: own chat inbox for the LINE Official Account (replaces answering in LINE OA Manager).
 * Add this as a NEW file in the same Apps Script project (next to consignment-apps-script.gs).
 * Also add the 2 small lines to doPost described in docs/ตั้งค่าแชทตอบลูกค้า.md.
 *
 * Script Properties needed (Project Settings > Script Properties). NEVER paste these in chat:
 *   LINE_CHANNEL_ACCESS_TOKEN = (same token already used by the broadcast)
 *   CHAT_ADMIN_PIN            = a PIN/password YOU choose, at least 6 characters (used to open the chat page)
 *
 * Flow: LINE -> (webhook) -> this script saves the message in sheet "chat messages"
 *       admin page /admin/chat.html -> this script (needs the PIN) -> read messages / send reply through LINE API.
 */
var CHAT_MSG_SHEET = 'Chat-Messages';
var CHAT_CONTACT_SHEET = 'Chat-Contacts';
var CHAT_IMG_FOLDER = 'KHARAWA Chat Images';
var CHAT_MSG_HEADERS = ['time', 'userId', 'name', 'dir', 'type', 'text', 'imageFileId'];
var CHAT_CONTACT_HEADERS = ['userId', 'name', 'picture', 'lastTime', 'lastText', 'unread'];
var CHAT_THREAD_LIMIT = 120;

// ---------- LINE webhook ----------
function lineWebhook_(d) {
  // Note: Apps Script cannot read the X-Line-Signature header, so the signature cannot be verified here.
  // Only data of the form below is accepted and it is only ever stored as plain text.
  (d.events || []).forEach(function (ev) {
    try {
      if (!ev || !ev.source || ev.source.type !== 'user' || !/^U[0-9a-f]{32}$/.test(String(ev.source.userId))) return;
      var uid = ev.source.userId;
      if (ev.type === 'follow') { chatTouchContact_(uid, 'New follower', 0); return; }
      if (ev.type !== 'message' || !ev.message) return;
      var m = ev.message, type = String(m.type), text = '', fileId = '';
      if (type === 'text') text = String(m.text || '').substring(0, 2000);
      else if (type === 'image') { fileId = chatSaveImage_(m.id); text = '[รูปภาพ]'; }
      else if (type === 'sticker') text = '[สติกเกอร์]';
      else if (type === 'location') text = '[ตำแหน่ง] ' + String(m.address || '').substring(0, 200);
      else text = '[' + type + ']';
      chatAppend_([new Date(), uid, '', 'in', type, text, fileId]);
      chatTouchContact_(uid, text, 1);
    } catch (err) { console.error('webhook event failed: ' + err); }
  });
  return out_({ ok: true });
}

function chatSaveImage_(messageId) {
  var token = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  if (!token || !/^\d{1,30}$/.test(String(messageId))) return '';
  var res = UrlFetchApp.fetch('https://api-data.line.me/v2/bot/message/' + messageId + '/content', {
    headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) return '';
  var folders = DriveApp.getFoldersByName(CHAT_IMG_FOLDER);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(CHAT_IMG_FOLDER);   // stays private
  var blob = res.getBlob().setName('chat-' + messageId);
  return folder.createFile(blob).getId();
}

// ---------- admin API (called from /admin/chat.html) ----------
function chatAdmin_(d) {
  var gate = chatCheckPin_(d.pin);
  if (gate) return out_({ ok: false, error: gate });
  switch (d.action) {
    case 'chatList': return out_({ ok: true, contacts: chatContacts_() });
    case 'chatThread': return out_(chatThread_(String(d.userId || '')));
    case 'chatSend': return out_(chatSend_(String(d.userId || ''), String(d.text || '')));
    case 'chatImage': return out_(chatImage_(String(d.fileId || '')));
  }
  return out_({ ok: false, error: 'unknown-action' });
}

function chatCheckPin_(pin) {
  var cache = CacheService.getScriptCache();
  var fails = Number(cache.get('chat-fails') || 0);
  if (fails >= 10) return 'locked';                                      // 10 wrong PINs -> locked for 10 minutes
  var real = PropertiesService.getScriptProperties().getProperty('CHAT_ADMIN_PIN');
  if (!real || real.length < 6) return 'no-pin-set';
  var a = String(pin || ''), ok = a.length === real.length, diff = 0;
  for (var i = 0; i < real.length; i++) diff |= (a.charCodeAt(i) || 0) ^ real.charCodeAt(i);
  if (ok && diff === 0) return '';
  cache.put('chat-fails', String(fails + 1), 600);
  return 'bad-pin';
}

function chatContacts_() {
  var sh = chatSheet_(CHAT_CONTACT_SHEET, CHAT_CONTACT_HEADERS);
  if (sh.getLastRow() < 2) return [];
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues();
  return rows.map(function (r) {
    return { userId: r[0], name: r[1] || 'Customer', picture: r[2], lastTime: r[3] ? new Date(r[3]).getTime() : 0, lastText: String(r[4]), unread: Number(r[5]) || 0 };
  }).sort(function (a, b) { return b.lastTime - a.lastTime; });
}

function chatThread_(uid) {
  if (!/^U[0-9a-f]{32}$/.test(uid)) return { ok: false, error: 'bad-user' };
  var sh = chatSheet_(CHAT_MSG_SHEET, CHAT_MSG_HEADERS);
  var out = [];
  if (sh.getLastRow() > 1) {
    var rows = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues();
    rows.forEach(function (r) {
      if (r[1] === uid) out.push({ time: new Date(r[0]).getTime(), dir: r[3], type: r[4], text: String(r[5]), fileId: r[6] });
    });
  }
  chatSetUnread_(uid, 0);
  return { ok: true, messages: out.slice(-CHAT_THREAD_LIMIT) };
}

function chatSend_(uid, text) {
  text = text.replace(/\r\n/g, '\n').trim().substring(0, 4900);
  if (!/^U[0-9a-f]{32}$/.test(uid) || !text) return { ok: false, error: 'bad-request' };
  var token = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  if (!token) return { ok: false, error: 'no-token' };
  var res = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ to: uid, messages: [{ type: 'text', text: text }] })
  });
  var code = res.getResponseCode();
  if (code !== 200) return { ok: false, error: 'line-' + code, detail: String(res.getContentText()).substring(0, 200) };
  chatAppend_([new Date(), uid, '', 'out', 'text', text, '']);
  var sh = chatSheet_(CHAT_CONTACT_SHEET, CHAT_CONTACT_HEADERS);
  var row = chatFindContactRow_(sh, uid);
  if (row) { sh.getRange(row, 4, 1, 2).setValues([[new Date(), 'คุณ: ' + text.substring(0, 80)]]); }
  return { ok: true };
}

function chatImage_(fileId) {
  if (!/^[\w-]{10,80}$/.test(fileId)) return { ok: false, error: 'bad-id' };
  // only files that were saved by this chat (they are listed in the messages sheet) can be read
  var sh = chatSheet_(CHAT_MSG_SHEET, CHAT_MSG_HEADERS);
  var known = sh.getLastRow() > 1 && sh.getRange(2, 7, sh.getLastRow() - 1, 1).getValues().some(function (r) { return r[0] === fileId; });
  if (!known) return { ok: false, error: 'unknown-file' };
  var blob = DriveApp.getFileById(fileId).getBlob();
  return { ok: true, dataUrl: 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes()) };
}

// ---------- sheet helpers ----------
function chatSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function chatAppend_(row) { chatSheet_(CHAT_MSG_SHEET, CHAT_MSG_HEADERS).appendRow(row); }

function chatFindContactRow_(sh, uid) {
  if (sh.getLastRow() < 2) return 0;
  var ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (ids[i][0] === uid) return i + 2;
  return 0;
}

function chatTouchContact_(uid, text, addUnread) {
  var sh = chatSheet_(CHAT_CONTACT_SHEET, CHAT_CONTACT_HEADERS);
  var row = chatFindContactRow_(sh, uid);
  if (!row) {
    var p = chatProfile_(uid);
    sh.appendRow([uid, p.name, p.picture, new Date(), text, addUnread]);
    return;
  }
  var cur = Number(sh.getRange(row, 6).getValue()) || 0;
  sh.getRange(row, 4, 1, 3).setValues([[new Date(), text, cur + addUnread]]);
  if (!sh.getRange(row, 2).getValue() || sh.getRange(row, 2).getValue() === 'Customer') {
    var p2 = chatProfile_(uid);
    sh.getRange(row, 2, 1, 2).setValues([[p2.name, p2.picture]]);
  }
}

function chatSetUnread_(uid, n) {
  var sh = chatSheet_(CHAT_CONTACT_SHEET, CHAT_CONTACT_HEADERS);
  var row = chatFindContactRow_(sh, uid);
  if (row) sh.getRange(row, 6).setValue(n);
}

function chatProfile_(uid) {
  var token = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  var fallback = { name: 'Customer', picture: '' };
  if (!token) return fallback;
  try {
    var res = UrlFetchApp.fetch('https://api.line.me/v2/bot/profile/' + uid, { headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) return fallback;
    var j = JSON.parse(res.getContentText());
    return { name: String(j.displayName || 'Customer').substring(0, 80), picture: String(j.pictureUrl || '') };
  } catch (e) { return fallback; }
}

/** Run by hand once after pasting: creates the two chat sheets so you can see them. */
function chatSetup() {
  chatSheet_(CHAT_MSG_SHEET, CHAT_MSG_HEADERS);
  chatSheet_(CHAT_CONTACT_SHEET, CHAT_CONTACT_HEADERS);
  var p = PropertiesService.getScriptProperties();
  console.log('token set: ' + !!p.getProperty('LINE_CHANNEL_ACCESS_TOKEN') + ' | PIN set: ' + !!(p.getProperty('CHAT_ADMIN_PIN') || '').length);
}
