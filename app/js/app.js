(() => {
  "use strict";

  const LOGO = "./app/img/logo.webp";
  const PAGE_SIZE = 12;
  const catalog = window.CATALOG;
  const items = catalog && Array.isArray(catalog.items) ? catalog.items : [];
  const whatsapp =
    catalog && catalog.whatsapp ? String(catalog.whatsapp) : "5545998048535";

  const el = {
    search: document.getElementById("search"),
    filters: document.getElementById("filters"),
    grid: document.getElementById("grid"),
    count: document.getElementById("count"),
    loadMore: document.getElementById("loadMore"),
    empty: document.getElementById("empty"),
    emptyText: document.getElementById("emptyText"),
    emptyClear: document.getElementById("emptyClear"),
    error: document.getElementById("catalogError"),
    modal: document.getElementById("productModal"),
    modalImg: document.getElementById("modalImg"),
    modalRef: document.getElementById("modalRef"),
    modalTitle: document.getElementById("modalTitle"),
    modalPrice: document.getElementById("modalPrice"),
    modalMeta: document.getElementById("modalMeta"),
    modalDesc: document.getElementById("modalDesc"),
    modalSizes: document.getElementById("modalSizes"),
    modalCounter: document.getElementById("modalCounter"),
    modalWhatsApp: document.getElementById("modalWhatsApp"),
    modalClose: document.getElementById("modalClose"),
    modalPrev: document.getElementById("modalPrev"),
    modalNext: document.getElementById("modalNext"),
  };

  const required = [
    "search",
    "filters",
    "grid",
    "count",
    "loadMore",
    "empty",
    "emptyText",
    "emptyClear",
    "error",
    "modal",
    "modalImg",
    "modalRef",
    "modalTitle",
    "modalPrice",
    "modalMeta",
    "modalDesc",
    "modalSizes",
    "modalCounter",
    "modalWhatsApp",
    "modalClose",
    "modalPrev",
    "modalNext",
  ];

  const missing = required.filter((key) => !el[key]);
  if (missing.length > 0) {
    console.error("Elementos ausentes no HTML:", missing.join(", "));
    return;
  }

  const state = {
    query: "",
    filter: "all",
    visible: PAGE_SIZE,
    current: -1,
    trigger: null,
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
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return char;
      }
    });

  const normalize = (value) =>
    String(value == null ? "" : value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const searchTokens = () => normalize(state.query).split(/\s+/).filter(Boolean);

  const matchesQuery = (item, tokens) => {
    if (tokens.length === 0) return true;
    const haystack = normalize(
      [
        item.nome,
        item.marca,
        item.tipo,
        item.cor,
        item.ref,
        item.id,
        item.descricao,
      ].join(" ")
    );
    return tokens.every((token) => haystack.includes(token));
  };

  const filtered = () => {
    const tokens = searchTokens();
    return items.filter((item) => {
      const matchesFilter =
        state.filter === "all" || Boolean(item.destaque);
      return matchesFilter && matchesQuery(item, tokens);
    });
  };

  const whatsappLink = (item) => {
    const name = item.nome || `Ref. ${item.ref}`;
    const message = `Oi! Vi o ${name} (Ref. ${item.ref}) no site e quero saber valor, numeração e disponibilidade.`;
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
  };

  const cardTemplate = (item) => {
    const name = item.nome || `Ref. ${item.ref}`;
    const meta = [item.marca, item.tipo, item.cor].filter(Boolean).join(" · ");
    const badge = item.destaque
      ? `<span class="card__badge">${escapeHtml(item.destaque)}</span>`
      : "";
    const original = item.srcOriginal
      ? ` data-original="${escapeHtml(item.srcOriginal)}"`
      : "";

    return `<li class="card">
      <button class="card__btn" type="button" data-id="${escapeHtml(item.id)}" aria-label="Ver detalhes de ${escapeHtml(name)}">
        <span class="card__media">
          <img class="card__img" src="${escapeHtml(item.src)}"${original} alt="${escapeHtml(name)}" width="900" height="1200" loading="lazy" decoding="async">
          ${badge}
        </span>
        <span class="card__body">
          <span class="card__name">${escapeHtml(name)}</span>
          <span class="card__meta">${escapeHtml(meta || "Calçado")}</span>
          <span class="card__ref">Ref. ${escapeHtml(item.ref)}</span>
          <span class="card__price">${formatPrice(item.preco)}</span>
          <span class="card__cta">Ver detalhes <span aria-hidden="true">→</span></span>
        </span>
      </button>
    </li>`;
  };

  const updateCount = (shown, total) => {
    if (items.length === 0) {
      el.count.textContent = "Catálogo indisponível";
      return;
    }
    if (total === 0) {
      el.count.textContent = "Nenhuma peça";
      return;
    }
    el.count.textContent = `${shown} de ${total} ${total === 1 ? "peça" : "peças"}`;
  };

  const render = () => {
    const list = filtered();
    const shown = Math.min(state.visible, list.length);
    el.grid.innerHTML = list.slice(0, shown).map(cardTemplate).join("");

    updateCount(shown, list.length);
    el.loadMore.hidden = shown >= list.length || list.length === 0;
    el.error.hidden = items.length !== 0;

    const isEmpty = list.length === 0 && items.length > 0;
    el.empty.hidden = !isEmpty;
    if (isEmpty) {
      el.emptyText.textContent = state.query
        ? `Não encontramos nada para “${state.query}”. Tente outra referência, marca ou tipo.`
        : "Ainda não há peças cadastradas. Fale com a loja pelo WhatsApp.";
    }
  };

  const fillModal = (index) => {
    const list = filtered();
    const item = list[index];
    if (!item) return;

    state.current = index;
    el.modalImg.src = item.src;
    el.modalImg.alt = item.nome || `Ref. ${item.ref}`;
    el.modalImg.dataset.original = item.srcOriginal || "";
    el.modalImg.dataset.stage = "";
    el.modalImg.classList.remove("is-fallback");
    el.modalRef.textContent = `Ref. ${item.ref}`;
    el.modalTitle.textContent = item.nome || `Ref. ${item.ref}`;
    el.modalPrice.textContent = formatPrice(item.preco);
    el.modalMeta.textContent = [item.marca, item.tipo, item.cor]
      .filter(Boolean)
      .join(" · ");
    el.modalDesc.textContent = item.descricao || "";
    el.modalSizes.innerHTML = (item.tamanhos || [])
      .map((size) => `<li>${escapeHtml(size)}</li>`)
      .join("");
    el.modalSizes.hidden = !(item.tamanhos && item.tamanhos.length > 0);
    el.modalCounter.textContent = `${index + 1} de ${list.length}`;
    el.modalWhatsApp.href = whatsappLink(item);
  };

  const openModal = (id, trigger) => {
    if (el.modal.open) return;
    const list = filtered();
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) return;

    state.trigger = trigger || null;
    fillModal(index);

    if (typeof el.modal.showModal === "function") {
      el.modal.showModal();
    } else {
      el.modal.setAttribute("open", "");
    }
    document.body.classList.add("is-locked");
  };

  const cleanupModal = () => {
    document.body.classList.remove("is-locked");
    const target =
      state.trigger && document.body.contains(state.trigger)
        ? state.trigger
        : el.search;
    if (target) target.focus();
    state.trigger = null;
  };

  const closeModal = () => {
    if (typeof el.modal.close === "function" && el.modal.open) {
      el.modal.close();
      return;
    }
    el.modal.removeAttribute("open");
    cleanupModal();
  };

  const step = (direction) => {
    const list = filtered();
    if (list.length === 0) return;
    const nextIndex = (state.current + direction + list.length) % list.length;
    fillModal(nextIndex);
  };

  const handleImageError = (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    if (image.dataset.stage === "logo") return;
    if (image.src.endsWith("/logo.webp")) return;

    if (image.dataset.stage !== "original" && image.dataset.original) {
      image.dataset.stage = "original";
      image.src = image.dataset.original;
      return;
    }

    image.dataset.stage = "logo";
    image.src = LOGO;
    image.classList.add("is-fallback");
  };

  el.search.addEventListener("input", () => {
    state.query = el.search.value;
    state.visible = PAGE_SIZE;
    render();
  });

  el.filters.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;

    state.filter = chip.dataset.filter === "featured" ? "featured" : "all";
    state.visible = PAGE_SIZE;

    el.filters.querySelectorAll(".chip").forEach((button) => {
      const active = button === chip;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    render();
  });

  el.grid.addEventListener("click", (event) => {
    const button = event.target.closest(".card__btn");
    if (!button) return;
    openModal(button.dataset.id, button);
  });

  el.loadMore.addEventListener("click", () => {
    const before = Math.min(state.visible, filtered().length);
    state.visible += PAGE_SIZE;
    render();
    const buttons = el.grid.querySelectorAll(".card__btn");
    if (buttons[before]) buttons[before].focus();
  });

  el.emptyClear.addEventListener("click", () => {
    state.query = "";
    state.filter = "all";
    state.visible = PAGE_SIZE;
    el.search.value = "";

    el.filters.querySelectorAll(".chip").forEach((button) => {
      const active = button.dataset.filter === "all";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    render();
    el.search.focus();
  });

  el.modalClose.addEventListener("click", closeModal);
  el.modalPrev.addEventListener("click", () => step(-1));
  el.modalNext.addEventListener("click", () => step(1));

  el.modal.addEventListener("close", cleanupModal);

  el.modal.addEventListener("click", (event) => {
    if (event.target === el.modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (!el.modal.open) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  });

  document.addEventListener("error", handleImageError, true);

  render();
})();
