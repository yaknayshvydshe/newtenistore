/* New Tenis Store — catálogo em JavaScript puro (sem frameworks).
   Depende de data.js (variável PRODUCTS), carregado antes deste arquivo. */
(() => {
  "use strict";

  const WHATSAPP_NUMBER = "5545998048535";
  const PAGE_SIZE = 8;
  const ALL = "Todos";
  const FALLBACK_IMAGE =
    "https://raw.githubusercontent.com/yaknayshvydshe/newtenistore/1b7225200b58c3fbf9156d525021e02c9473f044/app/img/files/logo.png";

  const products = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  if (products.length === 0) {
    console.error("Nenhum produto encontrado. Verifique o arquivo js/data.js.");
    return;
  }

  const els = {
    filters: document.getElementById("filters"),
    grid: document.getElementById("grid"),
    count: document.getElementById("count"),
    loadMore: document.getElementById("loadMore"),
    modal: document.getElementById("productModal"),
    modalImg: document.getElementById("modalImg"),
    modalTitle: document.getElementById("modalTitle"),
    modalPrice: document.getElementById("modalPrice"),
    modalMeta: document.getElementById("modalMeta"),
    modalDesc: document.getElementById("modalDesc"),
    modalCounter: document.getElementById("modalCounter"),
    modalWhatsApp: document.getElementById("modalWhatsApp"),
    modalTag: document.getElementById("modalTag"),
    modalClose: document.getElementById("modalClose"),
    modalPrev: document.getElementById("modalPrev"),
    modalNext: document.getElementById("modalNext"),
  };

  if (!els.filters || !els.grid || !els.count || !els.loadMore || !els.modal) {
    console.error("Estrutura HTML incompleta. Verifique os IDs do index.html.");
    return;
  }

  const state = {
    category: ALL,
    color: "Todas",
    size: "Todos",
    visible: PAGE_SIZE,
    current: 0,
    trigger: null,
    showTag: false,
  };

  const priceFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const formatPrice = (value) =>
    typeof value === "number" && Number.isFinite(value)
      ? priceFormatter.format(value)
      : "Sob consulta";

  const escapeHtml = (value) =>
    String(value == null ? "" : value).replace(/[&<>"']/g, (char) => {
      switch (char) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        case '"': return "&quot;";
        case "'": return "&#39;";
        default: return char;
      }
    });

  const getFiltered = () =>
    products.filter((product) => {
      const matchCategory =
        state.category === ALL || product.categoria === state.category;
      const matchColor =
        state.color === "Todas" || product.cor === state.color;
      const matchSize =
        state.size === "Todos" || (product.tamanho || []).includes(state.size);
      return matchCategory && matchColor && matchSize;
    });

  const unique = (values) =>
    Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );

  const buildWhatsAppLink = (product) => {
    const price =
      typeof product.preco === "number"
        ? ` (R$ ${formatPrice(product.preco)})`
        : "";
    const message = `Oi! Tudo bem? Estou interessado(a) no ${product.nome}${price}. Ele está disponível? Qual o tamanho?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const renderFilters = () => {
    const categories = [ALL, ...unique(products.map((p) => p.categoria))];
    const colors = ["Todas", ...unique(products.map((p) => p.cor))];
    const sizes = [
      "Todos",
      ...unique(products.flatMap((p) => p.tamanho || [])),
    ];

    const groups = [
      { type: "category", label: "Categorias", options: categories, current: state.category },
      { type: "color", label: "Cores", options: colors, current: state.color },
      { type: "size", label: "Tamanhos", options: sizes, current: state.size },
    ];

    els.filters.innerHTML = groups
      .map((group) => {
        const buttons = group.options
          .map((option) => {
            const active = option === group.current;
            return `<button class="chip${active ? " is-active" : ""}" type="button"
                      data-filter-type="${group.type}"
                      data-filter-value="${escapeHtml(option)}"
                      aria-pressed="${active}">${escapeHtml(option)}</button>`;
          })
          .join("");

        return `<div class="filter-group">
                  <p class="filter-group__label">${group.label}</p>
                  <div class="filter-group__options">${buttons}</div>
                </div>`;
      })
      .join("");
  };

  const cardTemplate = (product, index) => {
    const price = formatPrice(product.preco);
    const sizes = (product.tamanho || []).join(", ");
    const name = product.nome || "Produto";
    const id = product.id != null ? product.id : index;
    const badge = product.destaque
      ? `<span class="product-card__badge">${escapeHtml(product.destaque)}</span>`
      : "";

    return `<li class="product-card">
      <button class="product-card__btn" type="button"
              data-index="${index}" data-id="${escapeHtml(id)}"
              aria-label="Ver detalhes de ${escapeHtml(name)}">
        <span class="product-card__media">
          <img class="product-card__img"
               src="${escapeHtml(product.src)}"
               alt="${escapeHtml(product.alt || name)}"
               width="600" height="600" loading="lazy" decoding="async">
          ${badge}
        </span>
        <span class="product-card__body">
          <span class="product-card__name">${escapeHtml(name)}</span>
          <span class="product-card__meta">${escapeHtml(product.cor)} · ${escapeHtml(product.estilo)}</span>
          <span class="product-card__price">${price}</span>
          <span class="product-card__sizes">Tamanhos: ${escapeHtml(sizes)}</span>
          <span class="product-card__cta">Ver detalhes</span>
        </span>
      </button>
    </li>`;
  };

  const attachImageFallbacks = () => {
    els.grid.querySelectorAll("img").forEach((image) => {
      image.addEventListener(
        "error",
        () => {
          if (image.dataset.fallbackApplied === "true") return;
          image.dataset.fallbackApplied = "true";
          image.classList.add("is-fallback");
          image.src = FALLBACK_IMAGE;
        },
        { once: true }
      );
    });
  };

  const appendCards = (from) => {
    const list = getFiltered();
    const to = Math.min(state.visible, list.length);
    const html = list
      .slice(from, to)
      .map((product, offset) => cardTemplate(product, from + offset))
      .join("");
    els.grid.insertAdjacentHTML("beforeend", html);
    attachImageFallbacks();
  };

  const updateMeta = () => {
    const total = getFiltered().length;
    const shown = Math.min(state.visible, total);
    els.count.textContent = `${shown} de ${total} produtos`;
    els.loadMore.hidden = shown >= total;
  };

  const renderGrid = () => {
    els.grid.innerHTML = "";
    appendCards(0);
    updateMeta();
  };

  const fillModal = () => {
    const list = getFiltered();
    const product = list[state.current];
    if (!product) return;

    state.showTag = false;
    els.modalImg.src = product.src;
    els.modalImg.alt = product.alt || product.nome || "Produto";
    els.modalImg.classList.remove("is-fallback");
    els.modalTitle.textContent = product.nome || "Produto";
    els.modalPrice.textContent = formatPrice(product.preco);
    els.modalMeta.textContent = `${product.cor || ""} · ${product.estilo || ""} · ${product.genero || ""} · ${product.marca || ""}`;
    els.modalDesc.textContent = product.descricao || "";
    els.modalCounter.textContent = `${state.current + 1} de ${list.length}`;
    els.modalWhatsApp.href = buildWhatsAppLink(product);
    els.modalWhatsApp.dataset.id = String(
      product.id != null ? product.id : state.current
    );
    els.modalTag.dataset.etiqueta = product.etiqueta || product.src;
    els.modalTag.dataset.src = product.src;
    els.modalTag.textContent = "Ver etiqueta";
    els.modalTag.setAttribute("aria-pressed", "false");
  };

  const openModal = (index, trigger) => {
    state.current = index;
    state.trigger = trigger || null;
    fillModal();

    if (typeof els.modal.showModal === "function") {
      els.modal.showModal();
    } else {
      els.modal.setAttribute("open", "");
    }
    document.body.classList.add("is-modal-open");
  };

  const closeModal = () => {
    if (typeof els.modal.close === "function") {
      els.modal.close();
      return;
    }
    els.modal.removeAttribute("open");
    document.body.classList.remove("is-modal-open");
    if (state.trigger && document.body.contains(state.trigger)) {
      state.trigger.focus();
    }
    state.trigger = null;
  };

  const step = (direction) => {
    const total = getFiltered().length;
    if (total === 0) return;
    state.current = (state.current + direction + total) % total;
    fillModal();
  };

  els.filters.addEventListener("click", (event) => {
    const button = event.target.closest(".chip");
    if (!button) return;

    const type = button.dataset.filterType;
    const value = button.dataset.filterValue;

    if (type === "category") state.category = value;
    if (type === "color") state.color = value;
    if (type === "size") state.size = value;

    state.visible = PAGE_SIZE;
    renderFilters();
    renderGrid();
  });

  els.loadMore.addEventListener("click", () => {
    const from = state.visible;
    state.visible += PAGE_SIZE;
    appendCards(from);
    updateMeta();

    if (els.loadMore.hidden) {
      const firstNew = els.grid.children[from];
      if (firstNew) {
        const button = firstNew.querySelector("button");
        if (button) button.focus();
      }
    }
  });

  els.grid.addEventListener("click", (event) => {
    const button = event.target.closest(".product-card__btn");
    if (!button) return;
    openModal(Number(button.dataset.index), button);
  });

  els.modalClose.addEventListener("click", closeModal);
  els.modalPrev.addEventListener("click", () => step(-1));
  els.modalNext.addEventListener("click", () => step(1));

  els.modalTag.addEventListener("click", () => {
    const list = getFiltered();
    const product = list[state.current];
    if (!product) return;

    state.showTag = !state.showTag;
    els.modalImg.src = state.showTag
      ? product.etiqueta || product.src
      : product.src;
    els.modalTag.textContent = state.showTag ? "Ver produto" : "Ver etiqueta";
    els.modalTag.setAttribute("aria-pressed", String(state.showTag));
  });

  els.modalWhatsApp.addEventListener("click", () => {
    const id = els.modalWhatsApp.dataset.id;
    const product = products.find((item, index) => {
      const itemId = item.id != null ? item.id : index;
      return String(itemId) === id;
    });
    if (!product) return;
    els.modalWhatsApp.href = buildWhatsAppLink(product);
  });

  els.modal.addEventListener("close", () => {
    document.body.classList.remove("is-modal-open");
    if (state.trigger && document.body.contains(state.trigger)) {
      state.trigger.focus();
    }
    state.trigger = null;
  });

  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (!els.modal.hasAttribute("open")) return;
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  });

  let touchStartX = 0;
  let touchStartY = 0;

  els.modal.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  els.modal.addEventListener(
    "touchend",
    (event) => {
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        step(dx < 0 ? 1 : -1);
      }
    },
    { passive: true }
  );

  renderFilters();
  renderGrid();
})();