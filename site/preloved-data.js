// Loads approved pre-loved items from the Google Sheet (through the Apps Script web app in config.js).
// Used by the home-page teaser and by preloved.html.
(function () {
  const raw = typeof window.KHARAWA_CONSIGN_ENDPOINT === 'string' ? window.KHARAWA_CONSIGN_ENDPOINT.trim() : '';
  const ENDPOINT = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(raw) ? raw : '';
  const DEMO = [
    { id: 'demo-1', brand: 'KHARAWA', name: 'First Press Tee', category: 'tee', size: 'L', condition: 'good', price: 590, status: 'available', image: './assets/products/first-press-tee.webp', images: ['./assets/products/first-press-tee.webp', './assets/products/small-signal-tee.webp'], details: 'Sample item for preview only.' },
    { id: 'demo-2', brand: 'Carhartt', name: 'Pocket Tee', category: 'tee', size: 'M', condition: 'new', price: null, status: 'available', image: './assets/products/small-signal-tee.webp', images: ['./assets/products/small-signal-tee.webp'], details: '' },
    { id: 'demo-3', brand: 'Uniqlo', name: 'Linen Shirt', category: 'shirt', size: 'L', condition: 'good', price: 350, status: 'sold', image: '', images: [], details: '' },
  ];
  const wantsDemo = () => window.KHARAWA_DEMO || new URLSearchParams(location.search).get('demo') === 'preloved';
  function normalise(row) {
    const photos = Array.isArray(row.photos) ? row.photos.filter((u) => /^https:\/\/lh3\.googleusercontent\.com\//.test(u)) : [];
    return {
      id: String(row.id), brand: String(row.brand || 'KHARAWA'), name: String(row.name || ''), category: String(row.categoryCode || 'other'), categoryLabel: String(row.category || ''),
      size: String(row.size || ''), condition: ['new', 'good', 'used'].includes(row.condition) ? row.condition : 'good', price: Number(row.price) > 0 ? Number(row.price) : null,
      status: ['available', 'reserved', 'sold'].includes(row.status) ? row.status : 'available', image: photos[0] || '', images: photos, details: String(row.details || ''),
    };
  }
  async function load() {
    if (wantsDemo()) return DEMO;
    if (!ENDPOINT) return [];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${ENDPOINT}?action=list`, { signal: controller.signal, cache: 'no-store' });
      const data = await res.json();
      if (!data || data.ok !== true || !Array.isArray(data.items)) throw new Error('bad response');
      return data.items.map(normalise).filter((item) => item.id && item.name);
    } finally { clearTimeout(timer); }
  }
  window.KharawaPreloved = { load, enabled: Boolean(ENDPOINT) || Boolean(wantsDemo()), demo: DEMO };
})();
