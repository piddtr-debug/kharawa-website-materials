/**
 * KHARAWA: broadcast newly listed pre-loved items to everyone who follows the LINE Official Account.
 * Add this as a SECOND file in the same Apps Script project (next to consignment-apps-script.gs).
 *
 * The channel access token is NEVER written in this file or sent in chat. Paste it in:
 *   Project Settings (gear) > Script Properties > Add script property
 *     LINE_CHANNEL_ACCESS_TOKEN = (the long token from LINE Developers)
 *     LINE_BROADCAST_ENABLED    = yes      (leave out or set to "no" to keep it OFF)
 *
 * What it does: every run, finds rows whose status is Listed (the Thai word for 'listed') that have a photo and are not yet
 * marked in column N, sends ONE Flex message (photo + name + price + "ask on LINE" button) to all followers,
 * then writes the time in column N so the same item is never sent twice. At most MAX_PER_RUN items per run.
 */
var BC_SITE = 'https://piddtr-debug.github.io/kharawa-website-materials';
var BC_LINE_ADD = 'https://line.me/R/ti/p/%40Kharawa';
var BC_MARK_COL = 14;              // column N = "sent to LINE"
var BC_MAX_PER_RUN = 3;
var BC_STATUS_OK = { '\u0e25\u0e07\u0e02\u0e32\u0e22': 1, '\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e02\u0e32\u0e22': 1 };

/** Run this by hand first: shows what WOULD be sent (View > Logs) and sends nothing. */
function broadcastDryRun() { broadcastNewItems_(true); }

/** Called by the timer trigger. Does nothing unless LINE_BROADCAST_ENABLED = yes. */
function broadcastNewItems() { broadcastNewItems_(false); }

/** Run once to create a timer that checks every 10 minutes. (Remove it in Triggers if you want to stop.) */
function setupBroadcastTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'broadcastNewItems') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('broadcastNewItems').timeBased().everyMinutes(10).create();
}

function broadcastNewItems_(dryRun) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  if (!dryRun) {
    if (props.getProperty('LINE_BROADCAST_ENABLED') !== 'yes') return;      // OFF by default
    if (!token) { console.error('LINE_CHANNEL_ACCESS_TOKEN is not set'); return; }
  }
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return;
    if (!String(sheet.getRange(1, BC_MARK_COL).getValue())) sheet.getRange(1, BC_MARK_COL).setValue('\u0e2a\u0e48\u0e07 LINE \u0e41\u0e25\u0e49\u0e27').setFontWeight('bold');
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, BC_MARK_COL).getValues();
    var sent = 0;
    for (var i = 0; i < rows.length && sent < BC_MAX_PER_RUN; i++) {
      var r = rows[i];
      if (!BC_STATUS_OK[String(r[12]).trim()] || !r[1] || !r[3] || r[BC_MARK_COL - 1]) continue;
      var id = String(r[1]);
      if (!/^[\w-]{1,40}$/.test(id)) continue;
      var photos = publicPhotos_(String(r[11]));
      if (!photos.length) continue;                                         // wait until a photo exists
      var message = bcFlex_(id, String(r[2]) || 'KHARAWA', String(r[3]), String(r[5]), Number(r[7]) > 0 ? Number(r[7]) : null, photos[0]);
      if (dryRun) { console.log(JSON.stringify(message)); sent++; continue; }
      var res = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/broadcast', {
        method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        headers: { Authorization: 'Bearer ' + token },
        payload: JSON.stringify({ messages: [message] })
      });
      var code = res.getResponseCode();
      if (code === 200) {
        sheet.getRange(i + 2, BC_MARK_COL).setValue(new Date());
        SpreadsheetApp.flush();
        sent++;
      } else {
        console.error('LINE broadcast failed for ' + id + ': HTTP ' + code + ' ' + String(res.getContentText()).substring(0, 300));
        break;                                                              // stop on error (bad token, quota); try again next run
      }
    }
  } finally { lock.releaseLock(); }
}

function bcFlex_(id, brand, name, size, price, photo) {
  var priceText = price ? '\u0e3f' + String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '\u0e2a\u0e2d\u0e1a\u0e16\u0e32\u0e21\u0e23\u0e32\u0e04\u0e32';
  var link = BC_SITE + '/preloved.html#' + encodeURIComponent(id);
  var alt = (brand + ' ' + name + ' ' + priceText).substring(0, 380);
  return {
    type: 'flex', altText: alt,
    contents: {
      type: 'bubble',
      hero: { type: 'image', url: photo, size: 'full', aspectRatio: '4:5', aspectMode: 'cover', action: { type: 'uri', uri: link } },
      body: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [
          { type: 'text', text: brand.substring(0, 60), size: 'xs', color: '#C9231C', weight: 'bold' },
          { type: 'text', text: name.substring(0, 120), weight: 'bold', size: 'lg', wrap: true },
          { type: 'text', text: ('\u0e44\u0e0b\u0e0b\u0e4c ' + size).substring(0, 60) + '  |  ' + priceText, size: 'sm', color: '#666666', wrap: true }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [
          { type: 'button', style: 'primary', color: '#C9231C', action: { type: 'uri', label: '\u0e14\u0e39\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32', uri: link } }
        ]
      }
    }
  };
}
