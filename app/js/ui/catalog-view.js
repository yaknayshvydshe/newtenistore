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
    size: '',
    selectedSize: '',
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

  const filtered = () =>
    state.products.filter((product) => {
      if (state.size && !product.tamanhos.includes(state.size)) return false;
      return NTS.Product.matchesSearch(product.search, state.query);
    });

  const hasActiveFilters = () =>
    Boolean(state.query.trim()) || Boolean(state.size);

  const registeredSizes = () =>
    Array.from(new Set(state.products.flatMap((product) => product.tamanhos))).sort(
      (a, b) => Number(a) - Number(b) || a.localeCompare(b)
    );

  const image = (product, className, eager, highPriority) => {
    const img = node('img', className);
    img.src = product.imagem;
    img.alt = product.alt;
    img.width = 900;
    img.height = 1200;
    img.loading = eager ? 'eager' : 'lazy';
    img.decoding = 'async';
    if (highPriority) img.setAttribute('fetchpriority', 'high');
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

  const card = (product, index) => {
    const item = node('li', 'card');
    const button = node('button', 'card__btn');
    button.type = 'button';
    button.dataset.id = product.id;
    button.setAttribute('aria-label', 'Ver detalhes de ' + product.nome);

    const media = node('span', 'card__media');
    media.appendChild(image(product, 'card__img', index < 4, index === 0));
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
    body.appendChild(
      node(
        'span',
        'card__price',
        product.parcelamento ? product.parcelamento.label : product.precoTexto
      )
    );
    if (product.parcelamento) {
      body.appendChild(node('span', 'card__price-note', product.parcelamento.note));
    }
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
      el.emptyText.textContent = state.query.trim()
        ? 'Não encontramos nada para “' + state.query + '”. Tente outra marca, modelo, cor ou tamanho.'
        : 'Nenhuma peça corresponde aos filtros selecionados. Limpe os filtros para ver o catálogo completo.';
    }

    el.clearFilters.hidden = !hasActiveFilters();
  };

  const resetFilters = () => {
    state.query = '';
    state.size = '';
    state.selectedSize = '';
    state.visible = config.pageSize;
    el.search.value = '';
    el.sizeFilter.value = '';
    render();
    el.search.focus();
  };

  const fillSizeFilter = () => {
    const sizes = registeredSizes();
    const all = node('option', '', 'Todos os tamanhos');
    all.value = '';
    el.sizeFilter.replaceChildren(
      all,
      ...sizes.map((size) => {
        const option = node('option', '', size);
        option.value = size;
        return option;
      })
    );
    el.sizeFilter.value = state.size;
    el.sizeFilterField.hidden = sizes.length === 0;
  };

  const updateWhatsApp = (product) => {
    const installment = product.parcelamento
      ? ' Vi que sai em ' +
        product.parcelamento.label +
        ' (total ' + product.parcelamento.totalTexto + ').'
      : '';
    const message =
      'Oi! Tenho interesse no produto ' +
      product.nome +
      (product.cor ? ' na cor ' + product.cor : '') +
      (state.selectedSize ? ', tamanho ' + state.selectedSize : '') +
      '.' +
      installment +
      ' Pode confirmar a disponibilidade?';
    el.modalWhatsApp.href =
      'https://wa.me/' + config.whatsapp + '?text=' + encodeURIComponent(message);
  };

  const renderSizes = (product) => {
    state.selectedSize = '';
    el.modalSizes.replaceChildren();

    const hasSizes = product.tamanhos.length > 0;
    el.modalSizes.hidden = !hasSizes;
    el.modalSizesLabel.textContent = hasSizes
      ? 'Escolha um tamanho (opcional)'
      : 'Consulte a numeração disponível para este modelo.';
    el.modalSizeHint.textContent = hasSizes
      ? 'Nenhum tamanho selecionado. A mensagem será enviada sem tamanho.'
      : 'A mensagem será enviada sem tamanho.';

    if (!hasSizes) return;

    el.modalSizes.replaceChildren(
      ...product.tamanhos.map((size, index) => {
        const item = node('li', 'modal__size-option');
        item.setAttribute('role', 'none');

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'modalSize';
        input.id = 'modalSizeOption-' + index;
        input.value = size;
        input.className = 'sr-only modal__size-input';
        input.setAttribute('aria-label', 'Tamanho ' + size);
        input.addEventListener('change', () => {
          state.selectedSize = size;
          updateWhatsApp(product);
          el.modalSizeHint.textContent = 'Tamanho ' + size + ' selecionado.';
        });

        const label = node('label', 'modal__size-label', size);
        label.htmlFor = input.id;

        item.append(input, label);
        return item;
      })
    );
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
    el.modalPrice.textContent = product.parcelamento
      ? product.parcelamento.label
      : product.precoTexto;
    el.modalPriceNote.textContent = product.parcelamento ? product.parcelamento.note : '';
    el.modalPriceNote.hidden = !product.parcelamento;

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

    renderSizes(product);
    updateWhatsApp(product);

    el.modalCounter.textContent = index + 1 + ' de ' + list.length;
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
    const isOpen = el.modal.open || el.modal.hasAttribute('open');
    if (!isOpen) return;
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

  const modalFocusables = () =>
    Array.from(
      el.modal.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hidden && element.getClientRects().length > 0);

  const bind = () => {
    el.search.addEventListener('input', () => {
      state.query = el.search.value;
      state.visible = config.pageSize;
      render();
    });

    el.sizeFilter.addEventListener('change', () => {
      state.size = el.sizeFilter.value;
      state.visible = config.pageSize;
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

    el.clearFilters.addEventListener('click', resetFilters);
    el.emptyClear.addEventListener('click', resetFilters);

    el.modalClose.addEventListener('click', closeModal);
    el.modalPrev.addEventListener('click', () => step(-1));
    el.modalNext.addEventListener('click', () => step(1));
    el.modal.addEventListener('close', cleanup);
    el.modal.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeModal();
    });
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

      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key === 'Tab') {
        const items = modalFocusables();
        if (items.length === 0) return;

        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;

        if (event.shiftKey) {
          if (active === first || !el.modal.contains(active)) {
            event.preventDefault();
            last.focus();
          }
        } else if (active === last || !el.modal.contains(active)) {
          event.preventDefault();
          first.focus();
        }
        return;
      }

      const target = event.target;
      if (target instanceof Element && target.closest('#modalSizes')) return;

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
      sizeFilter: byId('sizeFilter'),
      sizeFilterField: byId('sizeFilterField'),
      clearFilters: byId('clearFilters'),
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
      modalPriceNote: byId('modalPriceNote'),
      modalSpecs: byId('modalSpecs'),
      modalDesc: byId('modalDesc'),
      modalSizes: byId('modalSizes'),
      modalSizesLabel: byId('modalSizesLabel'),
      modalSizeHint: byId('modalSizeHint'),
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
    fillSizeFilter();
    render();
  };

  NTS.view = { init };
})();
