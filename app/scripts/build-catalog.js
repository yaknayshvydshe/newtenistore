import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const imageDir = path.join(root, "app", "img");
const optimizedDir = path.join(imageDir, "otimizadas");
const metaPath = path.join(root, "app", "data", "catalog-meta.json");
const outputPath = path.join(root, "app", "js", "catalog.js");
const imagePattern = /\.(jpe?g|png|webp)$/i;
const ignoredNames = new Set(["logo", "favicon"]);
const defaultDescription =
  "Consulte valor, numeração e disponibilidade pelo WhatsApp.";

async function listFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  } catch {
    return [];
  }
}

function referenceFrom(name) {
  const digits = name.match(/\d{2,}/);
  return digits ? digits[0] : name;
}

async function main() {
  const meta = JSON.parse(await readFile(metaPath, "utf8"));
  const originals = await listFiles(imageDir);
  const optimized = await listFiles(optimizedDir);
  const originalsByBase = new Map();
  const optimizedByBase = new Map();

  for (const name of originals) {
    if (!imagePattern.test(name)) continue;
    const base = path.parse(name).name;
    if (ignoredNames.has(base.toLowerCase())) continue;
    if (!originalsByBase.has(base)) originalsByBase.set(base, name);
  }

  for (const name of optimized) {
    if (!imagePattern.test(name)) continue;
    const base = path.parse(name).name;
    if (ignoredNames.has(base.toLowerCase())) continue;
    if (!optimizedByBase.has(base)) optimizedByBase.set(base, name);
  }

  const bases = new Set([...originalsByBase.keys(), ...optimizedByBase.keys()]);
  const items = [...bases].map((base) => {
    const ref = referenceFrom(base);
    const original = originalsByBase.get(base);
    const optimizedFile = optimizedByBase.get(base);
    const override = meta.items?.[ref] ?? meta.items?.[base] ?? {};
    const sizes = Array.isArray(override.tamanhos)
      ? override.tamanhos.map(String)
      : [];

    return {
      id: base,
      ref,
      src: optimizedFile
        ? `./app/img/otimizadas/${optimizedFile}`
        : `./app/img/${original}`,
      srcOriginal: original
        ? `./app/img/${original}`
        : `./app/img/${base}.JPG`,
      nome: override.nome ?? `Ref. ${ref}`,
      marca: override.marca ?? "",
      tipo: override.tipo ?? "Calçado",
      cor: override.cor ?? "",
      tamanhos: sizes,
      preco:
        typeof override.preco === "number" && Number.isFinite(override.preco)
          ? override.preco
          : null,
      destaque: override.destaque ?? "",
      descricao: override.descricao ?? meta.descricaoPadrao ?? defaultDescription,
    };
  });

  const featured = Array.isArray(meta.featured) ? meta.featured.map(String) : [];
  const featuredOrder = new Map(featured.map((ref, index) => [ref, index]));

  items.sort((a, b) => {
    const aOrder = featuredOrder.has(a.ref) ? featuredOrder.get(a.ref) : Infinity;
    const bOrder = featuredOrder.has(b.ref) ? featuredOrder.get(b.ref) : Infinity;
    if (aOrder !== bOrder) return aOrder - bOrder;
    const aNumber = Number(a.ref);
    const bNumber = Number(b.ref);
    if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
      return aNumber - bNumber;
    }
    return a.ref.localeCompare(b.ref, "pt-BR");
  });

  const payload = {
    whatsapp: meta.whatsapp,
    items,
  };
  const source = `window.CATALOG = ${JSON.stringify(payload).replace(
    /</g,
    "\\u003c"
  )};\n`;

  await writeFile(outputPath, source, "utf8");
  console.log(
    `catalog.js gerado com ${items.length} itens (${featured.length} destaques).`
  );
}

await main();
