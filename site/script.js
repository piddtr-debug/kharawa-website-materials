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
    'buy.shopee': 'ซื้อบน Shopee ↗', 'buy.line': 'ถามไซซ์ทาง LINE ↗', 'trust.label': 'ช่องทางและบริการ', 'trust.1t': 'สั่งซื้อผ่าน Shopee', 'trust.1': 'ร้านทางการของ KHARAWA', 'trust.2t': 'ทักถามไซซ์ทาง LINE', 'trust.2': 'สอบถามไซซ์และสต็อก @Kharawa', 'trust.3t': 'รับฝากขายมือสอง', 'trust.3': 'ส่งต่อชิ้นงานที่ผ่านการคัดสรร', 'trust.4t': 'ติดตามข่าวสาร', 'trust.4': 'Instagram · TikTok · Facebook',
    'price.tbc': 'ราคาจะแจ้งภายหลัง',
    'hero.eyebrow': 'งานพิมพ์เพื่อคนบนท้องถนน', 'hero.title': 'ส่งสัญญาณ<br /><em>ในแบบ</em><br />ของคุณ', 'hero.description': 'เสื้อผ้าไม่ใช่เพียงสิ่งที่เราสวมใส่ แต่คือสิ่งที่เราประกาศออกไป', 'hero.cta': 'ดูคอลเลกชัน ↗',
    'manifesto.eyebrow': 'KHARAWA / สัญญาณที่ทุกคนเห็น', 'manifesto.title': 'ไม่ใช่<br /><em>เครื่องแบบ</em><br />แต่คือจุดยืน', 'manifesto.body': 'เราเชื่อว่าสิ่งที่สวมใส่มีเสียงของตัวเอง KHARAWA จึงสร้างชิ้นงานที่ช่วยให้คุณสื่อสารได้ชัดเจน โดยไม่ต้องตะโกน',
    'collection.eyebrow': 'สัญญาณที่คัดสรร', 'collection.title': 'บันทึก<br /><em>จากสนาม</em>', 'collection.intro': 'ชิ้นงานจากสนามทดลองของ KHARAWA ดูรายละเอียดของแต่ละชิ้น แล้วเพิ่มลงตะกร้าเพื่อสั่งจองล่วงหน้า',
    'showcase.eyebrow': 'FIELD EDITION 001', 'showcase.title': 'สวมใส่<br /><em>ข้อความ</em>', 'showcase.cta': 'ดูชิ้นเด่น ↗',
    'note.eyebrow': 'มือสองคัดสรร', 'note.title': 'มีชิ้นงาน<br />ที่อยากส่งต่อ?', 'note.cta': 'ฝากขายกับเรา ↗',
    'consign.eyebrow': 'มือสองคัดสรร / ฝากขาย', 'consign.title': 'ส่งต่อ<br /><em>สัญญาณ</em>', 'consign.body': 'มีเสื้อผ้าสภาพดีที่อยากส่งต่อหรือไม่? รับทั้งของ KHARAWA และแบรนด์อื่น ฝากรายละเอียดไว้กับเรา แล้วทีมงานจะติดต่อกลับเพื่อประเมินและแจ้งขั้นตอนถัดไป',
    'consign.ruleOneTitle': '01 / คัดสรร', 'consign.ruleOne': 'รับพิจารณาเสื้อผ้าและแอ็กเซสซอรีสภาพดี', 'consign.ruleTwoTitle': '02 / ตรวจสอบ', 'consign.ruleTwo': 'ทีมงานตรวจสภาพและยืนยันราคาก่อนลงขาย', 'consign.ruleThreeTitle': '03 / ส่งต่อ', 'consign.ruleThree': 'รอการติดต่อกลับเพื่อยืนยันการฝากขาย',
    'consign.itemLabel': 'ชื่อสินค้า', 'consign.itemPlaceholder': 'เช่น First Press Tee', 'consign.categoryLabel': 'หมวดหมู่', 'consign.categoryPlaceholder': 'เลือกหมวดหมู่', 'consign.tee': 'เสื้อยืด', 'consign.cap': 'หมวก', 'consign.accessory': 'แอ็กเซสซอรี',
    'consign.conditionLabel': 'สภาพสินค้า', 'consign.conditionPlaceholder': 'เลือกสภาพ', 'consign.conditionNew': 'เหมือนใหม่', 'consign.conditionGood': 'สภาพดี', 'consign.conditionUsed': 'มีร่องรอยการใช้งาน',
    'consign.pricePlaceholder': 'เช่น 1200', 'consign.contactLabel': 'ช่องทางติดต่อ', 'consign.contactPlaceholder': 'LINE / Instagram / เบอร์โทรศัพท์',
    'consign.detailsLabel': 'รายละเอียดเพิ่มเติม',
    'consign.brandLabel': 'แบรนด์ของสินค้า', 'consign.brandKharawa': 'KHARAWA',
    'consign.brandOther': 'แบรนด์อื่น', 'consign.brandNameLabel': 'ชื่อแบรนด์',
    'consign.brandNamePlaceholder': 'เช่น Uniqlo, Carhartt', 'consign.shirt': 'เสื้อเชิ้ต / เสื้อมีกระดุม',
    'consign.outer': 'แจ็กเก็ต / เสื้อคลุม', 'consign.bottoms': 'กางเกง / กระโปรง',
    'consign.otherCat': 'อื่นๆ', 'consign.sizeLabel': 'ไซซ์',
    'consign.sizePlaceholder': 'เช่น L หรืออก 40 นิ้ว', 'consign.priceLabel': 'ราคาที่ต้องการ (บาท)',
    'consign.detailsPlaceholder': 'สี ตำหนิ ปีที่ซื้อ และข้อมูลที่ควรทราบ', 'consign.photoLabel': 'รูปสินค้า (ได้สูงสุด 4 รูป)',
    'consign.photoNote': 'แนะนำให้ถ่ายด้านหน้า ด้านหลัง ป้ายไซซ์ และจุดที่มีตำหนิ รองรับ JPG, PNG หรือ WebP ไม่เกิน 5 MB ต่อรูป', 'consign.photoError': 'กรุณาเลือก JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB ต่อรูป และไม่เกิน 4 รูป',
    'consign.consent': 'ฉันยินยอมให้ KHARAWA ใช้ข้อมูลที่กรอกเพื่อติดต่อกลับเรื่องการฝากขายเท่านั้น', 'consign.formError': 'กรุณากรอกข้อมูลที่มีเครื่องหมายจำเป็นให้ครบ และติ๊กยินยอมก่อนส่ง',
    'done.eyebrow': 'บันทึกรายการแล้ว', 'done.refLabel': 'เลขอ้างอิง',
    'done.next': 'อีกหนึ่งขั้นตอน: กดส่งรายการนี้ให้ทีมงานทาง LINE เพื่อให้เราได้รับข้อมูล แล้วส่งรูปสินค้าต่อในแชทได้เลย ทีมงานจะติดต่อกลับเพื่อประเมินราคา', 'done.line': 'ส่งให้ทีมงานทาง LINE ↗',
    'done.copy': 'คัดลอกข้อความ', 'done.copied': 'คัดลอกแล้ว',
    'done.again': 'ฝากชิ้นอื่นต่อ', 'done.note': 'หมายเหตุ: เว็บไซต์ยังไม่ได้ส่งข้อมูลให้ทีมงานอัตโนมัติ ข้อมูลที่กรอกถูกเก็บไว้ในเบราว์เซอร์นี้เท่านั้น',
    'sum.ref': 'เลขอ้างอิง', 'sum.brand': 'แบรนด์',
    'sum.item': 'สินค้า', 'sum.category': 'หมวดหมู่',
    'sum.size': 'ไซซ์', 'sum.condition': 'สภาพ',
    'sum.price': 'ราคาที่ต้องการ', 'sum.contact': 'ติดต่อ',
    'sum.details': 'รายละเอียด', 'sum.photos': 'รูปที่เลือก',
    'sum.header': 'ขอฝากขายสินค้า', 'preloved.eyebrow': 'มือสองคัดสรร',
    'preloved.title': 'ชิ้นที่ผ่านมือ<br /><em>มาแล้ว</em>', 'preloved.body': 'เสื้อผ้ามือสองที่ทีมงานตรวจสภาพแล้ว ทั้งของ KHARAWA และแบรนด์อื่น สนใจชิ้นไหนทักถามทาง LINE ได้เลย',
    'preloved.all': 'ทั้งหมด', 'preloved.empty': 'กำลังคัดสรรชิ้นแรก ถ้าอยากให้ชิ้นของคุณเป็นหนึ่งในนั้น ฝากขายได้ที่ฟอร์มด้านล่าง',
    'preloved.ask': 'ถามทาง LINE ↗', 'preloved.priceTbc': 'สอบถามราคา',
    'preloved.available': 'พร้อมขาย', 'preloved.reserved': 'จองแล้ว',
    'preloved.sold': 'ขายแล้ว', 'preloved.size': 'ไซซ์',
    'preloved.noPhoto': 'ยังไม่มีรูป', 'preloved.askText': 'สนใจสินค้ามือสอง',
    'consign.submit': 'ส่งข้อมูลฝากขาย ↗',
    'contact.eyebrow': 'เข้าร่วมคลื่นความถี่', 'contact.title': 'เปิดตา<br /><em>รับสัญญาณ</em>', 'contact.body': 'คอลเลกชัน เรื่องเล่า และก้าวต่อไปของ KHARAWA จะเปิดเผยเมื่อถึงเวลา', 'contact.line': 'คุยผ่าน LINE ↗', 'contact.email': 'contact@kharawa.com ↗',
    'footer.signature': 'KHARAWA / 2026<br />ส่งสัญญาณในแบบของคุณ', 'footer.top': 'กลับขึ้นด้านบน ↑',
    emptyCart: 'ยังไม่มีสินค้าในตะกร้า', viewDetails: 'ดูรายละเอียด', addShort: 'เพิ่มลงตะกร้า', bag: 'ตะกร้า', index: 'เมนู'
  },
  en: {
    'nav.manifesto': 'MANIFESTO', 'nav.collection': 'COLLECTION', 'nav.consign': 'CONSIGN', 'nav.contact': 'CONTACT',
    'nav.mobileManifesto': '01 / MANIFESTO', 'nav.mobileCollection': '02 / COLLECTION', 'nav.mobileConsign': '03 / CONSIGN', 'nav.mobileContact': '04 / CONTACT',
    'cart.title': 'YOUR BAG', 'cart.total': 'TOTAL', 'cart.note': 'Price and shipping will be confirmed when Pre-order opens.', 'cart.checkout': 'REQUEST PRE-ORDER', 'cart.add': 'ADD TO BAG +',
    'buy.shopee': 'BUY ON SHOPEE ↗', 'buy.line': 'ASK SIZE ON LINE ↗', 'trust.label': 'Channels and services', 'trust.1t': 'Shop on Shopee', 'trust.1': 'The official KHARAWA store', 'trust.2t': 'Ask about sizing on LINE', 'trust.2': 'Our team answers size and stock questions @Kharawa', 'trust.3t': 'Pre-loved consignment', 'trust.3': 'Pass on pieces we have selected', 'trust.4t': 'Follow along', 'trust.4': 'Instagram · TikTok · Facebook',
    'price.tbc': 'PRICE TBC',
    'hero.eyebrow': 'INKED FOR THE STREETS', 'hero.title': 'MAKE<br /><em>YOUR</em><br />SIGNAL.', 'hero.description': 'Clothing is not just what you wear — it is what you announce.', 'hero.cta': 'EXPLORE THE SIGNAL ↗',
    'manifesto.eyebrow': 'KHARAWA / A PUBLIC SIGNAL', 'manifesto.title': 'NOT A<br /><em>UNIFORM.</em><br />A POSITION.', 'manifesto.body': 'We believe what you wear has its own voice. KHARAWA creates pieces that let you speak without having to shout.',
    'collection.eyebrow': 'SELECTED SIGNALS', 'collection.title': 'THE FIELD<br /><em>NOTES.</em>', 'collection.intro': 'Pieces from the KHARAWA field study — explore each piece and add it to your Pre-order bag.',
    'showcase.eyebrow': 'FIELD EDITION 001', 'showcase.title': 'WEAR THE<br /><em>MESSAGE.</em>', 'showcase.cta': 'VIEW FEATURED PIECE ↗',
    'note.eyebrow': 'PRE-LOVED', 'note.title': 'HAVE A PIECE<br />TO PASS ON?', 'note.cta': 'CONSIGN WITH US ↗',
    'consign.eyebrow': 'PRE-LOVED / CONSIGNMENT', 'consign.title': 'PASS IT<br /><em>FORWARD.</em>', 'consign.body': 'Have a piece in good condition ready for a new life? We take KHARAWA and other brands. Leave the details and our team will get back to you with the next steps.',
    'consign.ruleOneTitle': '01 / CURATE', 'consign.ruleOne': 'We review clothing and accessories in good condition.', 'consign.ruleTwoTitle': '02 / REVIEW', 'consign.ruleTwo': 'Our team checks condition and confirms the price before listing.', 'consign.ruleThreeTitle': '03 / PASS ON', 'consign.ruleThree': 'We contact you to confirm the consignment.',
    'consign.itemLabel': 'Item name', 'consign.itemPlaceholder': 'e.g. First Press Tee', 'consign.categoryLabel': 'Category', 'consign.categoryPlaceholder': 'Choose a category', 'consign.tee': 'Tee', 'consign.cap': 'Cap', 'consign.accessory': 'Accessory',
    'consign.conditionLabel': 'Condition', 'consign.conditionPlaceholder': 'Choose condition', 'consign.conditionNew': 'Like new', 'consign.conditionGood': 'Good condition', 'consign.conditionUsed': 'Visible wear',
    'consign.pricePlaceholder': 'e.g. 1200', 'consign.contactLabel': 'Contact channel', 'consign.contactPlaceholder': 'LINE / Instagram / phone',
    'consign.detailsLabel': 'More details',
    'consign.brandLabel': 'Brand', 'consign.brandKharawa': 'KHARAWA',
    'consign.brandOther': 'Another brand', 'consign.brandNameLabel': 'Brand name',
    'consign.brandNamePlaceholder': 'e.g. Uniqlo, Carhartt', 'consign.shirt': 'Shirt / button-up',
    'consign.outer': 'Jacket / outerwear', 'consign.bottoms': 'Trousers / skirt',
    'consign.otherCat': 'Other', 'consign.sizeLabel': 'Size',
    'consign.sizePlaceholder': 'e.g. L or chest 40 in', 'consign.priceLabel': 'Asking price (THB)',
    'consign.detailsPlaceholder': 'Colour, flaws, year bought and anything we should know', 'consign.photoLabel': 'Photos (up to 4)',
    'consign.photoNote': 'Front, back, size label and any flaws work best. JPG, PNG or WebP, up to 5 MB each.', 'consign.photoError': 'Choose JPG, PNG or WebP images up to 5 MB each, 4 at most.',
    'consign.consent': 'I agree that KHARAWA may use these details only to contact me about this consignment.', 'consign.formError': 'Please fill in every required field and tick the consent box.',
    'done.eyebrow': 'Details saved', 'done.refLabel': 'Reference',
    'done.next': 'One more step: send this to our team on LINE so we receive it, then send the photos in the same chat. We will reply with a price assessment.', 'done.line': 'SEND TO OUR TEAM ON LINE ↗',
    'done.copy': 'COPY TEXT', 'done.copied': 'Copied',
    'done.again': 'Consign another piece', 'done.note': 'Note: this site does not send the form to our team automatically yet. Your details stay in this browser only.',
    'sum.ref': 'Reference', 'sum.brand': 'Brand',
    'sum.item': 'Item', 'sum.category': 'Category',
    'sum.size': 'Size', 'sum.condition': 'Condition',
    'sum.price': 'Asking price', 'sum.contact': 'Contact',
    'sum.details': 'Details', 'sum.photos': 'Photos selected',
    'sum.header': 'Consignment request', 'preloved.eyebrow': 'PRE-LOVED',
    'preloved.title': 'ALREADY<br /><em>LOVED.</em>', 'preloved.body': 'Second-hand pieces our team has checked, from KHARAWA and other brands. Ask about any piece on LINE.',
    'preloved.all': 'ALL', 'preloved.empty': 'We are curating the first pieces. Want yours to be among them? Use the consignment form below.',
    'preloved.ask': 'ASK ON LINE ↗', 'preloved.priceTbc': 'Ask for price',
    'preloved.available': 'Available', 'preloved.reserved': 'Reserved',
    'preloved.sold': 'Sold', 'preloved.size': 'Size',
    'preloved.noPhoto': 'No photo yet', 'preloved.askText': 'I am interested in this pre-loved piece',
    'consign.submit': 'SUBMIT CONSIGNMENT ↗',
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
  if ($('#consign-form-error')?.dataset.state === 'invalid') $('#consign-form-error').textContent = dictionary['consign.formError'];
  if (lastConsign) renderConsignDone();
  renderPreloved();
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

// ---- Consignment form -------------------------------------------------------
const LINE_OA = '%40Kharawa';
const CONSIGN_KEY = 'kharawa-consignment-drafts-v1';
const MAX_PHOTOS = 4;
let lastConsign = null;
const tr = (key) => TRANSLATIONS[currentLanguage][key] || key;
function optionLabel(select, value) { const option = select?.querySelector(`option[value="${value}"]`); return option ? option.textContent.trim() : value; }
function makeReference() {
  const now = new Date();
  const ymd = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let tail = '';
  for (let i = 0; i < 4; i += 1) tail += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `KH-C-${ymd}-${tail}`;
}
function consignSummary() {
  if (!lastConsign) return '';
  const c = lastConsign;
  const form = $('#consign-form');
  const brand = c.brand === 'other' ? (c.brandName || tr('consign.brandOther')) : 'KHARAWA';
  const condition = tr({ new: 'consign.conditionNew', good: 'consign.conditionGood', used: 'consign.conditionUsed' }[c.condition]);
  const rows = [
    `${tr('sum.header')}`,
    `${tr('sum.ref')}: ${c.ref}`,
    `${tr('sum.brand')}: ${brand}`,
    `${tr('sum.item')}: ${c.itemName}`,
    `${tr('sum.category')}: ${optionLabel(form.elements.category, c.category)}`,
    `${tr('sum.size')}: ${c.size}`,
    `${tr('sum.condition')}: ${condition}`,
    `${tr('sum.price')}: ${c.price ? `${Number(c.price).toLocaleString('en-US')} THB` : '-'}`,
    `${tr('sum.contact')}: ${c.contact}`,
    `${tr('sum.details')}: ${c.details || '-'}`,
    `${tr('sum.photos')}: ${c.photoCount}`
  ];
  return rows.join('\n');
}
function renderConsignDone() {
  if (!lastConsign) return;
  const text = consignSummary();
  $('#done-ref').textContent = lastConsign.ref;
  $('#done-summary').textContent = text;
  $('#done-line').href = `https://line.me/R/oaMessage/${LINE_OA}/?text=${encodeURIComponent(text)}`;
}
function showConsignForm(show) {
  $('#consign-form').hidden = !show;
  $('#consign-done').hidden = show;
}
function syncBrandField() {
  const other = $('#consign-form')?.elements.brand.value === 'other';
  $('#brand-other-wrap').hidden = !other;
  $('#consign-form').elements.brandName.required = other;
}
let consignPhotos = [];
function renderPhotoPreviews() {
  const holder = $('#consign-photo-previews');
  holder.querySelectorAll('img').forEach((img) => URL.revokeObjectURL(img.src));
  holder.replaceChildren(...consignPhotos.map((file) => { const img = document.createElement('img'); img.className = 'photo-preview'; img.alt = file.name; img.src = URL.createObjectURL(file); return img; }));
}
$('#consign-form')?.addEventListener('change', (event) => { if (event.target.name === 'brand') syncBrandField(); });
$('#consign-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const error = $('#consign-form-error');
  if (!form.checkValidity() || $('#consign-photo-error').dataset.state === 'invalid') {
    error.dataset.state = 'invalid';
    error.textContent = tr('consign.formError');
    form.reportValidity();
    return;
  }
  delete error.dataset.state;
  error.textContent = '';
  const data = Object.fromEntries(new FormData(form).entries());
  delete data.photo;
  lastConsign = { ...data, price: data.price || '', details: data.details || '', brandName: data.brand === 'other' ? (data.brandName || '').trim() : '', photoCount: consignPhotos.length, ref: makeReference(), createdAt: new Date().toISOString() };
  let drafts = [];
  try { const stored = JSON.parse(readStorage(CONSIGN_KEY) || '[]'); if (Array.isArray(stored)) drafts = stored; } catch { /* start a fresh list */ }
  drafts.push({ ...lastConsign, photos: consignPhotos.map((file) => file.name) });
  writeStorage(CONSIGN_KEY, JSON.stringify(drafts));
  renderConsignDone();
  showConsignForm(false);
  $('#consign-done').focus();
});
$('#done-copy')?.addEventListener('click', async () => {
  const status = $('#done-status');
  try { await navigator.clipboard.writeText(consignSummary()); status.textContent = tr('done.copied'); }
  catch { const range = document.createRange(); range.selectNodeContents($('#done-summary')); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range); status.textContent = ''; }
});
$('#done-again')?.addEventListener('click', () => {
  lastConsign = null;
  $('#consign-form').reset();
  consignPhotos = [];
  renderPhotoPreviews();
  $('#consign-photo-error').textContent = '';
  delete $('#consign-photo-error').dataset.state;
  $('#done-status').textContent = '';
  syncBrandField();
  showConsignForm(true);
  $('#consign-form').elements.itemName.focus();
});
$('#consign-photo')?.addEventListener('change', (event) => {
  const files = [...(event.target.files || [])];
  const error = $('#consign-photo-error');
  error.textContent = '';
  delete error.dataset.state;
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (files.length > MAX_PHOTOS || files.some((file) => !allowed.includes(file.type) || file.size > 5 * 1024 * 1024)) {
    error.dataset.state = 'invalid';
    error.textContent = tr('consign.photoError');
    event.target.value = '';
    consignPhotos = [];
  } else { consignPhotos = files; }
  renderPhotoPreviews();
});

