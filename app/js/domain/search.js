/*
 * app/js/domain/search.js
 * Busca tolerante do catálogo: categorias, tamanhos exatos, vícios de busca,
 * sinônimos e correção de digitação sem biblioteca externa.
 */
(function () {
  'use strict';

  const NTS = window.NTS || (window.NTS = {});
  const Product = NTS.Product;
  const source = NTS.catalogSource || {};
  const categoriasPorArquivo = source.categoriasPorArquivo || {};

  const CATEGORY_TERMS = {
    tenis: 'tenis',
    tennis: 'tenis',
    sneaker: 'tenis',
    chinelo: 'chinelo',
    bota: 'bota',
    coturno: 'bota',
    sandalia: 'sandalia',
    rasteirinha: 'sandalia',
    bolsa: 'bolsa',
    mocassim: 'mocassim',
    loafer: 'mocassim'
  };

  const ANY_CATEGORY = 'calcado';
  const SIZE_WORDS = new Set(['tamanho', 'numero', 'numeracao']);
  const STOPWORDS = new Set([
    'barato',
    'baratinha',
    'precinho',
    'promocao',
    'oferta',
    'original',
    'novo',
    'lancamento',
    'bom',
    'bonito',
    'confortavel',
    'feminino',
    'masculino',
    'infantil',
    'grande',
    'pequeno'
  ]);

  const vocabulary = new Set();

  const addVocabulary = (value) => {
    Product.searchWords(value).forEach((word) => {
      if (word.length >= 4 && /^[a-z]+$/.test(word)) vocabulary.add(word);
    });
  };

  const index = (product) => {
    if (!product) return product;
    product.categoria = categoriasPorArquivo[product.file] || 'tenis';
    addVocabulary(product.marca);
    addVocabulary(product.modelo);
    addVocabulary(product.categoria);
    Object.keys(CATEGORY_TERMS).forEach(addVocabulary);
    return product;
  };

  const distance = (left, right) => {
    const a = String(left);
    const b = String(right);
    const matrix = Array.from({ length: a.length + 1 }, () =>
      new Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );

        if (
          i > 1 &&
          j > 1 &&
          a.charAt(i - 1) === b.charAt(j - 2) &&
          a.charAt(i - 2) === b.charAt(j - 1)
        ) {
          matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
        }
      }
    }

    return matrix[a.length][b.length];
  };

  const correct = (term) => {
    if (term.length < 4 || !/^[a-z]+$/.test(term)) return null;
    if (vocabulary.has(term)) return null;

    const limit = term.length >= 7 ? 2 : 1;
    const first = term.charAt(0);
    let candidate = null;

    for (const word of vocabulary) {
      if (word.length < 4 || word.charAt(0) !== first || word === term) continue;
      if (distance(term, word) <= limit) {
        if (candidate) return null;
        candidate = word;
      }
    }

    return candidate;
  };

  const matchesText = (product, term) => {
    if (Product.matchesSearch(product.search, term)) return true;
    const corrected = correct(term);
    return Boolean(corrected && Product.matchesSearch(product.search, corrected));
  };

  const matchesNumber = (product, number) => {
    const words = Product.searchWords(product.nome + ' ' + product.modelo);
    return words.includes(number);
  };

  const matches = (product, query) => {
    if (!product) return false;

    const terms = Array.from(new Set(Product.searchWords(query)));
    if (terms.length === 0) return true;

    const numbers = [];
    const categories = new Set();
    const textTerms = [];
    const explicitSize = terms.some((term) => SIZE_WORDS.has(term));

    for (const term of terms) {
      if (/^\d+$/.test(term)) {
        numbers.push(term);
        continue;
      }

      if (SIZE_WORDS.has(term)) continue;
      if (term === ANY_CATEGORY) continue;

      if (Object.prototype.hasOwnProperty.call(CATEGORY_TERMS, term)) {
        categories.add(CATEGORY_TERMS[term]);
        continue;
      }

      if (STOPWORDS.has(term)) continue;

      textTerms.push(term);
    }

    const canUseModelNumber = !explicitSize && textTerms.length > 0;

    for (const category of categories) {
      if (product.categoria !== category) return false;
    }

    for (const number of numbers) {
      const sizeMatch = number.length === 2 && product.tamanhos.includes(number);
      const modelMatch = canUseModelNumber && matchesNumber(product, number);
      if (!sizeMatch && !modelMatch) return false;
    }

    for (const term of textTerms) {
      if (!matchesText(product, term)) return false;
    }

    return true;
  };

  NTS.Search = { index, matches };
})();
