// Float the header over the hero artwork; turn it into a solid bar once the hero has scrolled away.
const siteHeader = document.querySelector('.site-header');
const heroSection = document.querySelector('.hero');
if (siteHeader && heroSection) {
  const setOverlay = (on) => siteHeader.classList.toggle('is-overlay', on);
  setOverlay(window.scrollY < heroSection.offsetHeight - siteHeader.offsetHeight);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => setOverlay(entry.isIntersecting), {
      rootMargin: `-${siteHeader.offsetHeight}px 0px 0px 0px`,
    }).observe(heroSection);
  }
}

const PRODUCTS = {
  'first-press-tee': { name: 'First Press Tee', thName: 'เสื้อ FIRST PRESS', sku: 'KH / FS-01', status: 'PRE-LAUNCH / 01', thDescription: 'เสื้อยืดโอเวอร์ไซซ์ งานพิมพ์ด้านหน้าและกราฟิกมือประกบด้านหลัง', description: 'Oversized tee with a front print and the signature pressed-hands graphic on the back.', thSpecs: ['คอตตอนคอนเซ็ปต์ 240 GSM', 'ดำวินเทจ / S–XL'], specs: ['240 GSM cotton concept', 'Vintage black / S–XL'], art: 'product-image-1' },
  'small-signal-tee': { name: 'Small Signal Tee', thName: 'เสื้อ SMALL SIGNAL', sku: 'KH / FS-02', status: 'PRE-LAUNCH / 02', thDescription: 'สัญญาณเล็กบนอกเสื้อ ในสามสีหลักของแบรนด์', description: 'A quiet chest signal in the three core KHARAWA colours.', thSpecs: ['คอตตอนคอนเซ็ปต์ 230 GSM', 'ออฟไวท์ / ดำ / ขาว'], specs: ['230 GSM cotton concept', 'Off-white / Black / White'], art: 'product-image-2' },
  'rising-press-tee': { name: 'Rising Press Tee', thName: 'เสื้อ RISING PRESS', sku: 'KH / FS-03', status: 'PRE-LAUNCH / 03', thDescription: 'เสื้อกราฟิกขนาดใหญ่สำหรับ Collection 01 พร้อมคำว่า Made in the Press', description: 'A bold graphic tee for Collection 01, marked with Made in the Press.', thSpecs: ['คอตตอนคอนเซ็ปต์ 240 GSM', 'ดำวินเทจ / S–XL'], specs: ['240 GSM cotton concept', 'Vintage black / S–XL'], art: 'product-image-3' },
  'press-typo-tee': { name: 'Press Typo Tee', thName: 'เสื้อ PRESS TYPO', sku: 'KH / FS-04', status: 'PRE-LAUNCH / 04', thDescription: 'เสื้อกราฟิกตัวอักษร KHARAWA และ Made in the Press', description: 'Typography-led graphic tee featuring KHARAWA and Made in the Press.', thSpecs: ['คอตตอนคอนเซ็ปต์ 230 GSM', 'ดำ / ขาว / S–XL'], specs: ['230 GSM cotton concept', 'Black / White / S–XL'], art: 'product-image-4' },
  'press-cap-01': { name: 'Press Cap 01', thName: 'หมวก PRESS CAP 01', sku: 'KH / CAP-01', status: 'PRE-LAUNCH / 05', thDescription: 'หมวก five-panel สีดำ พร้อมงานปัก KHARAWA ด้ายแดง', description: 'A black structured five-panel cap with KHARAWA embroidered in red.', thSpecs: ['หมวก five-panel ทรง structured', 'หนึ่งขนาด / ดำ'], specs: ['Structured five-panel', 'One size / Black'], art: 'product-image-5' },
};

