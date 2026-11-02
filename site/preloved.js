// Pre-loved shop page: grid, filters, item dialog. Data comes from KharawaPreloved.load() (Google Sheet via Apps Script).
(function () {
  const LANGUAGE_KEY = 'kharawa-language-v1';
  const LINE_OA = '%40Kharawa';
  const SHOPEE = 'https://shopee.co.th/liu.bei0705#product_list';
  const TEXT = {
    th: {
      'nav.collection': 'คอลเลกชัน', 'nav.preloved': 'มือสอง', 'nav.consign': 'ฝากขาย', 'nav.contact': 'ติดต่อ', 'page.home': '← หน้าแรก',
      'page.eyebrow': 'มือสองคัดสรร / PRE-LOVED', 'page.title': 'สินค้า<br /><em>มือสอง</em>',
      'page.body': 'เสื้อผ้าและชิ้นงานที่ทีมงานตรวจสภาพแล้ว ทั้งของ KHARAWA และแบรนด์อื่น แต่ละชิ้นมีชิ้นเดียว สนใจชิ้นไหนทักถามทาง LINE ได้เลย',
      'page.cta': 'มีเสื้อผ้าสภาพดีที่อยากส่งต่อ?', 'page.ctaButton': 'ฝากขายกับเรา ↗',
      'f.category': 'หมวดหมู่', 'f.size': 'ไซซ์', 'f.sort': 'เรียงตาม', 's.new': 'ใหม่ล่าสุด', 's.low': 'ราคาต่ำไปสูง', 's.high': 'ราคาสูงไปต่ำ',
      all: 'ทั้งหมด', allCat: 'ทุกหมวดหมู่', allSize: 'ทุกไซซ์', count: (n) => `แสดง ${n} ชิ้น`,
      loading: 'กำลังโหลดสินค้า…', empty: 'กำลังคัดสรรชิ้นแรก แวะกลับมาใหม่เร็วๆ นี้ หรือฝากขายชิ้นของคุณได้เลย',
      noMatch: 'ไม่พบสินค้าตามตัวกรองนี้ ลองเปลี่ยนตัวกรอง', error: 'โหลดรายการสินค้าไม่สำเร็จ ลองใหม่อีกครั้ง หรือทักถามทาง LINE ได้เลย', retry: 'ลองใหม่', askLine: 'ทักทาง LINE ↗',
      status: { available: 'พร้อมขาย', reserved: 'จองแล้ว', sold: 'ขายแล้ว' }, cond: { new: 'เหมือนใหม่', good: 'สภาพดี', used: 'มีร่องรอยการใช้งาน' },
      cat: { tee: 'เสื้อยืด', shirt: 'เสื้อเชิ้ต / เสื้อมีกระดุม', outer: 'แจ็กเก็ต / เสื้อคลุม', bottoms: 'กางเกง / กระโปรง', cap: 'หมวก', accessory: 'แอ็กเซสซอรี', other: 'อื่นๆ' },
      size: 'ไซซ์', condition: 'สภาพ', category: 'หมวดหมู่', price: 'ราคา', priceTbc: 'สอบถามราคา', noPhoto: 'ยังไม่มีรูป', view: 'ดูรายละเอียด', close: 'ปิด',
      ask: 'ถามทาง LINE ↗', shopee: 'ดูร้านบน Shopee ↗', copyLink: 'คัดลอกลิงก์', copied: 'คัดลอกแล้ว', soldNote: 'ชิ้นนี้ขายแล้ว', reservedNote: 'ชิ้นนี้มีคนจองแล้ว ทักถามได้ถ้าอยากให้แจ้งเมื่อว่าง',
      askText: 'สนใจสินค้ามือสอง', photoOf: (n, i, t) => `${n} รูปที่ ${i} จาก ${t}`, 'footer.signature': 'KHARAWA / 2026<br />ส่งสัญญาณในแบบของคุณ', 'footer.top': 'กลับขึ้นด้านบน ↑',
    },
    en: {
      'nav.collection': 'COLLECTION', 'nav.preloved': 'PRE-LOVED', 'nav.consign': 'CONSIGN', 'nav.contact': 'CONTACT', 'page.home': '← HOME',
      'page.eyebrow': 'PRE-LOVED / CURATED', 'page.title': 'PRE-LOVED<br /><em>PIECES</em>',
      'page.body': 'Clothing and pieces our team has checked, from KHARAWA and other brands. Every piece is one of one. Ask about any piece on LINE.',
      'page.cta': 'Have a piece in good condition to pass on?', 'page.ctaButton': 'CONSIGN WITH US ↗',
      'f.category': 'Category', 'f.size': 'Size', 'f.sort': 'Sort by', 's.new': 'Newest', 's.low': 'Price: low to high', 's.high': 'Price: high to low',
      all: 'ALL', allCat: 'All categories', allSize: 'All sizes', count: (n) => `${n} ${n === 1 ? 'piece' : 'pieces'}`,
      loading: 'Loading pieces…', empty: 'We are curating the first pieces. Check back soon, or consign yours.',
      noMatch: 'Nothing matches these filters. Try changing them.', error: 'Could not load the pieces. Try again, or ask us on LINE.', retry: 'TRY AGAIN', askLine: 'ASK ON LINE ↗',
      status: { available: 'Available', reserved: 'Reserved', sold: 'Sold' }, cond: { new: 'Like new', good: 'Good condition', used: 'Visible wear' },
      cat: { tee: 'Tee', shirt: 'Shirt / button-up', outer: 'Jacket / outerwear', bottoms: 'Trousers / skirt', cap: 'Cap', accessory: 'Accessory', other: 'Other' },
      size: 'Size', condition: 'Condition', category: 'Category', price: 'Price', priceTbc: 'Ask for price', noPhoto: 'No photo yet', view: 'View details', close: 'Close',
      ask: 'ASK ON LINE ↗', shopee: 'OUR SHOPEE STORE ↗', copyLink: 'COPY LINK', copied: 'Copied', soldNote: 'This piece has been sold.', reservedNote: 'This piece is reserved. Ask us if you want to be told when it is free.',
      askText: 'I am interested in this pre-loved piece', photoOf: (n, i, t) => `${n}, photo ${i} of ${t}`, 'footer.signature': 'KHARAWA / 2026<br />MAKE YOUR SIGNAL.', 'footer.top': 'BACK TO TOP ↑',
    },
  };
  const $ = (s) => document.querySelector(s);
  const readLang = () => { try { return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'th'; } catch { return 'th'; } };
  let lang = readLang();
  const T = () => TEXT[lang];
  let items = [];
  let state = 'loading';
  const filters = { brand: 'all', category: 'all', size: 'all', sort: 'new' };
  let openId = null;

  const price = (item) => (item.price ? `฿${item.price.toLocaleString('en-US')}` : T().priceTbc);
  const catLabel = (item) => T().cat[item.category] || item.categoryLabel || T().cat.other;
  const lineUrl = (item) => `https://line.me/R/oaMessage/${LINE_OA}/?text=${encodeURIComponent(`${T().askText}: ${item.brand} ${item.name} (${item.id})`)}`;
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function applyStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((n) => { const v = T()[n.dataset.i18n]; if (typeof v === 'string') n.textContent = v; });
    document.querySelectorAll('[data-i18n-html]').forEach((n) => { const v = T()[n.dataset.i18nHtml]; if (typeof v === 'string') n.innerHTML = v; });
    document.querySelectorAll('.language-button').forEach((b) => { const on = b.dataset.language === lang; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    document.title = lang === 'th' ? 'สินค้ามือสอง — KHARAWA' : 'Pre-loved — KHARAWA';
    $('#item-close').setAttribute('aria-label', T().close);
  }

  function filtered() {
    let list = items.filter((i) => (filters.brand === 'all' || i.brand === filters.brand) && (filters.category === 'all' || i.category === filters.category) && (filters.size === 'all' || i.size === filters.size));
    const rank = { available: 0, reserved: 1, sold: 2 };
    const base = items.map((i) => i.id);
    list = list.slice().sort((a, b) => {
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
      if (filters.sort === 'low') return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (filters.sort === 'high') return (b.price ?? -1) - (a.price ?? -1);
      return base.indexOf(a.id) - base.indexOf(b.id);
    });
    return list;
  }

  function renderTools() {
    const tools = $('#shop-tools');
    tools.hidden = items.length === 0;
    if (!items.length) return;
    const brands = [...new Set(items.map((i) => i.brand))];
    if (filters.brand !== 'all' && !brands.includes(filters.brand)) filters.brand = 'all';
    const bf = $('#brand-filters');
    bf.hidden = brands.length < 2;
    bf.replaceChildren(...['all', ...brands].map((b) => {
      const btn = el('button', 'filter-chip', b === 'all' ? T().all : b); btn.type = 'button'; btn.dataset.brand = b; btn.setAttribute('aria-pressed', String(filters.brand === b));
      btn.addEventListener('click', () => { filters.brand = b; render(); }); return btn;
    }));
    const cats = [...new Set(items.map((i) => i.category))];
    const sizes = [...new Set(items.map((i) => i.size).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    if (filters.category !== 'all' && !cats.includes(filters.category)) filters.category = 'all';
    if (filters.size !== 'all' && !sizes.includes(filters.size)) filters.size = 'all';
    const fill = (sel, first, values, label, current) => { sel.replaceChildren(new Option(first, 'all'), ...values.map((v) => new Option(label(v), v))); sel.value = current; };
    fill($('#f-category'), T().allCat, cats, (v) => T().cat[v] || v, filters.category);
    fill($('#f-size'), T().allSize, sizes, (v) => v, filters.size);
    $('#f-sort').value = filters.sort;
  }

  function card(item) {
    const a = el('article', `preloved-card is-${item.status}`); a.id = `item-${item.id}`;
    const media = el('button', 'preloved-media card-open'); media.type = 'button'; media.setAttribute('aria-label', `${T().view}: ${item.brand} ${item.name}`);
    if (item.image) { const img = el('img'); img.src = item.image; img.alt = ''; img.loading = 'lazy'; img.addEventListener('error', () => { img.remove(); media.classList.add('no-photo'); media.prepend(document.createTextNode(T().noPhoto)); }); media.append(img); }
    else { media.classList.add('no-photo'); media.append(document.createTextNode(T().noPhoto)); }
    media.append(el('span', 'status-badge', T().status[item.status]));
    media.addEventListener('click', () => openItem(item.id));
    const meta = el('p', 'preloved-meta', `${T().size} ${item.size} · ${T().cond[item.condition]}`);
    a.append(media, el('p', 'preloved-brand', item.brand), el('h3', null, item.name), meta, el('strong', null, price(item)));
    return a;
  }

  function render() {
    const stateEl = $('#shop-state');
    const grid = $('#shop-grid');
    renderTools();
    stateEl.replaceChildren();
    if (state === 'loading') { stateEl.textContent = T().loading; grid.replaceChildren(); return; }
    if (state === 'error') {
      stateEl.append(document.createTextNode(T().error + ' '));
      const retry = el('button', 'filter-chip', T().retry); retry.type = 'button'; retry.addEventListener('click', start);
      const line = el('a', 'filter-chip', T().askLine); line.href = `https://line.me/R/ti/p/${LINE_OA}`; line.target = '_blank'; line.rel = 'noopener noreferrer';
      stateEl.append(retry, ' ', line); grid.replaceChildren(); return;
    }
    if (!items.length) { stateEl.textContent = T().empty; grid.replaceChildren(); return; }
    const list = filtered();
    $('#shop-count').textContent = T().count(list.length);
    if (!list.length) stateEl.textContent = T().noMatch;
    grid.replaceChildren(...list.map(card));
  }

  function openItem(id, fromHash) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    openId = id;
    const d = $('#item-dialog');
    const photos = item.images && item.images.length ? item.images : [];
    const main = $('#item-main'); const thumbs = $('#item-thumbs');
    main.replaceChildren(); thumbs.replaceChildren();
    const showPhoto = (idx) => {
      main.replaceChildren();
      const img = el('img'); img.src = photos[idx]; img.alt = T().photoOf(item.name, idx + 1, photos.length); main.append(img);
      thumbs.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-current', String(k === idx)));
    };
    if (photos.length) {
      photos.forEach((src, idx) => { const b = el('button'); b.type = 'button'; b.setAttribute('aria-label', T().photoOf(item.name, idx + 1, photos.length)); const im = el('img'); im.src = src; im.alt = ''; b.append(im); b.addEventListener('click', () => showPhoto(idx)); thumbs.append(b); });
      thumbs.hidden = photos.length < 2; showPhoto(0);
    } else { main.append(el('p', 'no-photo-note', T().noPhoto)); thumbs.hidden = true; }
    $('#item-brand').textContent = item.brand; $('#item-name').textContent = item.name; $('#item-price').textContent = price(item);
    const specs = $('#item-specs'); specs.replaceChildren();
    [[T().size, item.size], [T().condition, T().cond[item.condition]], [T().category, catLabel(item)]].forEach(([k, v]) => { const row = el('div'); row.append(el('dt', null, k), el('dd', null, v)); specs.append(row); });
    $('#item-details').textContent = item.details;
    $('#item-details').hidden = !item.details;
    const actions = $('#item-actions'); actions.replaceChildren();
    if (item.status === 'sold') actions.append(el('p', 'item-note', T().soldNote));
    else { if (item.status === 'reserved') actions.append(el('p', 'item-note', T().reservedNote)); const ask = el('a', 'button button-cream', T().ask); ask.href = lineUrl(item); ask.target = '_blank'; ask.rel = 'noopener noreferrer'; actions.append(ask); }
    const shop = el('a', 'button button-ghost-light', T().shopee); shop.href = SHOPEE; shop.target = '_blank'; shop.rel = 'noopener noreferrer'; actions.append(shop);
    if (window.KharawaShare) { const sh = el('button', 'button button-ghost-light', window.KharawaShare.label()); sh.type = 'button'; sh.addEventListener('click', () => window.KharawaShare.open(item)); actions.append(sh); }
    const copy = el('button', 'button button-ghost-light', T().copyLink); copy.type = 'button';
    copy.addEventListener('click', async () => { const url = `${location.origin}${location.pathname}#${encodeURIComponent(item.id)}`; try { await navigator.clipboard.writeText(url); copy.textContent = T().copied; } catch { copy.textContent = url; } });
    actions.append(copy);
    if (!d.open) d.showModal();
    document.body.classList.add('modal-open');
    if (!fromHash) history.replaceState(null, '', `#${encodeURIComponent(item.id)}`);
  }
  function closeItem() { const d = $('#item-dialog'); if (d.open) d.close(); }

  async function start() {
    state = 'loading'; render();
    try { items = await window.KharawaPreloved.load(); state = 'ready'; }
    catch { items = []; state = 'error'; }
    render();
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash && items.some((i) => i.id === hash)) openItem(hash, true);
  }

  $('#item-close').addEventListener('click', closeItem);
  $('#item-dialog').addEventListener('click', (e) => { if (e.target === $('#item-dialog')) closeItem(); });
  $('#item-dialog').addEventListener('close', () => { document.body.classList.remove('modal-open'); openId = null; if (location.hash) history.replaceState(null, '', location.pathname + location.search); });
  $('#f-category').addEventListener('change', (e) => { filters.category = e.target.value; render(); });
  $('#f-size').addEventListener('change', (e) => { filters.size = e.target.value; render(); });
  $('#f-sort').addEventListener('change', (e) => { filters.sort = e.target.value; render(); });
  window.addEventListener('hashchange', () => { const h = decodeURIComponent(location.hash.slice(1)); if (h && items.some((i) => i.id === h)) openItem(h, true); });
  document.querySelectorAll('.language-button').forEach((b) => b.addEventListener('click', () => {
    lang = b.dataset.language === 'en' ? 'en' : 'th';
    try { localStorage.setItem(LANGUAGE_KEY, lang); } catch { /* not persisted */ }
    applyStatic(); render(); if (openId && $('#item-dialog').open) openItem(openId, true);
  }));
  applyStatic();
  start();
})();
