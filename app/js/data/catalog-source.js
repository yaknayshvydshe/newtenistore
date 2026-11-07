/*
 * app/js/data/catalog-source.js
 * Regras de leitura do nome do arquivo e exceções manuais.
 *
 * Padrão dos arquivos em app/img/otimizadas/:
 *   marca-modelo-cor-tamanhos-preço.webp
 *   nike-air-force-branco-34-35-36-37-38-39-42-129'90.webp
 *
 * O preço é sempre o último trecho, no formato 129'90.
 * Os tamanhos são os números de dois dígitos antes do preço.
 * A cor começa na primeira palavra conhecida de colorWords;
 * tudo o que vem antes dela é marca + modelo.
 */
(function () {
  'use strict';

  window.NTS = window.NTS || {};

  window.NTS.catalogSource = {
    brands: {
      addan: 'Addan',
      adidas: 'Adidas',
      arezzo: 'Arezzo',
      boots: 'Boots',
      cocacola: 'Coca-Cola',
      colcci: 'Colcci',
      converse: 'Converse',
      "d'matias": "D'Matias",
      fila: 'Fila',
      futurewear: 'Futurewear',
      ipanema: 'Ipanema',
      lacoste: 'Lacoste',
      newbalance: 'New Balance',
      nike: 'Nike',
      puma: 'Puma',
      redley: 'Redley',
      reserva: 'Reserva',
      running: 'Running',
      santalolla: 'Santa Lolla',
      soultz: 'Soultz',
      vans: 'Vans',
      veja: 'Veja',
      walking: 'Walking'
    },

    colorWords: [
      'branco', 'branca', 'preto', 'preta', 'cinza', 'nude', 'rosa', 'rose',
      'pink', 'azul', 'marinho', 'ouro', 'dourado', 'caramelo', 'nozes',
      'creme', 'palha', 'jeans', 'jeansdenim', 'denim', 'holografico',
      'offwhite', 'champagne', 'tobacco', 'onca', 'danoninho', 'bb', 'purple',
      'arcoiris', 'camurcadulce', 'verde', 'vermelho', 'light', 'hidra',
      'laminate'
    ],

    colorNames: {
      offwhite: 'Off-white',
      jeansdenim: 'Jeans Denim',
      arcoiris: 'Arco-íris',
      camurcadulce: 'Camurça Dulce',
      holografico: 'Holográfico',
      onca: 'Onça',
      bb: 'BB',
      danoninho: 'Danoninho',
      pink: 'Rosa',
      purple: 'Roxo',
      tobacco: 'Tabaco',
      champagne: 'Champagne',
      light: 'Light',
      hidra: 'Hidra',
      laminate: 'Laminate'
    },

    modelNames: {
      '4run': '4Run',
      add01: 'ADD01',
      adwhite: 'Adwhite',
      air: 'Air',
      allstar: 'All Star',
      bolsa: 'Bolsa',
      botas: 'Botas',
      campus00s: 'Campus 00s',
      casual: 'Casual',
      chinelo: 'Chinelo',
      coturno: 'Coturno',
      dunk: 'Dunk',
      force: 'Force',
      futurecraft4d: 'Futurecraft 4D',
      kids: 'Kids',
      low: 'Low',
      meias: 'Meias',
      mocassin: 'Mocassin',
      noruega: 'Noruega',
      oldskool: 'Old Skool',
      papete: 'Papete',
      pelucia: 'Pelúcia',
      rasteirinha: 'Rasteirinha',
      running: 'Running',
      samba: 'Samba',
      shoe: 'Shoe',
      slipon: 'Slipon',
      social: 'Social',
      sophya: 'Sophya',
      superstar: 'Superstar',
      tad4: 'TAD4',
      ultrarange: 'UltraRange',
      '1144vs': '1144 VS',
      '1300kni': '1300 KNI',
      '7001ink': '7001 Ink',
      '7099kill': '7099 Kill',
      '8002voi': '8002 Voi',
      v023: 'V023',
      x180: 'X180',
      x4zoom: 'X4 Zoom',
      ziper: 'Zíper'
    },

    overrides: {
      "adidas-adwhite-branco-ouro-light-34-37-149'90": {
        cor: 'Branco e Ouro Light'
      },
      "veja-x180-10-camurcadulce-offwhite-35-36-39-149'90": {
        modelo: 'X180-10'
      }
    },

    featured: [
      "nike-air-force-branco-34-35-36-37-38-39-42-129'90.webp",
      "adidas-samba-branco-azul-36-149'90.webp",
      "vans-oldskool-preto-branco-34-35-36-38-41-42-109'90.webp",
      "converse-allstar-preto-36-37-38-39-41-42-109'90.webp",
      "newbalance-casual-branco-36-37-149'90.webp",
      "veja-v023-branco-preto-35-36-37-129'90.webp"
    ]
  };
})();