const STORAGE_KEY = 'kharawa-cart-v1';
const LANGUAGE_KEY = 'kharawa-language-v1';
const TRANSLATIONS = {
  th: {
    'nav.manifesto': 'แนวคิด', 'nav.collection': 'คอลเลกชัน', 'nav.contact': 'ติดต่อ', 'nav.mobileManifesto': '01 / แนวคิด', 'nav.mobileCollection': '02 / คอลเลกชัน', 'nav.mobileContact': '03 / ติดต่อ',
    'cart.title': 'ถุงสินค้าของคุณ', 'cart.total': 'รวม', 'cart.note': 'ราคาสินค้าและค่าส่งจะยืนยันเมื่อเปิด Pre-order', 'cart.checkout': 'ขอ Pre-order', 'cart.add': 'เพิ่มลงถุง +',
    'hero.eyebrow': 'งานพิมพ์สำหรับคนบนถนน', 'hero.title': 'ส่งสัญญาณ<br /><em>ในแบบ</em><br />ของคุณ', 'hero.description': 'เสื้อผ้าไม่ใช่แค่สิ่งที่ใส่ — แต่มันคือสิ่งที่คุณประกาศ', 'hero.cta': 'ดูสัญญาณของเรา ↗', 'manifesto.eyebrow': 'KHARAWA / สัญญาณสาธารณะ', 'manifesto.title': 'ไม่ใช่<br /><em>เครื่องแบบ</em><br />แต่คือจุดยืน', 'manifesto.body': 'เราเชื่อว่าสิ่งที่สวมใส่มีเสียงของมันเอง KHARAWA จึงสร้างชิ้นงานที่ให้คุณพูดออกไป โดยไม่ต้องพูดดังเกินจำเป็น',
    'collection.eyebrow': '02 / สัญญาณที่คัดสรร', 'collection.title': 'บันทึก<br /><em>จากสนาม</em>', 'collection.intro': 'ชิ้นงานจากสนามทดลองของ KHARAWA — ดูรายละเอียดแต่ละชิ้นและเพิ่มลงถุงสำหรับ Pre-order', 'showcase.eyebrow': 'FIELD EDITION 001', 'showcase.title': 'สวมใส่<br /><em>ข้อความ</em>', 'showcase.cta': 'ดูชิ้นงานเด่น ↗',
    'contact.eyebrow': 'เข้าร่วมคลื่นความถี่', 'contact.title': 'เปิดตา<br /><em>รับสัญญาณ</em>', 'contact.body': 'คอลเลกชัน เรื่องเล่า และการเคลื่อนไหวครั้งถัดไปของ KHARAWA จะถูกส่งออกเมื่อถึงเวลา', 'contact.line': 'คุยผ่าน LINE ↗', 'contact.email': 'contact@kharawa.com ↗', 'footer.signature': 'KHARAWA / 2026<br />ส่งสัญญาณในแบบของคุณ', 'footer.top': 'กลับด้านบน ↑', emptyCart: 'ยังไม่มีสินค้าในตะกร้า', viewDetails: 'ดูรายละเอียด', addShort: 'เพิ่ม +', bag: 'ถุง', index: 'เมนู'
  },
  en: {
    'nav.manifesto': 'MANIFESTO', 'nav.collection': 'COLLECTION', 'nav.contact': 'CONTACT', 'nav.mobileManifesto': '01 / MANIFESTO', 'nav.mobileCollection': '02 / COLLECTION', 'nav.mobileContact': '03 / CONTACT',
    'cart.title': 'Your bag', 'cart.total': 'TOTAL', 'cart.note': 'Price and shipping will be confirmed when Pre-order opens.', 'cart.checkout': 'REQUEST PRE-ORDER', 'cart.add': 'ADD TO BAG +',
    'hero.eyebrow': 'INKED FOR THE STREETS', 'hero.title': 'Make <em>your</em><br />signal.', 'hero.description': 'Clothing is not just what you wear — it is what you announce.', 'hero.cta': 'EXPLORE THE SIGNAL ↗', 'manifesto.eyebrow': 'KHARAWA / A PUBLIC SIGNAL', 'manifesto.title': 'Not a uniform.<br /><em>A position.</em>', 'manifesto.body': 'We believe what you wear has its own voice. KHARAWA creates pieces that let you speak without having to shout.',
    'collection.eyebrow': '02 / SELECTED SIGNALS', 'collection.title': 'The field <em>notes.</em>', 'collection.intro': 'Pieces from the KHARAWA field study — explore each piece and add it to your Pre-order bag.', 'showcase.eyebrow': 'FIELD EDITION 001', 'showcase.title': 'Wear the <em>message.</em>', 'showcase.cta': 'VIEW FEATURED PIECE ↗',
    'contact.eyebrow': 'JOIN THE FREQUENCY', 'contact.title': 'Keep your<br /><em>eyes open.</em>', 'contact.body': 'The next collection, story and movement from KHARAWA will be released when the time is right.', 'contact.line': 'CHAT ON LINE ↗', 'contact.email': 'contact@kharawa.com ↗', 'footer.signature': 'KHARAWA / 2026<br />Make your signal.', 'footer.top': 'BACK TO TOP ↑', emptyCart: 'Your bag is empty', viewDetails: 'VIEW DETAILS', addShort: 'ADD +', bag: 'BAG', index: 'INDEX'
  }
};
// Storage can be blocked (private windows, strict cookie settings). Reads and writes must never stop the page script.
function readStorage(key) { try { return localStorage.getItem(key); } catch { return null; } }
function writeStorage(key, value) { try { localStorage.setItem(key, value); } catch { /* not persisted */ } }
let currentLanguage = readStorage(LANGUAGE_KEY) === 'en' ? 'en' : 'th';
let cart = loadCart();
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => PRODUCTS[item.id] && item.quantity > 0) : [];
  } catch { return []; }
}
function saveCart() { writeStorage(STORAGE_KEY, JSON.stringify(cart)); }
function totalItems() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
function product(id) { return PRODUCTS[id]; }

