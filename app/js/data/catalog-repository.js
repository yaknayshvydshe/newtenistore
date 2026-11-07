/*
 * app/js/data/catalog-repository.js
 * Camada de dados: lê a lista de imagens gerada e devolve produtos prontos.
 * É o único lugar que conhece a origem dos dados.
 */
(function () {
  'use strict';

  const NTS = window.NTS || (window.NTS = {});
  const config = NTS.config;
  const source = NTS.catalogSource || {};
  const files = Array.isArray(NTS.catalogFiles) ? NTS.catalogFiles : [];

  const products = [];
  if (config && NTS.Product) {
    const seen = new Set();
    for (const file of files) {
      if (!file || seen.has(file)) continue;
      seen.add(file);
      const product = NTS.Product.parse(file, source, config);
      if (product) products.push(product);
    }
  }

  products.sort(
    (a, b) =>
      a.marca.localeCompare(b.marca, 'pt-BR') ||
      a.modelo.localeCompare(b.modelo, 'pt-BR') ||
      a.id.localeCompare(b.id, 'pt-BR')
  );

  const featuredSet = new Set(source.featured || []);
  const byFile = new Map(products.map((product) => [product.file, product]));
  const featured = (source.featured || [])
    .map((file) => byFile.get(file))
    .filter(Boolean);
  const rest = products.filter((product) => !featuredSet.has(product.file));
  const ordered = featured.concat(rest);

  NTS.repository = {
    all() {
      return ordered.slice();
    },
    count() {
      return ordered.length;
    }
  };
})();
