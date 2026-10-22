const STORAGE_KEY = 'kharawa-consignment-drafts-v1';
const STATUS_KEY = 'kharawa-consignment-status-v1';
const LANGUAGE_KEY = 'kharawa-language-v1';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let language = localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'th';
let selectedId = null;
const statuses = ['pending', 'reviewing', 'approved', 'listed', 'sold', 'rejected'];
const labels = {
  th: { back:'กลับหน้าเว็บไซต์ ↗', eyebrow:'PRIVATE WORKSPACE', title:'รายการ<br /><em>ฝากขาย</em>', subtitle:'ตรวจสอบรายการที่ลูกค้าส่งมา เปลี่ยนสถานะ และเปิดดูรายละเอียดได้จากที่เดียว', storage:'โหมดร่างข้อมูลใน Browser', all:'ทั้งหมด', pending:'รอตรวจสอบ', reviewing:'กำลังตรวจ', approved:'อนุมัติแล้ว', listed:'ลงขายแล้ว', sold:'ขายแล้ว', rejected:'ไม่รับฝาก', search:'ค้นหา', filter:'กรองสถานะ', refresh:'รีเฟรช', select:'เลือกรายการเพื่อดูรายละเอียด', empty:'ยังไม่มีรายการฝากขายใน Browser นี้', item:'สินค้า', contact:'ช่องทางติดต่อ', condition:'สภาพ', price:'ราคาเสนอ', category:'หมวดหมู่', details:'รายละเอียด', submitted:'ส่งเมื่อ', update:'บันทึกสถานะ', saved:'บันทึกสถานะแล้ว', photo:'รูปภาพ', noPhoto:'ไม่มีรูปภาพแนบ', statuses:{pending:'รอตรวจสอบ', reviewing:'กำลังตรวจ', approved:'อนุมัติแล้ว', listed:'ลงขายแล้ว', sold:'ขายแล้ว', rejected:'ไม่รับฝาก'} },
  en: { back:'BACK TO WEBSITE ↗', eyebrow:'PRIVATE WORKSPACE', title:'CONSIGNMENT<br /><em>INBOX</em>', subtitle:'Review customer submissions, update statuses and inspect every item from one workspace.', storage:'Browser draft mode', all:'ALL', pending:'PENDING', reviewing:'REVIEWING', approved:'APPROVED', listed:'LISTED', sold:'SOLD', rejected:'REJECTED', search:'SEARCH', filter:'FILTER STATUS', refresh:'REFRESH', select:'Select a submission to view details', empty:'No consignment submissions in this browser yet.', item:'Item', contact:'Contact', condition:'Condition', price:'Asking price', category:'Category', details:'Details', submitted:'Submitted', update:'SAVE STATUS', saved:'Status saved', photo:'Photo', noPhoto:'No photo attached', statuses:{pending:'PENDING', reviewing:'REVIEWING', approved:'APPROVED', listed:'LISTED', sold:'SOLD', rejected:'REJECTED'} }
};
function t(key) { return labels[language][key] || key; }
function readSubmissions() { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(value) ? value.map((item, index) => { const normalized = { ...item, id: item.id || `${item.createdAt || 'draft'}-${index}` }; return { ...normalized, status: getStatus(normalized) }; }) : []; } catch { return []; } }
function readStatuses() { try { return JSON.parse(localStorage.getItem(STATUS_KEY) || '{}') || {}; } catch { return {}; } }
function getStatus(item) { return readStatuses()[item.id] || item.status || 'pending'; }
function saveStatus(item, status) { const all = readStatuses(); all[item.id] = status; localStorage.setItem(STATUS_KEY, JSON.stringify(all)); item.status = status; }
function formatDate(value) { if (!value) return '—'; try { return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-GB', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value)); } catch { return value; } }
function escapeHTML(value='') { return String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function applyLanguage() {
  document.documentElement.lang = language;
  $$('[data-admin-i18n]').forEach((element) => { const value = t(element.dataset.adminI18n); if (value.includes('<')) element.innerHTML = value; else element.textContent = value; });
  $$('.admin-lang').forEach((button) => { const active = button.dataset.adminLang === language; button.classList.toggle('is-active', active); });
  $('#search-input').placeholder = language === 'th' ? 'ชื่อสินค้า / ช่องทางติดต่อ' : 'Item name / contact';
  render();
}
function updateStats(items) { $('#stat-all').textContent = items.length; statuses.slice(0, 3).forEach((status) => { const element = $(`#stat-${status}`); if (element) element.textContent = items.filter((item) => item.status === status).length; }); }
function render() {
  const items = readSubmissions(); updateStats(items);
  const query = $('#search-input').value.trim().toLowerCase(); const filter = $('#status-filter').value;
  const filtered = items.filter((item) => { const matchesQuery = !query || [item.itemName, item.contact, item.category, item.details].some((value) => String(value || '').toLowerCase().includes(query)); return matchesQuery && (filter === 'all' || item.status === filter); });
  const list = $('#submission-list');
  if (!filtered.length) { list.innerHTML = `<div class="empty-state">${t('empty')}</div>`; $('#submission-detail').innerHTML = `<p class="detail-empty">${t('select')}</p>`; return; }
  list.innerHTML = filtered.map((item) => `<article class="submission-card ${selectedId === item.id ? 'is-selected' : ''}" data-id="${escapeHTML(item.id)}"><div class="submission-card-head"><div><h2>${escapeHTML(item.itemName || '—')}</h2><p class="submission-meta">${escapeHTML(item.category || '—')} · ${escapeHTML(item.contact || '—')}<br />${escapeHTML(formatDate(item.createdAt))}</p></div><span class="status-badge ${item.status}">${t('statuses')[item.status]}</span></div></article>`).join('');
  $$('.submission-card').forEach((card) => card.addEventListener('click', () => { selectedId = card.dataset.id; render(); }));
  const selected = filtered.find((item) => item.id === selectedId) || filtered[0]; selectedId = selected.id; renderDetail(selected);
}
function renderDetail(item) {
  const statusOptions = statuses.map((status) => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${t('statuses')[status]}</option>`).join('');
  $('#submission-detail').innerHTML = `<div class="detail-heading"><h2>${escapeHTML(item.itemName || '—')}</h2><span class="status-badge ${item.status}">${t('statuses')[item.status]}</span></div><dl class="detail-grid"><div><dt>${t('category')}</dt><dd>${escapeHTML(item.category || '—')}</dd></div><div><dt>${t('condition')}</dt><dd>${escapeHTML(item.condition || '—')}</dd></div><div><dt>${t('price')}</dt><dd>${escapeHTML(item.price || '—')}</dd></div><div><dt>${t('submitted')}</dt><dd>${escapeHTML(formatDate(item.createdAt))}</dd></div></dl><div class="detail-block"><h3>${t('contact')}</h3><p>${escapeHTML(item.contact || '—')}</p></div><div class="detail-block"><h3>${t('details')}</h3><p>${escapeHTML(item.details || '—')}</p></div><div class="detail-block"><h3>${t('photo')}</h3><p>${escapeHTML(item.photo || t('noPhoto'))}</p></div><div class="detail-controls"><select id="detail-status">${statusOptions}</select><button id="save-detail-status" type="button">${t('update')}</button></div><p id="detail-status-message" class="detail-block" hidden>${t('saved')}</p>`;
  $('#save-detail-status').addEventListener('click', () => { const next = $('#detail-status').value; saveStatus(item, next); render(); const message = $('#detail-status-message'); if (message) { message.hidden = false; } });
}
$$('[data-admin-lang]').forEach((button) => button.addEventListener('click', () => { language = button.dataset.adminLang; localStorage.setItem(LANGUAGE_KEY, language); applyLanguage(); }));
$('#search-input').addEventListener('input', render); $('#status-filter').addEventListener('change', render); $('#refresh-button').addEventListener('click', render);
applyLanguage();
