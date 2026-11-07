/*
 * app/scripts/build-catalog.js
 * Gera app/js/data/catalog-files.js a partir das imagens otimizadas.
 *
 * Uso (na raiz do projeto):
 *   node app/scripts/build-catalog.js
 *
 * Rode novamente sempre que adicionar ou remover uma foto da pasta
 * app/img/otimizadas/. O restante do catálogo é lido em tempo de execução.
 */
const { readdir, writeFile } = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const optimizedDir = path.join(root, 'app', 'img', 'otimizadas');
const outputPath = path.join(root, 'app', 'js', 'data', 'catalog-files.js');
const imagePattern = /\.(webp|webm|jpe?g|png|avif)$/i;

async function main() {
  const entries = await readdir(optimizedDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && imagePattern.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const source =
    '/* Gerado por app/scripts/build-catalog.js. Não edite manualmente. */\n' +
    'window.NTS = window.NTS || {};\n' +
    'window.NTS.catalogFiles = ' +
    JSON.stringify(files, null, 2) +
    ';\n';

  await writeFile(outputPath, source, 'utf8');
  console.log(`catalog-files.js gerado com ${files.length} imagens.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
