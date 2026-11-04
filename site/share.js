// Share + auto caption + auto sales video for pre-loved items.
// Needs no external account: share links, caption text and the video are all built in the browser.
(function () {
  const SITE_URL = 'https://piddtr-debug.github.io/kharawa-website-materials'; // change if a custom domain is connected
  const LINE_ADD = 'https://line.me/R/ti/p/%40737yiaxp';
  const L = {
    th: {
      share: 'แชร์ / ทำโพสต์', title: 'แชร์สินค้ามือสอง', close: 'ปิด',
      links: 'แชร์ลิงก์', photos: 'รูปสำหรับอัปโหลด (Shopee / TikTok / YouTube)', photo: 'รูปที่', caption: 'แคปชั่นขาย (แก้ไขได้)', platform: 'แพลตฟอร์ม',
      copy: 'คัดลอกแคปชั่น', copied: 'คัดลอกแล้ว', copyLink: 'คัดลอกลิงก์', shareNative: 'แชร์ผ่านมือถือ',
      video: 'วิดีโอขาย', makeVideo: 'สร้างวิดีโอ', making: 'กำลังสร้าง…', download: 'ดาวน์โหลดวิดีโอ',
      videoNote: 'ทำจากรูปสินค้า ไม่ต้องใช้บัญชีใด ๆ',
      noVideo: 'เบราว์เซอร์นี้สร้างวิดีโอไม่ได้ ลองใช้ Chrome', noPhoto: 'สินค้าชิ้นนี้ยังไม่มีรูป สร้างวิดีโอไม่ได้',
      manual: 'ช่องนี้ยังโพสต์ให้อัตโนมัติไม่ได้ ให้คัดลอกแคปชั่นแล้วเปิดหน้าลงขายด้วยตัวเอง', open: 'เปิดหน้าลงขาย ↗',
      new: 'ใหม่ ป้ายยังอยู่', good: 'สภาพดี', used: 'สภาพผ่านการใช้งาน', size: 'ไซซ์', price: 'ราคา', ask: 'สอบถามราคา',
      cta: 'ทักสั่งได้ทาง LINE @737yiaxp',
      ai: 'ภาพแต่งหรือสร้างด้วย AI', aiWarn: '⚠️ ถ้าแต่งภาพด้วย AI ต้องติ๊กช่องนี้ทุกครั้ง แคปชั่นจะมีคำกำกับให้อัตโนมัติ', aiLabel: '🤖 ภาพนี้สร้าง/แต่งด้วย AI',
    },
    en: {
      share: 'Share / Post', title: 'Share this piece', close: 'Close',
      links: 'Share link', photos: 'Photos to upload (Shopee / TikTok / YouTube)', photo: 'Photo', caption: 'Sales caption (editable)', platform: 'Platform',
      copy: 'Copy caption', copied: 'Copied', copyLink: 'Copy link', shareNative: 'Share from phone',
      video: 'Sales video', makeVideo: 'Make video', making: 'Making…', download: 'Download video',
      videoNote: 'Built from the item photos, no account needed',
      noVideo: 'This browser cannot record video. Try Chrome.', noPhoto: 'No photo for this piece, so no video.',
      manual: 'This channel cannot be posted to automatically. Copy the caption and open the listing page yourself.', open: 'Open listing page ↗',
      new: 'Brand new with tags', good: 'Good condition', used: 'Pre-owned', size: 'Size', price: 'Price', ask: 'Ask for price',
      cta: 'Order on LINE @737yiaxp',
      ai: 'Photo made or edited with AI', aiWarn: '⚠️ Tick this every time a photo was edited with AI. The caption will carry a label.', aiLabel: '🤖 Image created/edited with AI',
    },
  };
  const PLATFORMS = {
    facebook: { label: 'Facebook', tags: true, emoji: true },
    line: { label: 'LINE', tags: false, emoji: true },
    youtube: { label: 'YouTube', tags: true, emoji: false, manual: 'https://studio.youtube.com/' },
    shopee: { label: 'Shopee', tags: false, emoji: false, manual: 'https://seller.shopee.co.th/portal/product/new' },
    lazada: { label: 'Lazada', tags: false, emoji: false, manual: 'https://sellercenter.lazada.co.th/' },
  };
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'th');
  const t = (k) => L[lang()][k];
  const itemUrl = (item) => `${SITE_URL}/preloved.html#${encodeURIComponent(item.id)}`;
  // Link to share outside the site: a per-item page with the photo in its og: tags, so Facebook / LINE show a preview card.
  // Demo items have no such page, so they fall back to the normal item link.
  const shareUrl = (item) => (/^demo-/.test(item.id) ? itemUrl(item) : `${SITE_URL}/s/${encodeURIComponent(item.id)}.html`);
  const priceText = (item) => (item.price ? `฿${Number(item.price).toLocaleString('en-US')}` : t('ask'));
  const photos = (item) => (item.images && item.images.length ? item.images : item.image ? [item.image] : []);

  function buildCaption(item, platform) {
    const p = PLATFORMS[platform];
    const brand = item.brand === 'KHARAWA' ? 'KHARAWA' : item.brand;
    const cond = t(item.condition) || '';
    const e = (s) => (p.emoji ? `${s} ` : '');
    const lines = [
      `${e('🔥')}${brand} ${item.name}`,
      `${e('📏')}${t('size')} ${item.size} · ${cond}`,
      `${e('💰')}${t('price')} ${priceText(item)}`,
      '',
      lang() === 'th' ? 'ทีมงานตรวจสภาพแล้ว มีชิ้นเดียว ใครมาก่อนได้ก่อน' : 'Checked by our team. One piece only, first come first served.',
      '',
      `${e('💬')}${t('cta')}`,
      `${e('🔗')}${shareUrl(item)}`,
    ];
    if (p.tags) lines.push('', [...new Set(['#KHARAWA', '#มือสอง', '#เสื้อผ้ามือสอง', `#${brand.replace(/\s+/g, '')}`])].join(' '));
    if (aiEdited) lines.unshift(t('aiLabel'), '');
    return lines.join('\n');
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = src; });
  }

  // Slideshow video: each photo zooms slowly with text, then a closing card. Recorded with MediaRecorder.
  async function makeVideo(item, onProgress) {
    const srcs = photos(item);
    if (!srcs.length) throw new Error('nophoto');
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error('unsupported');
    const imgs = await Promise.all(srcs.map(loadImage));
    const W = 720, H = 900, FPS = 30, PER = 3000, END = 2200;
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(FPS);
    const mime = ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 3_000_000 } : undefined);
    const chunks = []; rec.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
    const done = new Promise((res) => { rec.onstop = () => res(new Blob(chunks, { type: rec.mimeType || 'video/webm' })); });
    const total = imgs.length * PER + END;
    const font = (px, w = 700) => `${w} ${px}px "Noto Sans Thai", "Sarabun", system-ui, sans-serif`;
    function drawPhoto(img, p) {
      const scale = Math.max(W / img.width, H / img.height) * (1 + 0.08 * p);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      const g = ctx.createLinearGradient(0, H * 0.55, 0, H); g.addColorStop(0, 'rgba(17,16,14,0)'); g.addColorStop(1, 'rgba(17,16,14,.88)');
      ctx.fillStyle = g; ctx.fillRect(0, H * 0.55, W, H * 0.45);
    }
    function text(s, x, y, px, color, w) { ctx.font = font(px, w); ctx.fillStyle = color; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); }
    function frame(ms) {
      ctx.fillStyle = '#11100e'; ctx.fillRect(0, 0, W, H);
      const idx = Math.floor(ms / PER);
      if (idx < imgs.length) {
        const p = (ms % PER) / PER; ctx.globalAlpha = Math.min(1, (ms % PER) / 400); drawPhoto(imgs[idx], p); ctx.globalAlpha = 1;
        text((item.brand || '').toUpperCase(), 48, H - 190, 28, '#e8604f');
        text(item.name, 48, H - 140, 46, '#f2e7d3');
        text(`${t('size')} ${item.size} · ${t(item.condition) || ''}`, 48, H - 92, 28, 'rgba(242,231,211,.85)');
        text(priceText(item), 48, H - 44, 38, '#f2e7d3');
      } else {
        ctx.fillStyle = '#c9231c'; ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        text('KHARAWA', W / 2, H / 2 - 40, 80, '#f2e7d3', 800);
        text(t('cta'), W / 2, H / 2 + 30, 34, '#f2e7d3', 600);
        text(priceText(item), W / 2, H / 2 + 90, 40, '#f2e7d3', 700);
        ctx.textAlign = 'left';
      }
    }
    rec.start();
    const start = performance.now();
    await new Promise((resolve) => {
      (function tick() {
        const ms = performance.now() - start;
        frame(Math.min(ms, total - 1)); onProgress?.(Math.min(1, ms / total));
        if (ms >= total) resolve(); else requestAnimationFrame(tick);
      })();
    });
    rec.stop();
    const blob = await done;
    return { blob, ext: /mp4/.test(blob.type) ? 'mp4' : 'webm' };
  }

  let modal, current, platform = 'facebook', videoUrl, aiEdited = false;
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div'); modal.className = 'share-modal'; modal.hidden = true;
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'share-title');
    modal.innerHTML = `<div class="share-panel">
      <button type="button" class="share-close" data-x></button>
      <h3 id="share-title"></h3><p class="share-item"></p>
      <h4 data-h="links"></h4><div class="share-links"></div>
      <h4 data-h="photos"></h4><div class="share-photos"></div>
      <h4 data-h="caption"></h4><div class="share-tabs" role="group"></div>
      <label class="share-ai"><input type="checkbox" data-ai> <span data-ai-text></span></label>
      <p class="share-ai-warn"></p>
      <textarea class="share-caption" rows="9"></textarea>
      <div class="share-row"><button type="button" class="filter-chip" data-copy></button><a class="filter-chip" data-open target="_blank" rel="noopener noreferrer" hidden></a></div>
      <p class="share-manual" hidden></p>
      <h4 data-h="video"></h4><p class="share-note"></p>
      <div class="share-row"><button type="button" class="filter-chip" data-make></button><a class="filter-chip" data-dl hidden></a></div>
      <progress class="share-progress" max="1" value="0" hidden></progress><p class="share-msg" role="status"></p>
      <video class="share-video" controls playsinline hidden></video></div>`;
    document.body.append(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-x]')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
    modal.querySelector('[data-copy]').addEventListener('click', async (e) => {
      const ta = modal.querySelector('.share-caption');
      try { await navigator.clipboard.writeText(ta.value); } catch { ta.select(); document.execCommand('copy'); }
      e.target.textContent = t('copied'); setTimeout(() => (e.target.textContent = t('copy')), 1500);
    });
    modal.querySelector('[data-make]').addEventListener('click', onMake);
    modal.querySelector('[data-ai]').addEventListener('change', (e) => { aiEdited = e.target.checked; fill(); });
    return modal;
  }
  function close() { modal.hidden = true; document.body.classList.remove('share-open'); if (videoUrl) { URL.revokeObjectURL(videoUrl); videoUrl = null; } }

  function fill() {
    const m = modal, item = current;
    m.querySelector('.share-close').textContent = t('close');
    m.querySelector('#share-title').textContent = t('title');
    m.querySelector('.share-item').textContent = `${item.brand} ${item.name}`;
    m.querySelectorAll('[data-h]').forEach((h) => (h.textContent = t(h.dataset.h)));
    const url = encodeURIComponent(shareUrl(item));
    const links = m.querySelector('.share-links'); links.replaceChildren();
    [['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${url}`], ['LINE', `https://social-plugins.line.me/lineit/share?url=${url}`]].forEach(([n, href]) => {
      const a = document.createElement('a'); a.className = 'filter-chip'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.href = href; a.textContent = `${n} ↗`; links.append(a);
    });
    const copyLink = document.createElement('button'); copyLink.type = 'button'; copyLink.className = 'filter-chip'; copyLink.textContent = t('copyLink');
    copyLink.addEventListener('click', async () => { try { await navigator.clipboard.writeText(shareUrl(item)); copyLink.textContent = t('copied'); setTimeout(() => (copyLink.textContent = t('copyLink')), 1500); } catch {} });
    links.append(copyLink);
    if (navigator.share) {
      const n = document.createElement('button'); n.type = 'button'; n.className = 'filter-chip'; n.textContent = t('shareNative');
      n.addEventListener('click', () => navigator.share({ title: `${item.brand} ${item.name}`, text: m.querySelector('.share-caption').value, url: shareUrl(item) }).catch(() => {}));
      links.append(n);
    }
    const pw = m.querySelector('.share-photos'); pw.replaceChildren();
    photos(item).forEach((src, i) => {
      const a = document.createElement('a'); a.className = 'filter-chip'; a.href = src; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.download = `${item.id}-${i + 1}`; a.textContent = `${t('photo')} ${i + 1} ↗`; pw.append(a);
    });
    const tabs = m.querySelector('.share-tabs'); tabs.replaceChildren();
    Object.entries(PLATFORMS).forEach(([key, p]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'filter-chip'; b.textContent = p.label; b.setAttribute('aria-pressed', String(key === platform));
      b.addEventListener('click', () => { platform = key; fill(); }); tabs.append(b);
    });
    m.querySelector('[data-ai]').checked = aiEdited;
    m.querySelector('[data-ai-text]').textContent = t('ai');
    m.querySelector('.share-ai-warn').textContent = t('aiWarn');
    m.querySelector('.share-caption').value = buildCaption(item, platform);
    m.querySelector('[data-copy]').textContent = t('copy');
    const p = PLATFORMS[platform], open = m.querySelector('[data-open]'), manual = m.querySelector('.share-manual');
    open.hidden = manual.hidden = !p.manual;
    if (p.manual) { open.href = p.manual; open.textContent = t('open'); manual.textContent = t('manual'); }
    m.querySelector('.share-note').textContent = t('videoNote');
    m.querySelector('[data-make]').textContent = t('makeVideo');
    m.querySelector('[data-dl]').textContent = t('download');
  }

  async function onMake(e) {
    const btn = e.target, m = modal, msg = m.querySelector('.share-msg'), bar = m.querySelector('.share-progress'), vid = m.querySelector('.share-video'), dl = m.querySelector('[data-dl]');
    msg.textContent = ''; btn.disabled = true; btn.textContent = t('making'); bar.hidden = false; bar.value = 0;
    try {
      const { blob, ext } = await makeVideo(current, (p) => (bar.value = p));
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      videoUrl = URL.createObjectURL(blob);
      vid.src = videoUrl; vid.hidden = false;
      dl.href = videoUrl; dl.download = `${current.id}.${ext}`; dl.hidden = false;
    } catch (err) { msg.textContent = err.message === 'nophoto' ? t('noPhoto') : t('noVideo'); }
    bar.hidden = true; btn.disabled = false; btn.textContent = t('makeVideo');
  }

  window.KharawaShare = {
    label: () => t('share'),
    open(item) {
      current = item; platform = 'facebook'; aiEdited = !!item.aiEdited; ensureModal(); fill();
      modal.querySelector('.share-video').hidden = true; modal.querySelector('[data-dl]').hidden = true; modal.querySelector('.share-msg').textContent = '';
      modal.hidden = false; document.body.classList.add('share-open'); modal.querySelector('[data-x]').focus();
    },
  };
})();