function applyLanguage(language = currentLanguage) {
  currentLanguage = language === 'en' ? 'en' : 'th';
  const dictionary = TRANSLATIONS[currentLanguage];
  document.documentElement.lang = currentLanguage;
  writeStorage(LANGUAGE_KEY, currentLanguage);
  $$('[data-i18n]').forEach((element) => { if (dictionary[element.dataset.i18n]) element.textContent = dictionary[element.dataset.i18n]; });
  $$('[data-i18n-html]').forEach((element) => { if (dictionary[element.dataset.i18nHtml]) element.innerHTML = dictionary[element.dataset.i18nHtml]; });
  $$('.language-button').forEach((button) => { const active = button.dataset.language === currentLanguage; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
  const cartButton = $('.cart-button');
  if (cartButton?.firstChild) cartButton.firstChild.textContent = `${dictionary.bag} `;
  if ($('.menu-button')) $('.menu-button').textContent = dictionary.index;
  $$('.text-button').forEach((button) => { button.textContent = dictionary.viewDetails; });
  $$('.add-button').forEach((button) => { button.textContent = dictionary.addShort; });
  $$('.product-card[data-card]').forEach((card) => {
    const p = product(card.dataset.card);
    if (!p) return;
    card.querySelector('.product-meta').textContent = currentLanguage === 'th' ? `เตรียมเปิดตัว / ${p.status.split(' / ')[1]}` : p.status;
    card.querySelector('h3').textContent = currentLanguage === 'th' ? p.thName : p.name;
    card.querySelectorAll('p')[1].textContent = currentLanguage === 'th' ? p.thDescription : p.description;
    card.querySelectorAll('li').forEach((item, index) => { item.textContent = (currentLanguage === 'th' ? p.thSpecs : p.specs)[index]; });
  });
  renderCart();
  if ($('#product-modal')?.open && $('.modal-add')?.dataset.add) {
    const activeProduct = product($('.modal-add').dataset.add);
    $('.modal-title').textContent = currentLanguage === 'th' ? activeProduct.thName : activeProduct.name;
    $('.modal-description').textContent = currentLanguage === 'th' ? activeProduct.thDescription : activeProduct.description;
    $('.modal-specs').innerHTML = (currentLanguage === 'th' ? activeProduct.thSpecs : activeProduct.specs).map((spec) => `<li>${spec}</li>`).join('');
  }
}

function renderCart() {
  const container = $('.cart-items');
  const count = $('.cart-count');
  count.textContent = String(totalItems());
  if (!cart.length) {
    container.innerHTML = `<p class="empty-cart">${TRANSLATIONS[currentLanguage].emptyCart}</p>`;
    $('.cart-total-value').textContent = 'PRICE TBC';
    return;
  }
  container.innerHTML = cart.map((item) => {
    const p = product(item.id);
    const localizedName = currentLanguage === 'th' ? p.thName : p.name;
    return `<div class="cart-item">
      <div class="cart-item-art product-image ${p.art}"></div>
      <div><h3>${localizedName}</h3><p>${p.sku} · PRICE TBC</p>
        <div class="cart-quantity"><button type="button" data-decrease="${item.id}" aria-label="${currentLanguage === 'th' ? 'ลดจำนวน' : 'Decrease quantity'}">−</button><span>${item.quantity}</span><button type="button" data-increase="${item.id}" aria-label="${currentLanguage === 'th' ? 'เพิ่มจำนวน' : 'Increase quantity'}">+</button></div>
      </div>
      <button class="cart-remove" type="button" data-remove="${item.id}">${currentLanguage === 'th' ? 'ลบ' : 'REMOVE'}</button>
    </div>`;
  }).join('');
  $('.cart-total-value').textContent = 'PRICE TBC';
  container.querySelectorAll('[data-increase]').forEach((button) => button.addEventListener('click', () => changeQuantity(button.dataset.increase, 1)));
  container.querySelectorAll('[data-decrease]').forEach((button) => button.addEventListener('click', () => changeQuantity(button.dataset.decrease, -1)));
  container.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => removeFromCart(button.dataset.remove)));
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart(); renderCart(); openCart();
}
function changeQuantity(id, delta) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== id);
  saveCart(); renderCart();
}
function removeFromCart(id) { cart = cart.filter((item) => item.id !== id); saveCart(); renderCart(); }
function openCart() { $('#cart-drawer').classList.add('is-open'); $('#cart-drawer').setAttribute('aria-hidden', 'false'); $('.cart-button').setAttribute('aria-expanded', 'true'); $('.cart-backdrop').hidden = false; document.body.classList.add('drawer-open'); }
function closeCart() { $('#cart-drawer').classList.remove('is-open'); $('#cart-drawer').setAttribute('aria-hidden', 'true'); $('.cart-button').setAttribute('aria-expanded', 'false'); $('.cart-backdrop').hidden = true; document.body.classList.remove('drawer-open'); }

