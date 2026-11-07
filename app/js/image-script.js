/*
 * app/js/image-script.js
 * Lê cada nome de arquivo de IMAGE_META.files e monta o catálogo:
 *   marca              -> h3.card__name
 *   modelo             -> p.card__meta (1º)
 *   tamanhos           -> p.card__meta (2º)
 *   preço              -> p.card__price
 * A imagem usa o link do GitHub (baseUrl + nome do arquivo).
 * Resultado disponível em window.CATALOG e evento 'catalog:ready'.
 */
(function () {
  'use strict';

  const META = window.IMAGE_META || {};
  const CFG = {
    gridSelector: '#catalog-grid',                 // container dos cards
    whatsapp: 'https://wa.me/5545998048535',
    fallbackPrice: 'Sob consulta'
  };

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const EXT = /\.(webp|webm|jpe?g|png|avif)$/i;

  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

  /* "v023" -> "V023"; "kids" -> "Kids" */
  const token = (t) => (/\d/.test(t) ? t.toUpperCase() : cap(t));

  /* ["branco", "preto"] -> "Branco e Preto" */
  function joinList(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' e ' + items[items.length - 1];
  }

  function parseFile(file) {
    const stem = file.replace(EXT, '');
    const key = stem.toLowerCase();
    const ov = (META.overrides || {})[key] || {};

    // "arco-iris" vira um único token antes de separar por "-"
    let s = key.replace('arco-iris', 'arcoiris');

    // Preço: "129'90" no fim do nome
    let preco = null;
    const pm = s.match(/(\d+)'(\d{2})$/);
    if (pm) {
      preco = Number(pm[1]) + Number(pm[2]) / 100;
      s = s.slice(0, pm.index);
    }

    const tokens = s.replace(/-+$/, '').split('-').filter(Boolean);
    const brandKey = tokens.shift() || '';

    // Tamanhos: números de 2 dígitos no fim (sempre deixa ao menos 1 token)
    const sizes = [];
    while (tokens.length > 1 && /^\d{2}$/.test(tokens[tokens.length - 1])) {
      sizes.unshift(tokens.pop());
    }

    // Modelo: tokens até a primeira palavra de cor; o restante são as cores
    const words = META.colorWords || [];
    const colorIdx = tokens.findIndex((t) => words.includes(t));
    const modeloTokens = colorIdx === -1 ? tokens : tokens.slice(0, colorIdx);
    const corTokens = colorIdx === -1 ? [] : tokens.slice(colorIdx);

    const names = META.colorNames || {};
    const marca = ov.marca || (META.brands || {})[brandKey] || cap(brandKey);
    const modelo = ov.modelo || modeloTokens.map(token).join(' ');
    const cor = ov.cor || joinList(corTokens.map((t) => names[t] || token(t)));

    const tamanhos = ov.tamanhos || sizes;
    const tamanhosTexto = tamanhos.length === 0 ? ''
      : tamanhos.length === 1 ? `Tamanho ${tamanhos[0]}`
      : `Tamanhos ${tamanhos.join(' - ')}`;

    const precoFinal = ov.preco ?? preco;
    const precoTexto = precoFinal == null ? CFG.fallbackPrice : BRL.format(precoFinal);

    return {
      arquivo: file,
      referencia: stem,
      marca,
      modelo,
      cor,
      tamanhos,
      tamanhosTexto,
      preco: precoFinal,
      precoTexto,
      imagem: (META.baseUrl || '') + encodeURI(file),
      alt: [marca, modelo, cor].filter(Boolean).join(' ')
    };
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildCard(p) {
    const card = el('article', 'card');
    card.dataset.ref = p.referencia;

    const media = el('figure', 'card__media');
    const img = el('img');
    img.src = p.imagem;
    img.alt = p.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = () => media.classList.add('is-missing');
    media.appendChild(img);

    const body = el('div', 'card__body');
    body.append(
      el('h3', 'card__name', p.marca),
      el('p', 'card__meta', p.modelo)
    );
    if (p.tamanhosTexto) body.appendChild(el('p', 'card__meta', p.tamanhosTexto));
    body.appendChild(el('p', 'card__price', p.precoTexto));

    const cta = el('a', 'card__cta', 'Tenho interesse');
    const msg = `Oi! Tenho interesse no ${p.marca} ${p.modelo} (${p.referencia}). Tem disponível?`;
    cta.href = `${CFG.whatsapp}?text=${encodeURIComponent(msg)}`;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    body.appendChild(cta);

    card.append(media, body);
    return card;
  }

  function render(items) {
    window.CATALOG = items;
    document.dispatchEvent(new CustomEvent('catalog:ready', { detail: items }));

    const grid = document.querySelector(CFG.gridSelector);
    if (grid) grid.replaceChildren(...items.map(buildCard));
  }

  function init() {
    const items = (META.files || [])
      .map(parseFile)
      .sort((a, b) =>
        a.marca.localeCompare(b.marca, 'pt-BR') ||
        a.modelo.localeCompare(b.modelo, 'pt-BR'));
    render(items);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ImageCatalog = { parseFile };
})();