/**
 * KHARAWA: post newly listed pre-loved items to the Facebook PAGE (photo + caption + link).
 * Add as a NEW file in the same Apps Script project (next to the existing files). It reuses SHEET_NAME and
 * publicPhotos_ from the main file and does not change anything in them.
 *
 * Secrets live ONLY in Project Settings > Script Properties (never in this file, never in chat):
 *   FB_APP_ID, FB_APP_SECRET, FB_PAGE_ID         (set once)
 *   FB_SHORT_USER_TOKEN                          (paste from Graph API Explorer, used once, then deleted by the script)
 *   FB_PAGE_TOKEN                                (written by facebookExchangeToken, do not type it)
 *   FB_POST_ENABLED = yes                        (posting is OFF unless this is exactly "yes")
 *
 * Order: facebookExchangeToken -> facebookCheckSetup -> facebookDryRun -> set FB_POST_ENABLED=yes -> setupFacebookTrigger
 */
var FB_API = 'https://graph.facebook.com/v21.0';
var FB_SITE = 'https://piddtr-debug.github.io/kharawa-website-materials';
var FB_MARK_COL = 15;              // column O = "posted to Facebook"
var FB_MAX_PER_RUN = 2;
var FB_STATUS_OK = { '\u0e25\u0e07\u0e02\u0e32\u0e22': 1, '\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e02\u0e32\u0e22': 1 };

function fbProps_() { return PropertiesService.getScriptProperties(); }
function fbGet_(path, params) {
  var q = Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
  var res = UrlFetchApp.fetch(FB_API + path + '?' + q, { muteHttpExceptions: true });
  var body = {};
  try { body = JSON.parse(res.getContentText()); } catch (e) {}
  return { code: res.getResponseCode(), body: body };
}
function fbErr_(r) { return 'HTTP ' + r.code + ' ' + ((r.body && r.body.error && r.body.error.message) || 'unknown error'); }

/**
 * Run ONCE. Turns the short-lived token (FB_SHORT_USER_TOKEN) into a long-lived Page token and stores it as FB_PAGE_TOKEN.
 * The short token is deleted afterwards. Nothing secret is written to the log.
 */
function facebookExchangeToken() {
  var p = fbProps_();
  var appId = p.getProperty('FB_APP_ID'), secret = p.getProperty('FB_APP_SECRET'), pageId = p.getProperty('FB_PAGE_ID'), shortToken = p.getProperty('FB_SHORT_USER_TOKEN');
  if (!appId || !secret || !pageId || !shortToken) { console.error('Missing Script Properties. Need: FB_APP_ID, FB_APP_SECRET, FB_PAGE_ID, FB_SHORT_USER_TOKEN'); return; }
  var longUser = fbGet_('/oauth/access_token', { grant_type: 'fb_exchange_token', client_id: appId, client_secret: secret, fb_exchange_token: shortToken });
  if (longUser.code !== 200 || !longUser.body.access_token) { console.error('Step 1 failed (long-lived user token): ' + fbErr_(longUser)); return; }
  var pages = fbGet_('/me/accounts', { access_token: longUser.body.access_token, fields: 'id,name,access_token', limit: 100 });
  if (pages.code !== 200 || !pages.body.data) { console.error('Step 2 failed (list pages): ' + fbErr_(pages)); return; }
  var page = null;
  pages.body.data.forEach(function (d) { if (String(d.id) === String(pageId)) page = d; });
  if (!page || !page.access_token) { console.error('Page ' + pageId + ' not found for this login. Pages seen: ' + pages.body.data.map(function (d) { return d.name + ' (' + d.id + ')'; }).join(', ')); return; }
  p.setProperty('FB_PAGE_TOKEN', page.access_token);
  p.deleteProperty('FB_SHORT_USER_TOKEN');
  console.log('OK: saved the Page token for "' + page.name + '". The short token was deleted.');
}

/** Checks the saved Page token works (prints the Page name only). */
function facebookCheckSetup() {
  var p = fbProps_();
  var r = fbGet_('/' + p.getProperty('FB_PAGE_ID'), { fields: 'name', access_token: p.getProperty('FB_PAGE_TOKEN') || '' });
  console.log(r.code === 200 ? 'OK: connected to Page "' + r.body.name + '"' : 'FAILED: ' + fbErr_(r));
}

