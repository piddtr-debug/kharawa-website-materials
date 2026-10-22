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
  'first-press-tee': { name: 'FIRST PRESS TEE', sku: 'KH / FS-01', status: 'PRE-LAUNCH / 01', description: 'เสื้อยืดโอเวอร์ไซซ์ งานพิมพ์ด้านหน้าและกราฟิกมือประกบด้านหลัง', specs: ['240 GSM cotton concept', 'Vintage black / S–XL'], art: 'product-image-1' },
  'small-signal-tee': { name: 'SMALL SIGNAL TEE', sku: 'KH / FS-02', status: 'PRE-LAUNCH / 02', description: 'สัญญาณเล็กบนอกเสื้อ ในสามสีหลักของแบรนด์', specs: ['230 GSM cotton concept', 'Off-white / Black / White'], art: 'product-image-2' },
  'rising-press-tee': { name: 'RISING PRESS TEE', sku: 'KH / FS-03', status: 'PRE-LAUNCH / 03', description: 'เสื้อกราฟิกขนาดใหญ่สำหรับ Collection 01 พร้อมคำว่า Made in the Press', specs: ['240 GSM cotton concept', 'Vintage black / S–XL'], art: 'product-image-3' },
  'press-typo-tee': { name: 'PRESS TYPO TEE', sku: 'KH / FS-04', status: 'PRE-LAUNCH / 04', description: 'เสื้อกราฟิกตัวอักษร KHARAWA และ Made in the Press', specs: ['230 GSM cotton concept', 'Black / White / S–XL'], art: 'product-image-4' },
  'press-cap-01': { name: 'PRESS CAP 01', sku: 'KH / CAP-01', status: 'PRE-LAUNCH / 05', description: 'หมวก five-panel สีดำ พร้อมงานปัก KHARAWA ด้ายแดง', specs: ['Structured five-panel', 'One size / Black'], art: 'product-image-5' },
};

const STORAGE_KEY = 'kharawa-cart-v1';
let cart = loadCart();
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => PRODUCTS[item.id] && item.quantity > 0) : [];
  } catch { return []; }
}
function saveCart() {
  // Storage can be blocked (private windows, strict cookie settings): keep the cart working for this visit anyway.
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* cart stays in memory */ }
}
function totalItems() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
function product(id) { return PRODUCTS[id]; }

function renderCart() {
  const container = $('.cart-items');
  const count = $('.cart-count');
  count.textContent = String(totalItems());
  if (!cart.length) {
    container.innerHTML = '<p class="empty-cart">ยังไม่มีสินค้าในตะกร้า</p>';
    $('.cart-total-value').textContent = 'PRICE TBC';
    return;
  }
  container.innerHTML = cart.map((item) => {
    const p = product(item.id);
    return `<div class="cart-item">
      <div class="cart-item-art product-image ${p.art}"></div>
      <div><h3>${p.name}</h3><p>${p.sku} · PRICE TBC</p>
        <div class="cart-quantity"><button type="button" data-decrease="${item.id}" aria-label="ลดจำนวน">−</button><span>${item.quantity}</span><button type="button" data-increase="${item.id}" aria-label="เพิ่มจำนวน">+</button></div>
      </div>
      <button class="cart-remove" type="button" data-remove="${item.id}">REMOVE</button>
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
  $('.modal-title').textContent = p.name;
  $('.modal-description').textContent = p.description;
  $('.modal-specs').innerHTML = p.specs.map((spec) => `<li>${spec}</li>`).join('');
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

renderCart();