function openProduct(id) {
  const p = product(id);
  if (!p) return;
  const modal = $('#product-modal');
  $('.modal-art').className = `modal-art product-image ${p.art}`;
  $('.modal-sku').textContent = p.sku;
  $('.modal-status').textContent = p.status;
  $('.modal-title').textContent = currentLanguage === 'th' ? p.thName : p.name;
  $('.modal-description').textContent = currentLanguage === 'th' ? p.thDescription : p.description;
  $('.modal-specs').innerHTML = (currentLanguage === 'th' ? p.thSpecs : p.specs).map((spec) => `<li>${spec}</li>`).join('');
  $('.modal-add').dataset.add = id;
  modal.showModal();
  document.body.classList.add('modal-open');
}
function closeProduct() { $('#product-modal').close(); document.body.classList.remove('modal-open'); }

$('.menu-button')?.addEventListener('click', () => {
  const button = $('.menu-button');
  const nav = $('#mobile-nav');
  const isOpen = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!isOpen));
  nav.hidden = isOpen;
});
$('#mobile-nav')?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { $('#mobile-nav').hidden = true; $('.menu-button').setAttribute('aria-expanded', 'false'); }));
$('.cart-button')?.addEventListener('click', openCart);
$('.cart-close')?.addEventListener('click', closeCart);
$('.cart-backdrop')?.addEventListener('click', closeCart);
$('.modal-close')?.addEventListener('click', closeProduct);
$('#product-modal')?.addEventListener('click', (event) => { if (event.target === $('#product-modal')) closeProduct(); });
$$('[data-product]').forEach((button) => button.addEventListener('click', () => openProduct(button.dataset.product)));
$$('[data-add]').forEach((button) => button.addEventListener('click', () => addToCart(button.dataset.add)));
$('.modal-add')?.addEventListener('click', (event) => { addToCart(event.currentTarget.dataset.add); closeProduct(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeCart(); if ($('#product-modal').open) closeProduct(); } });
$$('.language-button').forEach((button) => button.addEventListener('click', () => applyLanguage(button.dataset.language)));
applyLanguage();
