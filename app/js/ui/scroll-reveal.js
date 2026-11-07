/*
 * app/js/ui/scroll-reveal.js
 * Revela blocos e cards suavemente quando entram na tela.
 * Respeita "prefers-reduced-motion" e não esconde nada se o JS falhar.
 */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches || typeof IntersectionObserver !== 'function') return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  );

  const reveal = (element, delay) => {
    if (!element || element.dataset.revealReady === 'true') return;
    element.dataset.revealReady = 'true';
    if (delay) element.style.transitionDelay = delay + 'ms';
    element.classList.add('reveal');
    observer.observe(element);
  };

  const isOnScreen = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };

  document.querySelectorAll('[data-reveal]').forEach((element) => reveal(element));

  const grid = document.getElementById('grid');
  if (grid) {
    const watch = (card) => {
      if (isOnScreen(card)) return;
      reveal(card);
    };

    Array.from(grid.children).forEach(watch);

    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList.contains('card')) watch(node);
        });
      });
    });

    mutations.observe(grid, { childList: true });
  }

  const stopMotion = (event) => {
    if (!event.matches) return;
    document.querySelectorAll('.reveal').forEach((element) => {
      element.classList.add('is-visible');
      observer.unobserve(element);
    });
  };

  if (typeof reduce.addEventListener === 'function') {
    reduce.addEventListener('change', stopMotion);
  } else if (typeof reduce.addListener === 'function') {
    reduce.addListener(stopMotion);
  }
})();