/** Shows what WOULD be posted (View > Logs). Posts nothing. */
function facebookDryRun() { facebookPostNewItems_(true); }
/** Called by the timer. Does nothing unless FB_POST_ENABLED = yes. */
function facebookPostNewItems() { facebookPostNewItems_(false); }
/** Run once to check for new items every 15 minutes. */
function setupFacebookTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'facebookPostNewItems') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('facebookPostNewItems').timeBased().everyMinutes(15).create();
}

function facebookPostNewItems_(dryRun) {
  var p = fbProps_();
  var token = p.getProperty('FB_PAGE_TOKEN'), pageId = p.getProperty('FB_PAGE_ID');
  if (!dryRun) {
    if (p.getProperty('FB_POST_ENABLED') !== 'yes') return;               // OFF by default
    if (!token || !pageId) { console.error('FB_PAGE_TOKEN / FB_PAGE_ID not set'); return; }
  }
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return;
    if (!String(sheet.getRange(1, FB_MARK_COL).getValue())) sheet.getRange(1, FB_MARK_COL).setValue('\u0e42\u0e1e\u0e2a\u0e15\u0e4c FB \u0e41\u0e25\u0e49\u0e27').setFontWeight('bold');
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, FB_MARK_COL).getValues();
    var done = 0;
    for (var i = 0; i < rows.length && done < FB_MAX_PER_RUN; i++) {
      var r = rows[i];
      if (!FB_STATUS_OK[String(r[12]).trim()] || !r[1] || !r[3] || r[FB_MARK_COL - 1]) continue;
      var id = String(r[1]);
      if (!/^[\w-]{1,40}$/.test(id)) continue;
      var photos = publicPhotos_(String(r[11]));
      if (!photos.length) continue;
      var caption = fbCaption_(id, String(r[2]) || 'KHARAWA', String(r[3]), String(r[5]), Number(r[7]) > 0 ? Number(r[7]) : null);
      if (dryRun) { console.log('WOULD POST ' + id + ' | photo ' + photos[0] + '\n' + caption); done++; continue; }
      var res = UrlFetchApp.fetch(FB_API + '/' + encodeURIComponent(pageId) + '/photos', {
        method: 'post', muteHttpExceptions: true,
        payload: { url: photos[0], message: caption, access_token: token }
      });
      if (res.getResponseCode() === 200) {
        sheet.getRange(i + 2, FB_MARK_COL).setValue(new Date());
        SpreadsheetApp.flush();
        done++;
      } else {
        console.error('Facebook post failed for ' + id + ': HTTP ' + res.getResponseCode() + ' ' + String(res.getContentText()).substring(0, 300).replace(token, '***'));
        break;
      }
    }
  } finally { lock.releaseLock(); }
}

function fbCaption_(id, brand, name, size, price) {
  var priceText = price ? '\u0e3f' + String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '\u0e2a\u0e2d\u0e1a\u0e16\u0e32\u0e21\u0e23\u0e32\u0e04\u0e32';
  return [
    brand + ' ' + name,
    '\u0e44\u0e0b\u0e0b\u0e4c ' + size + ' | ' + priceText,
    '',
    '\u0e21\u0e37\u0e2d\u0e2a\u0e2d\u0e07\u0e04\u0e31\u0e14\u0e2a\u0e23\u0e23 \u0e17\u0e35\u0e21\u0e07\u0e32\u0e19\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e20\u0e32\u0e1e\u0e41\u0e25\u0e49\u0e27 \u0e21\u0e35\u0e0a\u0e34\u0e49\u0e19\u0e40\u0e14\u0e35\u0e22\u0e27',
    '\u0e14\u0e39\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14: ' + FB_SITE + '/preloved.html#' + encodeURIComponent(id),
    '\u0e17\u0e31\u0e01\u0e2a\u0e31\u0e48\u0e07 LINE: https://line.me/R/ti/p/%40737yiaxp',
    '',
    '#KHARAWA #\u0e21\u0e37\u0e2d\u0e2a\u0e2d\u0e07 #\u0e40\u0e2a\u0e37\u0e49\u0e2d\u0e1c\u0e49\u0e32\u0e21\u0e37\u0e2d\u0e2a\u0e2d\u0e07'
  ].join('\n');
}
