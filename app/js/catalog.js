/*
 * app/js/catalog.js
 * Monta o catálogo a partir de app/data/catalog-meta.json.
 * Substitui o catalog.js gerado pelo build-catalog.mjs.
 *
 * Imagens: cada item pode ter o campo "imagem" com o nome do arquivo
 * (ex.: "nike-air-force-branco-34-35-36-37-38-39-42-129'90.webp").
 * Sem esse campo, o card mostra "Foto em breve".
 */
(function () {
  'use strict';

  const CFG = {
    dataUrl: './app/data/catalog-meta.json',
    imageBase: './app/img/otimizadas/',
    // Para usar o GitHub, troque por:
    // 'https://raw.githubusercontent.com/yaknayshvydshe/newtenistore/refs/heads/main/app/img/otimizadas/'
    gridSelector: '#catalog-grid',
    statusSelector: '#catalog-status' // opcional
  };

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== '') node.textContent = text;
    return node;
  }

  const priceText = (p) => (typeof p === 'number' ? BRL.format(p) : 'Sob consulta');

  const sizesText = (list) =>
    Array.isArray(list) && list.length
      ? 'Tamanhos ' + list.join(' - ')
      : 'Consulte a numeração';

  function buildMedia(item) {
    const media = el('figure', 'card__media');

    if (item.imagem) {
      const img = el('img');
      img.src = CFG.imageBase + item.imagem;
      img.alt = [item.nome, item.cor].filter(Boolean).join(' - ');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = () => {
        media.classList.add('is-missing');
        img.remove();
        media.appendChild(el('span', 'card__placeholder', 'Foto em breve'));
      };
      media.appendChild(img);
    } else {
      media.classList.add('is-missing');
      media.appendChild(el('span', 'card__placeholder', 'Foto em breve'));
    }
    return media;
  }

  function buildCard(item, meta) {
    const card = el('article', 'card');
    card.dataset.id = item.id;
    if (item.destaque) card.dataset.featured = 'true';

    const media = buildMedia(item);
    if (item.destaque) media.appendChild(el('span', 'card__badge', item.destaque));

    const body = el('div', 'card__body');
    body.append(
      el('h3', 'card__name', item.nome),
      el('p', 'card__meta', [item.tipo, item.cor].filter(Boolean).join(' · ')),
      el('p', 'card__meta', sizesText(item.tamanhos)),
      el('p', 'card__price', priceText(item.preco)),
      el('p', 'card__desc', item.descricao || meta.descricaoPadrao)
    );

    const cta = el('a', 'card__cta', 'Tenho interesse');
    const msg = `Oi! Tenho interesse em: ${item.nome} (ref. ${item.id}). Tem disponível?`;
    cta.href = `https://wa.me/${meta.whatsapp}?text=${encodeURIComponent(msg)}`;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    body.appendChild(cta);

    card.append(media, body);
    return card;
  }

  function setStatus(text) {
    const status = document.querySelector(CFG.statusSelector);
    if (!status) return;
    status.textContent = text;
    status.hidden = !text;
  }

  async function init() {
    const grid = document.querySelector(CFG.gridSelector);
    setStatus('Carregando catálogo…');

    try {
      const res = await fetch(CFG.dataUrl, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status} ao ler ${CFG.dataUrl}`);
      const meta = await res.json();

      // Destaques primeiro, na ordem de "featured"; depois os demais, na ordem do JSON.
      const featured = (meta.featured || []).filter((id) => meta.items[id]);
      const rest = Object.keys(meta.items).filter((id) => !featured.includes(id));

      const list = [...featured, ...rest].map((id) => ({ id, ...meta.items[id] }));
      window.CATALOG = list;
      document.dispatchEvent(new CustomEvent('catalog:ready', { detail: list }));

      if (grid) grid.replaceChildren(...list.map((item) => buildCard(item, meta)));
      setStatus('');
    } catch (err) {
      console.error('[catalog]', err);
      setStatus('Não foi possível carregar o catálogo. Fale com a loja pelo WhatsApp.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();