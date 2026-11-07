/*
 * app/js/app.js
 * Ponto de entrada: liga a camada de dados à camada de interface.
 */
(function () {
  'use strict';

  const NTS = window.NTS;
  const error = document.getElementById('catalogError');

  try {
    if (!NTS || !NTS.repository || !NTS.view) {
      throw new Error('Camadas do catálogo não carregaram.');
    }
    NTS.view.init(NTS.repository.all());
  } catch (err) {
    console.error('[catalog]', err);
    if (error) error.hidden = false;
  }
})();
