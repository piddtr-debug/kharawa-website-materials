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
  'first-press-tee': { name: 'FIRST PRESS TEE', thName: 'เสื้อยืด FIRST PRESS', sku: 'KH / FS-01', status: 'PRE-LAUNCH / 01', thDescription: 'เสื้อยืดโอเวอร์ไซซ์ งานพิมพ์ด้านหน้า และกราฟิกมือประกบด้านหลัง', description: 'Oversized tee with a front print and the signature pressed-hands graphic on the back.', thSpecs: ['ผ้าคอตตอน 240 GSM (ต้นแบบ)', 'ดำวินเทจ / S–XL'], specs: ['240 GSM cotton concept', 'Vintage black / S–XL'], art: 'product-image-1' },
  'small-signal-tee': { name: 'SMALL SIGNAL TEE', thName: 'เสื้อยืด SMALL SIGNAL', sku: 'KH / FS-02', status: 'PRE-LAUNCH / 02', thDescription: 'สัญญาณเล็กๆ บนอกเสื้อ ในสามสีหลักของแบรนด์', description: 'A quiet chest signal in the three core KHARAWA colours.', thSpecs: ['ผ้าคอตตอน 230 GSM (ต้นแบบ)', 'ออฟไวท์ / ดำ / ขาว'], specs: ['230 GSM cotton concept', 'Off-white / Black / White'], art: 'product-image-2' },
  'rising-press-tee': { name: 'RISING PRESS TEE', thName: 'เสื้อยืด RISING PRESS', sku: 'KH / FS-03', status: 'PRE-LAUNCH / 03', thDescription: 'เสื้อกราฟิกขนาดใหญ่สำหรับ Collection 01 พร้อมคำว่า Made in the Press', description: 'A bold graphic tee for Collection 01, marked with Made in the Press.', thSpecs: ['ผ้าคอตตอน 240 GSM (ต้นแบบ)', 'ดำวินเทจ / S–XL'], specs: ['240 GSM cotton concept', 'Vintage black / S–XL'], art: 'product-image-3' },
  'press-typo-tee': { name: 'PRESS TYPO TEE', thName: 'เสื้อยืด PRESS TYPO', sku: 'KH / FS-04', status: 'PRE-LAUNCH / 04', thDescription: 'เสื้อกราฟิกตัวอักษร KHARAWA พร้อมคำว่า Made in the Press', description: 'Typography-led graphic tee featuring KHARAWA and Made in the Press.', thSpecs: ['ผ้าคอตตอน 230 GSM (ต้นแบบ)', 'ดำ / ขาว / S–XL'], specs: ['230 GSM cotton concept', 'Black / White / S–XL'], art: 'product-image-4' },
  'press-cap-01': { name: 'PRESS CAP 01', thName: 'หมวก PRESS CAP 01', sku: 'KH / CAP-01', status: 'PRE-LAUNCH / 05', thDescription: 'หมวกไฟว์แพนเนลสีดำ ปักชื่อ KHARAWA ด้วยด้ายสีแดง', description: 'A black structured five-panel cap with KHARAWA embroidered in red.', thSpecs: ['ทรงไฟว์แพนเนล โครงแข็ง', 'ฟรีไซซ์ / สีดำ'], specs: ['Structured five-panel', 'One size / Black'], art: 'product-image-5' },
};

