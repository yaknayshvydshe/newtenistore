/*
 * app/js/domain/product.js
 * Camada de domínio: transforma o nome do arquivo em um produto.
 * Não conhece o DOM, não faz fetch e não renderiza nada.
 */
(function () {
  'use strict';

  const NTS = window.NTS || (window.NTS = {});
  const EXT = /\.(webp|webm|jpe?g|png|avif)$/i;
  const PRICE_SUFFIX = /(\d+)'(\d{2})$/;
  const SIZE = /^\d{2}$/;

  const titleize = (value) => {
    const text = String(value == null ? '' : value);
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const formatModelToken = (token, names) => {
    if (names && names[token]) return names[token];
    if (!token) return '';
    if (/^\d+$/.test(token)) return token;
    if (/\d/.test(token)) {
      return token
        .replace(/([a-z])(\d)/gi, '$1 $2')
        .replace(/(\d)([a-z])/gi, '$1 $2')
        .split(' ')
        .filter(Boolean)
        .map((part) => (/^\d+$/.test(part) ? part : titleize(part)))
        .join(' ');
    }
    return titleize(token);
  };

  const joinList = (parts) => {
    if (parts.length <= 1) return parts.join('');
    return parts.slice(0, -1).join(', ') + ' e ' + parts[parts.length - 1];
  };

  const normalize = (value) =>
    String(value == null ? '' : value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  const searchWords = (value) => normalize(value).split(/\s+/).filter(Boolean);

  const matchesSearch = (haystack, query) => {
    const terms = searchWords(query);
    if (terms.length === 0) return true;

    const text = normalize(haystack);
    const compactText = text.replace(/\s+/g, '');

    return terms.every(
      (term) => text.includes(term) || (term.length > 2 && compactText.includes(term))
    );
  };

  const formatPrice = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    return 'Sob consulta';
  };

  const sizesLabel = (sizes) => {
    if (!Array.isArray(sizes) || sizes.length === 0) {
      return 'Consulte a numeração';
    }
    if (sizes.length === 1) return 'Tamanho ' + sizes[0];
    return 'Tamanhos ' + sizes.join(', ');
  };

  const installmentsFor = (preco, config) => {
    const rule = config && config.installments;
    if (!rule || typeof preco !== 'number' || !Number.isFinite(preco)) return null;

    const eligiblePrice = Number(rule.eligiblePrice);
    const count = Number(rule.count);
    const total = Number(rule.total);
    if (
      !Number.isFinite(eligiblePrice) ||
      Math.abs(preco - eligiblePrice) > 0.009 ||
      !Number.isInteger(count) ||
      count < 2 ||
      !Number.isFinite(total)
    ) {
      return null;
    }

    const value = Math.round((total * 100) / count + 1e-6) / 100;
    return {
      count,
      value,
      valueTexto: formatPrice(value),
      total,
      totalTexto: formatPrice(total),
      cash: preco,
      cashTexto: formatPrice(preco),
      label: count + 'x de ' + formatPrice(value),
      note: 'Total ' + formatPrice(total) + ' · ' + formatPrice(preco) + ' à vista'
    };
  };

  const parse = (file, source, config) => {
    if (!file || typeof file !== 'string') return null;

    const stem = file.replace(EXT, '');
    const key = stem.toLowerCase();
    const override = (source.overrides && source.overrides[key]) || {};

    let work = key.replace(/arco[-]iris/g, 'arcoiris');
    let price = null;
    const priceMatch = work.match(PRICE_SUFFIX);
    if (priceMatch) {
      price = Number(priceMatch[1]) + Number(priceMatch[2]) / 100;
      work = work.slice(0, priceMatch.index);
    }

    const tokens = work.replace(/-+$/, '').split('-').filter(Boolean);
    const brandKey = tokens.shift() || '';

    const sizes = [];
    while (tokens.length > 1 && SIZE.test(tokens[tokens.length - 1])) {
      sizes.unshift(tokens.pop());
    }

    const colorWords = source.colorWords || [];
    const colorIndex = tokens.findIndex((token) => colorWords.includes(token));
    const modelTokens = colorIndex === -1 ? tokens : tokens.slice(0, colorIndex);
    const colorTokens = colorIndex === -1 ? [] : tokens.slice(colorIndex);

    const brands = source.brands || {};
    const modelNames = source.modelNames || {};
    const colorNames = source.colorNames || {};

    const marca = override.marca || brands[brandKey] || titleize(brandKey);
    const modelo =
      override.modelo ||
      modelTokens.map((token) => formatModelToken(token, modelNames)).join(' ');
    const cor =
      override.cor ||
      joinList(colorTokens.map((token) => colorNames[token] || titleize(token)));

    const tamanhos = Array.isArray(override.tamanhos)
      ? override.tamanhos.map(String)
      : sizes;
    const preco =
      override.preco != null ? Number(override.preco) : price;

    const nome =
      override.nome ||
      [marca, modelo].filter(Boolean).join(' ') ||
      'Ref. ' + stem;
    const destaque =
      override.destaque ||
      ((source.featured || []).includes(file) ? 'Destaque' : '');
    const descricao = override.descricao || '';
    const imagem = override.imagem || (config.imageBase + file);
    const precoTexto = formatPrice(preco);
    const parcelamento = installmentsFor(preco, config);
    const tamanhosTexto = sizesLabel(tamanhos);
    const search = normalize(
      [
        nome,
        marca,
        modelo,
        cor,
        tamanhos.join(' '),
        precoTexto,
        parcelamento ? parcelamento.label + ' ' + parcelamento.totalTexto : ''
      ].join(' ')
    );

    return {
      id: stem,
      file,
      ref: stem,
      marca,
      modelo,
      cor,
      tamanhos,
      tamanhosTexto,
      preco,
      precoTexto,
      parcelamento,
      nome,
      destaque,
      descricao,
      imagem,
      alt: [nome, cor, tamanhos.length ? tamanhosTexto : '']
        .filter(Boolean)
        .join(' - '),
      search
    };
  };

  NTS.Product = {
    parse,
    formatPrice,
    normalize,
    searchWords,
    matchesSearch,
    sizesLabel
  };
})();
