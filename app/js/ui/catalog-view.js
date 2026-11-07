/*
 * app/js/ui/catalog-view.js
 * Camada de interface: cards, busca, filtros, modal e paginação.
 * Recebe produtos já prontos e não sabe de onde eles vieram.
 */
(function () {
  'use strict';

  const NTS = window.NTS || (window.NTS = {});
  const config = NTS.config || {};

  const state = {
    query: '',
    filter: 'all',
    visible: config.pageSize || 12,
    current: -1,
    trigger: null,
    products: []
  };

  let el = {};

  const byId = (id) => document.getElementById(id);

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  };

  const appendIf = (parent, child) => {
    if (child) parent.appendChild(child);
  };

  const words = () => NTS.Product.normalize(state.query).split(/\s+/).filter(Boolean);

  const filtered = () => {
    const queryWords = words();
    return state.products.filter((product) => {
      if (state.filter === 'featured' && !product.destaque) return false;
      if (queryWords.length === 0) return true;
      return queryWords.every((word) => product.search.includes(word));
    });
  };

  const hasFeatured = () => state.products.some((product) => product.destaque);

  const image = (product, className) => {
    const img = node('img', className);
    img.src = product.imagem;
    img.alt = product.alt;
    img.width = 900;
    img.height = 1200;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      if (img.dataset.fallback === 'true') return;
      img.dataset.fallback = 'true';
      img.src = config.fallbackImage;
      img.alt = '';
      img.classList.add('is-fallback');
    });
    return img;
  };

  const spec = (label, value) => {
    if (!value) return null;
    const row = node('span', 'card__spec');
    row.append(node('span', 'card__label', label));
    row.append(node('span', 'card__value', value));
    return row;
  };

  const card = (product) => {
    const item = node('li', 'card');
    const button = node('button', 'card__btn');
    button.type = 'button';
    button.dataset.id = product.id;
    button.setAttribute('aria-label', 'Ver detalhes de ' + product.nome);

    const media = node('span', 'card__media');
    media.appendChild(image(product, 'card__img'));
    if (product.destaque) {
      media.appendChild(node('span', 'card__badge', product.destaque));
    }

    const body = node('span', 'card__body');
    body.appendChild(node('span', 'card__name', product.nome));
    appendIf(body, spec('Cor', product.cor));
    appendIf(
      body,
      spec('Tamanhos', product.tamanhos.length ? product.tamanhos.join(', ') : '')
    );
    body.appendChild(node('span', 'card__price', product.precoTexto));
    body.appendChild(node('span', 'card__cta', 'Ver detalhes →'));

    button.append(media, body);
    item.appendChild(button);
    return item;
  };

  const render = () => {
    const list = filtered();
    const shown = Math.min(state.visible, list.length);

    el.grid.replaceChildren(...list.slice(0, shown).map(card));

    if (state.products.length === 0) {
      el.count.textContent = 'Catálogo indisponível';
    } else if (list.length === 0) {
      el.count.textContent = 'Nenhuma peça';
    } else {
      el.count.textContent =
        shown + ' de ' + list.length + (list.length === 1 ? ' peça' : ' peças');
    }

    el.loadMore.hidden = shown >= list.length || list.length === 0;
    el.error.hidden = state.products.length !== 0;

    const isEmpty = list.length === 0 && state.products.length > 0;
    el.empty.hidden = !isEmpty;
    if (isEmpty) {
      el.emptyText.textContent = state.query
        ? 'Não encontramos nada para “' + state.query + '”. Tente outra marca, modelo, cor ou tamanho.'
        : 'Ainda não há peças cadastradas. Fale com a loja pelo WhatsApp.';
    }

    const featuredChip = el.filters.querySelector('[data-filter="featured"]');
    if (featuredChip) featuredChip.hidden = !hasFeatured();
  };

  const fillModal = (index) => {
    const list = filtered();
    const product = list[index];
    if (!product) return;

    state.current = index;

    el.modalImg.src = product.imagem;
    el.modalImg.alt = product.alt;
    el.modalImg.dataset.fallback = '';
    el.modalImg.classList.remove('is-fallback');

    el.modalTitle.textContent = product.nome;
    el.modalPrice.textContent = product.precoTexto;

    el.modalSpecs.replaceChildren();
    [
      ['Marca', product.marca],
      ['Modelo', product.modelo],
      ['Cor', product.cor]
    ].forEach(([label, value]) => {
      if (!value) return;
      const row = node('div', 'modal__spec');
      row.append(node('dt', '', label));
      row.append(node('dd', '', value));
      el.modalSpecs.appendChild(row);
    });

    el.modalDesc.textContent =
      product.descricao ||
      'Consulte disponibilidade e condições de envio pelo WhatsApp.';

    el.modalSizes.replaceChildren(
      ...product.tamanhos.map((size) => node('li', '', size))
    );
    el.modalSizes.hidden = product.tamanhos.length === 0;
    el.modalSizesLabel.textContent = product.tamanhos.length
      ? 'Tamanhos disponíveis'
      : 'Consulte a numeração disponível para este modelo.';

    el.modalCounter.textContent = index + 1 + ' de ' + list.length;

    const message =
      'Oi! Tenho interesse no ' +
      product.nome +
      (product.cor ? ' na cor ' + product.cor : '') +
      '. Tem disponível?';
    el.modalWhatsApp.href =
      'https://wa.me/' + config.whatsapp + '?text=' + encodeURIComponent(message);
  };

  const openModal = (id, trigger) => {
    if (el.modal.open) return;
    const list = filtered();
    const index = list.findIndex((product) => product.id === id);
    if (index < 0) return;

    state.trigger = trigger || null;
    fillModal(index);

    if (typeof el.modal.showModal === 'function') {
      el.modal.showModal();
    } else {
      el.modal.setAttribute('open', '');
    }
    document.body.classList.add('is-locked');
    el.modalClose.focus();
  };

  const cleanup = () => {
    document.body.classList.remove('is-locked');
    const target =
      state.trigger && document.body.contains(state.trigger)
        ? state.trigger
        : el.search;
    if (target) target.focus();
    state.trigger = null;
  };

  const closeModal = () => {
    if (typeof el.modal.close === 'function' && el.modal.open) {
      el.modal.close();
      return;
    }
    el.modal.removeAttribute('open');
    cleanup();
  };

  const step = (direction) => {
    const list = filtered();
    if (list.length === 0) return;
    const next = (state.current + direction + list.length) % list.length;
    fillModal(next);
  };

  const bind = () => {
    el.search.addEventListener('input', () => {
      state.query = el.search.value;
      state.visible = config.pageSize;
      render();
    });

    el.filters.addEventListener('click', (event) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;

      state.filter = chip.dataset.filter === 'featured' ? 'featured' : 'all';
      state.visible = config.pageSize;

      el.filters.querySelectorAll('.chip').forEach((button) => {
        const active = button === chip;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      render();
    });

    el.grid.addEventListener('click', (event) => {
      const button = event.target.closest('.card__btn');
      if (!button) return;
      openModal(button.dataset.id, button);
    });

    el.loadMore.addEventListener('click', () => {
      const before = Math.min(state.visible, filtered().length);
      state.visible += config.pageSize;
      render();
      const buttons = el.grid.querySelectorAll('.card__btn');
      if (buttons[before]) buttons[before].focus();
    });

    el.emptyClear.addEventListener('click', () => {
      state.query = '';
      state.filter = 'all';
      state.visible = config.pageSize;
      el.search.value = '';

      el.filters.querySelectorAll('.chip').forEach((button) => {
        const active = button.dataset.filter === 'all';
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      render();
      el.search.focus();
    });

    el.modalClose.addEventListener('click', closeModal);
    el.modalPrev.addEventListener('click', () => step(-1));
    el.modalNext.addEventListener('click', () => step(1));
    el.modal.addEventListener('close', cleanup);
    el.modal.addEventListener('click', (event) => {
      if (event.target === el.modal) closeModal();
    });

    el.modalImg.addEventListener('error', () => {
      if (el.modalImg.dataset.fallback === 'true') return;
      el.modalImg.dataset.fallback = 'true';
      el.modalImg.src = config.fallbackImage;
      el.modalImg.alt = '';
      el.modalImg.classList.add('is-fallback');
    });

    document.addEventListener('keydown', (event) => {
      if (!el.modal.open) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      }
    });
  };

  const init = (products) => {
    state.products = Array.isArray(products) ? products : [];

    el = {
      search: byId('search'),
      filters: byId('filters'),
      grid: byId('grid'),
      count: byId('count'),
      loadMore: byId('loadMore'),
      empty: byId('empty'),
      emptyText: byId('emptyText'),
      emptyClear: byId('emptyClear'),
      error: byId('catalogError'),
      modal: byId('productModal'),
      modalImg: byId('modalImg'),
      modalTitle: byId('modalTitle'),
      modalPrice: byId('modalPrice'),
      modalSpecs: byId('modalSpecs'),
      modalDesc: byId('modalDesc'),
      modalSizes: byId('modalSizes'),
      modalSizesLabel: byId('modalSizesLabel'),
      modalCounter: byId('modalCounter'),
      modalWhatsApp: byId('modalWhatsApp'),
      modalClose: byId('modalClose'),
      modalPrev: byId('modalPrev'),
      modalNext: byId('modalNext')
    };

    const missing = Object.keys(el).filter((key) => !el[key]);
    if (missing.length > 0) {
      console.error('Elementos ausentes no HTML:', missing.join(', '));
      return;
    }

    bind();
    render();
  };

  NTS.view = { init };
})();
