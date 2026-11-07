/*
 * app/js/config.js
 * Configuração única da loja. Não mistura dados com interface.
 */
(function () {
  'use strict';

  window.NTS = window.NTS || {};

  window.NTS.config = Object.freeze({
    whatsapp: '5545998048535',
    imageBase: './app/img/otimizadas/',
    fallbackImage: './app/img/logo.webp',
    pageSize: 12,
    locale: 'pt-BR',
    currency: 'BRL'
  });
})();