const STORAGE_KEY = 'kharawa-cart-v1';
const LANGUAGE_KEY = 'kharawa-language-v1';
const TRANSLATIONS = {
  th: {
    'nav.manifesto': 'แนวคิด', 'nav.collection': 'คอลเลกชัน', 'nav.consign': 'ฝากขาย', 'nav.contact': 'ติดต่อ',
    'nav.mobileManifesto': '01 / แนวคิด', 'nav.mobileCollection': '02 / คอลเลกชัน', 'nav.mobileConsign': '03 / ฝากขาย', 'nav.mobileContact': '04 / ติดต่อ',
    'cart.title': 'ตะกร้าของคุณ', 'cart.total': 'รวม', 'cart.note': 'ราคาและค่าจัดส่งจะแจ้งยืนยันเมื่อเปิดรับสั่งจองล่วงหน้า', 'cart.checkout': 'ขอสั่งจองล่วงหน้า', 'cart.add': 'เพิ่มลงตะกร้า +',
    'price.tbc': 'ราคาจะแจ้งภายหลัง',
    'hero.eyebrow': 'งานพิมพ์เพื่อคนบนท้องถนน', 'hero.title': 'ส่งสัญญาณ<br /><em>ในแบบ</em><br />ของคุณ', 'hero.description': 'เสื้อผ้าไม่ใช่เพียงสิ่งที่เราสวมใส่ แต่คือสิ่งที่เราประกาศออกไป', 'hero.cta': 'ดูคอลเลกชัน ↗',
    'manifesto.eyebrow': 'KHARAWA / สัญญาณที่ทุกคนเห็น', 'manifesto.title': 'ไม่ใช่<br /><em>เครื่องแบบ</em><br />แต่คือจุดยืน', 'manifesto.body': 'เราเชื่อว่าสิ่งที่สวมใส่มีเสียงของตัวเอง KHARAWA จึงสร้างชิ้นงานที่ช่วยให้คุณสื่อสารได้ชัดเจน โดยไม่ต้องตะโกน',
    'collection.eyebrow': 'สัญญาณที่คัดสรร', 'collection.title': 'บันทึก<br /><em>จากสนาม</em>', 'collection.intro': 'ชิ้นงานจากสนามทดลองของ KHARAWA ดูรายละเอียดของแต่ละชิ้น แล้วเพิ่มลงตะกร้าเพื่อสั่งจองล่วงหน้า',
    'showcase.eyebrow': 'FIELD EDITION 001', 'showcase.title': 'สวมใส่<br /><em>ข้อความ</em>', 'showcase.cta': 'ดูชิ้นเด่น ↗',
    'note.eyebrow': 'มือสองคัดสรร', 'note.title': 'มีชิ้นงาน<br />ที่อยากส่งต่อ?', 'note.cta': 'ฝากขายกับเรา ↗',
    'consign.eyebrow': 'มือสองคัดสรร / ฝากขาย', 'consign.title': 'ส่งต่อ<br /><em>สัญญาณ</em>', 'consign.body': 'มีชิ้นงาน KHARAWA ที่อยากส่งต่อหรือไม่? ฝากรายละเอียดไว้กับเรา แล้วทีมงานจะติดต่อกลับเพื่อประเมินและแจ้งขั้นตอนถัดไป',
    'consign.ruleOneTitle': '01 / คัดสรร', 'consign.ruleOne': 'รับพิจารณาเสื้อผ้าและแอ็กเซสซอรีสภาพดี', 'consign.ruleTwoTitle': '02 / ตรวจสอบ', 'consign.ruleTwo': 'ทีมงานตรวจสภาพและยืนยันราคาก่อนลงขาย', 'consign.ruleThreeTitle': '03 / ส่งต่อ', 'consign.ruleThree': 'รอการติดต่อกลับเพื่อยืนยันการฝากขาย',
    'consign.itemLabel': 'ชื่อสินค้า', 'consign.itemPlaceholder': 'เช่น First Press Tee', 'consign.categoryLabel': 'หมวดหมู่', 'consign.categoryPlaceholder': 'เลือกหมวดหมู่', 'consign.tee': 'เสื้อยืด', 'consign.cap': 'หมวก', 'consign.accessory': 'แอ็กเซสซอรี',
    'consign.conditionLabel': 'สภาพสินค้า', 'consign.conditionPlaceholder': 'เลือกสภาพ', 'consign.conditionNew': 'เหมือนใหม่', 'consign.conditionGood': 'สภาพดี', 'consign.conditionUsed': 'มีร่องรอยการใช้งาน',
    'consign.priceLabel': 'ราคาที่ต้องการ', 'consign.pricePlaceholder': 'เช่น 1200', 'consign.contactLabel': 'ช่องทางติดต่อ', 'consign.contactPlaceholder': 'LINE / Instagram / เบอร์โทรศัพท์',
    'consign.detailsLabel': 'รายละเอียดเพิ่มเติม', 'consign.detailsPlaceholder': 'ไซซ์ สี ตำหนิ และข้อมูลที่ควรทราบ', 'consign.photoLabel': 'รูปสินค้า', 'consign.photoNote': 'รองรับ JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB', 'consign.photoError': 'กรุณาเลือก JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB',
    'consign.submit': 'ส่งข้อมูลฝากขาย ↗', 'consign.status': 'บันทึกร่างข้อมูลแล้ว ขณะนี้ยังเป็นเวอร์ชันทดลอง ข้อมูลถูกเก็บไว้ในเบราว์เซอร์นี้เท่านั้น และยังไม่ได้ส่งถึงทีมงาน',
    'contact.eyebrow': 'เข้าร่วมคลื่นความถี่', 'contact.title': 'เปิดตา<br /><em>รับสัญญาณ</em>', 'contact.body': 'คอลเลกชัน เรื่องเล่า และก้าวต่อไปของ KHARAWA จะเปิดเผยเมื่อถึงเวลา', 'contact.line': 'คุยผ่าน LINE ↗', 'contact.email': 'contact@kharawa.com ↗',
    'footer.signature': 'KHARAWA / 2026<br />ส่งสัญญาณในแบบของคุณ', 'footer.top': 'กลับขึ้นด้านบน ↑',
    emptyCart: 'ยังไม่มีสินค้าในตะกร้า', viewDetails: 'ดูรายละเอียด', addShort: 'เพิ่มลงตะกร้า', bag: 'ตะกร้า', index: 'เมนู'
  },
  en: {
    'nav.manifesto': 'MANIFESTO', 'nav.collection': 'COLLECTION', 'nav.consign': 'CONSIGN', 'nav.contact': 'CONTACT',
    'nav.mobileManifesto': '01 / MANIFESTO', 'nav.mobileCollection': '02 / COLLECTION', 'nav.mobileConsign': '03 / CONSIGN', 'nav.mobileContact': '04 / CONTACT',
    'cart.title': 'YOUR BAG', 'cart.total': 'TOTAL', 'cart.note': 'Price and shipping will be confirmed when Pre-order opens.', 'cart.checkout': 'REQUEST PRE-ORDER', 'cart.add': 'ADD TO BAG +',
    'price.tbc': 'PRICE TBC',
    'hero.eyebrow': 'INKED FOR THE STREETS', 'hero.title': 'MAKE<br /><em>YOUR</em><br />SIGNAL.', 'hero.description': 'Clothing is not just what you wear — it is what you announce.', 'hero.cta': 'EXPLORE THE SIGNAL ↗',
    'manifesto.eyebrow': 'KHARAWA / A PUBLIC SIGNAL', 'manifesto.title': 'NOT A<br /><em>UNIFORM.</em><br />A POSITION.', 'manifesto.body': 'We believe what you wear has its own voice. KHARAWA creates pieces that let you speak without having to shout.',
    'collection.eyebrow': 'SELECTED SIGNALS', 'collection.title': 'THE FIELD<br /><em>NOTES.</em>', 'collection.intro': 'Pieces from the KHARAWA field study — explore each piece and add it to your Pre-order bag.',
    'showcase.eyebrow': 'FIELD EDITION 001', 'showcase.title': 'WEAR THE<br /><em>MESSAGE.</em>', 'showcase.cta': 'VIEW FEATURED PIECE ↗',
    'note.eyebrow': 'PRE-LOVED', 'note.title': 'HAVE A PIECE<br />TO PASS ON?', 'note.cta': 'CONSIGN WITH US ↗',
    'consign.eyebrow': 'PRE-LOVED / CONSIGNMENT', 'consign.title': 'PASS IT<br /><em>FORWARD.</em>', 'consign.body': 'Have a KHARAWA piece ready for a new life? Leave the details and our team will get back to you with the next steps.',
    'consign.ruleOneTitle': '01 / CURATE', 'consign.ruleOne': 'We review clothing and accessories in good condition.', 'consign.ruleTwoTitle': '02 / REVIEW', 'consign.ruleTwo': 'Our team checks condition and confirms the price before listing.', 'consign.ruleThreeTitle': '03 / PASS ON', 'consign.ruleThree': 'We contact you to confirm the consignment.',
    'consign.itemLabel': 'Item name', 'consign.itemPlaceholder': 'e.g. First Press Tee', 'consign.categoryLabel': 'Category', 'consign.categoryPlaceholder': 'Choose a category', 'consign.tee': 'Tee', 'consign.cap': 'Cap', 'consign.accessory': 'Accessory',
    'consign.conditionLabel': 'Condition', 'consign.conditionPlaceholder': 'Choose condition', 'consign.conditionNew': 'Like new', 'consign.conditionGood': 'Good condition', 'consign.conditionUsed': 'Visible wear',
    'consign.priceLabel': 'Asking price', 'consign.pricePlaceholder': 'e.g. 1200', 'consign.contactLabel': 'Contact channel', 'consign.contactPlaceholder': 'LINE / Instagram / phone',
    'consign.detailsLabel': 'More details', 'consign.detailsPlaceholder': 'Size, colour, flaws and anything we should know', 'consign.photoLabel': 'Product photo', 'consign.photoNote': 'JPG, PNG or WebP up to 5 MB', 'consign.photoError': 'Choose a JPG, PNG or WebP image up to 5 MB.',
    'consign.submit': 'SUBMIT CONSIGNMENT ↗', 'consign.status': 'Draft saved. This is a trial version: your details stay in this browser only and have not been sent to our team yet.',
    'contact.eyebrow': 'JOIN THE FREQUENCY', 'contact.title': 'KEEP YOUR<br /><em>EYES OPEN.</em>', 'contact.body': 'The next collection, story and movement from KHARAWA will be released when the time is right.', 'contact.line': 'CHAT ON LINE ↗', 'contact.email': 'contact@kharawa.com ↗',
    'footer.signature': 'KHARAWA / 2026<br />MAKE YOUR SIGNAL.', 'footer.top': 'BACK TO TOP ↑',
    emptyCart: 'Your bag is empty', viewDetails: 'VIEW DETAILS', addShort: 'ADD +', bag: 'BAG', index: 'INDEX'
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
    const parsed = JSON.parse(readStorage(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => PRODUCTS[item.id] && item.quantity > 0) : [];
  } catch { return []; }
}
function saveCart() { writeStorage(STORAGE_KEY, JSON.stringify(cart)); }
function totalItems() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
function product(id) { return PRODUCTS[id]; }
function localizedStatus(p) { return currentLanguage === 'th' ? `เตรียมเปิดตัว / ${p.status.split(' / ')[1]}` : p.status; }
function priceLabel() { return TRANSLATIONS[currentLanguage]['price.tbc']; }
function consignStatusText() { return TRANSLATIONS[currentLanguage]['consign.status']; }

function applyLanguage(language = currentLanguage) {
  currentLanguage = language === 'en' ? 'en' : 'th';
  const dictionary = TRANSLATIONS[currentLanguage];
  document.documentElement.lang = currentLanguage;
  writeStorage(LANGUAGE_KEY, currentLanguage);
  $$('[data-i18n]').forEach((element) => { if (dictionary[element.dataset.i18n]) element.textContent = dictionary[element.dataset.i18n]; });
  $$('[data-i18n-html]').forEach((element) => { if (dictionary[element.dataset.i18nHtml]) element.innerHTML = dictionary[element.dataset.i18nHtml]; });
  $$('[data-i18n-placeholder]').forEach((element) => { if (dictionary[element.dataset.i18nPlaceholder]) element.placeholder = dictionary[element.dataset.i18nPlaceholder]; });
  $$('.language-button').forEach((button) => { const active = button.dataset.language === currentLanguage; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
  const cartButton = $('.cart-button');
  if (cartButton?.firstChild) cartButton.firstChild.textContent = `${dictionary.bag} `;
  if ($('.menu-button')) $('.menu-button').textContent = dictionary.index;
  $$('.text-button').forEach((button) => { button.textContent = dictionary.viewDetails; });
  $$('.add-button').forEach((button) => { button.textContent = dictionary.addShort; });
  if ($('#consign-status')?.dataset.state === 'saved') $('#consign-status').textContent = consignStatusText();
  if ($('#consign-photo-error')?.dataset.state === 'invalid') $('#consign-photo-error').textContent = dictionary['consign.photoError'];
  $$('.product-card[data-card]').forEach((card) => {
    const p = product(card.dataset.card);
    if (!p) return;
    card.querySelector('.product-meta').textContent = localizedStatus(p);
    card.querySelector('h3').textContent = currentLanguage === 'th' ? p.thName : p.name;
    card.querySelectorAll('p')[1].textContent = currentLanguage === 'th' ? p.thDescription : p.description;
    card.querySelectorAll('li').forEach((item, index) => { item.textContent = (currentLanguage === 'th' ? p.thSpecs : p.specs)[index]; });
  });
  renderCart();
  if ($('#product-modal')?.open && $('.modal-add')?.dataset.add) {
    const activeProduct = product($('.modal-add').dataset.add);
    $('.modal-status').textContent = localizedStatus(activeProduct);
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
    $('.cart-total-value').textContent = priceLabel();
    return;
  }
  container.innerHTML = cart.map((item) => {
    const p = product(item.id);
    const localizedName = currentLanguage === 'th' ? p.thName : p.name;
    return `<div class="cart-item">
      <div class="cart-item-art product-image ${p.art}"></div>
      <div><h3>${localizedName}</h3><p>${p.sku} · ${priceLabel()}</p>
        <div class="cart-quantity"><button type="button" data-decrease="${item.id}" aria-label="${currentLanguage === 'th' ? 'ลดจำนวน' : 'Decrease quantity'}">−</button><span>${item.quantity}</span><button type="button" data-increase="${item.id}" aria-label="${currentLanguage === 'th' ? 'เพิ่มจำนวน' : 'Increase quantity'}">+</button></div>
      </div>
      <button class="cart-remove" type="button" data-remove="${item.id}">${currentLanguage === 'th' ? 'ลบ' : 'REMOVE'}</button>
    </div>`;
  }).join('');
  $('.cart-total-value').textContent = priceLabel();
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
  $('.modal-status').textContent = localizedStatus(p);
  $('.modal-title').textContent = currentLanguage === 'th' ? p.thName : p.name;
  $('.modal-description').textContent = currentLanguage === 'th' ? p.thDescription : p.description;
  $('.modal-specs').innerHTML = (currentLanguage === 'th' ? p.thSpecs : p.specs).map((spec) => `<li>${spec}</li>`).join('');
  $('.modal-add').dataset.add = id;
  modal.showModal();
  document.body.classList.add('modal-open');
}
function closeProduct() { $('#product-modal').close(); document.body.classList.remove('modal-open'); }

$('#consign-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  let drafts = [];
  try { const stored = JSON.parse(readStorage('kharawa-consignment-drafts-v1') || '[]'); if (Array.isArray(stored)) drafts = stored; } catch { /* start a fresh list */ }
  drafts.push({ ...data, photo: data.photo?.name || '', createdAt: new Date().toISOString() });
  writeStorage('kharawa-consignment-drafts-v1', JSON.stringify(drafts));
  const status = $('#consign-status');
  status.dataset.state = 'saved';
  status.textContent = consignStatusText();
  form.reset();
  $('#consign-photo-preview').hidden = true;
  $('#consign-photo-error').textContent = '';
  delete $('#consign-photo-error').dataset.state;
});

$('#consign-photo')?.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  const preview = $('#consign-photo-preview');
  const error = $('#consign-photo-error');
  error.textContent = '';
  delete error.dataset.state;
  preview.hidden = true;
  if (!file) return;
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
    error.dataset.state = 'invalid';
    error.textContent = TRANSLATIONS[currentLanguage]['consign.photoError'];
    event.target.value = '';
    return;
  }
  const objectUrl = URL.createObjectURL(file);
  preview.src = objectUrl;
  preview.hidden = false;
  preview.onload = () => URL.revokeObjectURL(objectUrl);
});

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
function closeMobileNav() { const nav = $('#mobile-nav'); if (!nav || nav.hidden) return; nav.hidden = true; $('.menu-button').setAttribute('aria-expanded', 'false'); }
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeCart(); closeMobileNav(); if ($('#product-modal').open) closeProduct(); } });
$$('.language-button').forEach((button) => button.addEventListener('click', () => applyLanguage(button.dataset.language)));
applyLanguage();
