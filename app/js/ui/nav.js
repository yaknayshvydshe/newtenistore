/*
 * app/js/ui/nav.js
 * Menu principal no mobile: abre e fecha a navegação pelo botão hambúrguer.
 */
(function () {
  'use strict';

  const header = document.querySelector('.site-header');
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('primaryNav');
  if (!header || !toggle || !nav) return;

  const syncScrolled = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  syncScrolled();
  window.addEventListener('scroll', syncScrolled, { passive: true });

  const isOpen = () => header.classList.contains('is-menu-open');

  const setOpen = (open) => {
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  const desktop = window.matchMedia('(min-width: 900px)');
  const closeOnDesktop = (event) => {
    if (event.matches) setOpen(false);
  };
  if (typeof desktop.addEventListener === 'function') {
    desktop.addEventListener('change', closeOnDesktop);
  } else if (typeof desktop.addListener === 'function') {
    desktop.addListener(closeOnDesktop);
  }
})();
