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
    console.error(
      "New Tenis Store: nenhum produto encontrado. Verifique se js/data.js está carregando e se window.PRODUCTS existe."
    );
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

  const missing = Object.keys(els).filter((key) => !els[key]);
  if (missing.length > 0) {
    console.error(
      "New Tenis Store: IDs ausentes no index.html:",
      missing.join(", ")
    );
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
     