const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');

// Float the header over the hero artwork; turn it into a solid bar once the hero has scrolled away.
if (header && hero) {
  const setOverlay = (on) => header.classList.toggle('is-overlay', on);
  setOverlay(window.scrollY < hero.offsetHeight - header.offsetHeight);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => setOverlay(entry.isIntersecting), {
      rootMargin: `-${header.offsetHeight}px 0px 0px 0px`,
    }).observe(hero);
  }
}

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  mobileNav.hidden = isOpen;
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.hidden = true;
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});