// ---- Pre-loved listing -------------------------------------------------------
// Add real pieces here. Shape:
// { id: 'pl-001', brand: 'KHARAWA' | 'Carhartt' | ..., name: '...', size: 'L', condition: 'new' | 'good' | 'used',
//   price: 1200 (or null = "ask for price"), status: 'available' | 'reserved' | 'sold', image: './assets/preloved/pl-001.webp' (or '') }
// Optional: images: ['./a.webp', './b.webp'] to use several photos in the auto video.
// Preview only: add ?demo=preloved to the URL to see sample cards (uses existing product photos, not real second-hand stock).
const PRELOVED_DEMO = [
  { id: 'demo-1', brand: 'KHARAWA', name: 'First Press Tee', size: 'L', condition: 'good', price: 590, status: 'available', image: './assets/products/first-press-tee.webp', images: ['./assets/products/first-press-tee.webp', './assets/products/rising-press-tee.webp'] },
  { id: 'demo-2', brand: 'Carhartt', name: 'Pocket Tee', size: 'M', condition: 'new', price: null, status: 'available', image: './assets/products/small-signal-tee.webp' },
];
const PRELOVED_ITEMS = (window.KHARAWA_DEMO || new URLSearchParams(location.search).get('demo') === 'preloved') ? PRELOVED_DEMO : [];
let prelovedFilter = 'all';
function renderPreloved(items = PRELOVED_ITEMS) {
  const grid = $('#preloved-grid');
  if (!grid) return;
  const filters = $('#preloved-filters');
  const empty = $('#preloved-empty');
  const brands = [...new Set(items.map((item) => item.brand))];
  if (prelovedFilter !== 'all' && !brands.includes(prelovedFilter)) prelovedFilter = 'all';
  filters.hidden = items.length === 0 || brands.length < 2;
  filters.replaceChildren(...['all', ...brands].map((brand) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'filter-chip'; button.dataset.brand = brand;
    button.textContent = brand === 'all' ? tr('preloved.all') : brand;
    button.setAttribute('aria-pressed', String(prelovedFilter === brand));
    button.addEventListener('click', () => { prelovedFilter = brand; renderPreloved(items); });
    return button;
  }));
  const visible = items.filter((item) => prelovedFilter === 'all' || item.brand === prelovedFilter);
  empty.hidden = items.length > 0;
  empty.textContent = items.length ? '' : tr('preloved.empty');
  const conditionKey = { new: 'consign.conditionNew', good: 'consign.conditionGood', used: 'consign.conditionUsed' };
  grid.replaceChildren(...visible.map((item) => {
    const card = document.createElement('article');
    card.className = `preloved-card is-${item.status || 'available'}`;
    const media = document.createElement('div'); media.className = 'preloved-media';
    if (item.image) { const img = document.createElement('img'); img.src = item.image; img.alt = item.name; img.loading = 'lazy'; media.append(img); }
    else { media.classList.add('no-photo'); media.textContent = tr('preloved.noPhoto'); }
    const badge = document.createElement('span'); badge.className = 'status-badge'; badge.textContent = tr(`preloved.${item.status || 'available'}`); media.append(badge);
    const brand = document.createElement('p'); brand.className = 'preloved-brand'; brand.textContent = item.brand;
    const name = document.createElement('h3'); name.textContent = item.name;
    const meta = document.createElement('p'); meta.className = 'preloved-meta'; meta.textContent = `${tr('preloved.size')} ${item.size} · ${tr(conditionKey[item.condition] || '')}`;
    const price = document.createElement('strong'); price.textContent = item.price ? `฿${Number(item.price).toLocaleString('en-US')}` : tr('preloved.priceTbc');
    card.append(media, brand, name, meta, price);
    if (item.status !== 'sold') {
      const ask = document.createElement('a'); ask.className = 'buy-link'; ask.target = '_blank'; ask.rel = 'noopener noreferrer'; ask.textContent = tr('preloved.ask');
      ask.href = `https://line.me/R/oaMessage/${LINE_OA}/?text=${encodeURIComponent(`${tr('preloved.askText')}: ${item.brand} ${item.name} (${item.id})`)}`;
      card.append(ask);
    }
    if (window.KharawaShare) {
      const share = document.createElement('button'); share.type = 'button'; share.className = 'buy-link share-open-btn'; share.textContent = window.KharawaShare.label();
      share.addEventListener('click', () => window.KharawaShare.open(item));
      card.append(share);
    }
    card.id = `preloved-${item.id}`;
    return card;
  }));
}

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
