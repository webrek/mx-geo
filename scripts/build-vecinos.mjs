/**
 * Calcula la **adyacencia** de los 32 estados (qué estados colindan) a partir de
 * los arcos compartidos del TopoJSON: dos geometrías que comparten un arco tienen
 * frontera común. Escribe data/vecinos.json = { cve: [cve, ...] }.
 *
 * Uso:  node scripts/build-vecinos.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

/** Recolecta los índices de arco (absolutos) de una geometría TopoJSON. */
function arcosDe(geom) {
  const ids = new Set();
  const push = (a) => ids.add(a < 0 ? ~a : a);
  const rec = (arr, prof) => {
    if (prof === 0) arr.forEach(push);
    else arr.forEach((x) => rec(x, prof - 1));
  };
  if (geom.type === "Polygon") rec(geom.arcs, 1);
  else if (geom.type === "MultiPolygon") rec(geom.arcs, 2);
  return ids;
}

async function main() {
  const topo = JSON.parse(await readFile(resolve(root, "data/estados.topo.json"), "utf8"));
  const geoms = topo.objects.estados.geometries;

  // arco -> lista de cves que lo usan
  const porArco = new Map();
  const arcosPorCve = new Map();
  for (const g of geoms) {
    const cve = g.properties.cve;
    const ids = arcosDe(g);
    arcosPorCve.set(cve, ids);
    for (const id of ids) {
      if (!porArco.has(id)) porArco.set(id, new Set());
      porArco.get(id).add(cve);
    }
  }

  const vecinos = {};
  for (const g of geoms) vecinos[g.properties.cve] = new Set();
  for (const cves of porArco.values()) {
    if (cves.size < 2) continue;
    const lista = [...cves];
    for (const a of lista)
      for (const b of lista)
        if (a !== b) {
          vecinos[a].add(b);
          vecinos[b].add(a);
        }
  }

  // Fronteras terrestres reales que la topología no comparte como arco (la
  // geometría disuelta de INEGI no las hace coincidir exactamente).
  const PARCHES = [["02", "03"]]; // Baja California ↔ Baja California Sur
  for (const [a, b] of PARCHES) {
    vecinos[a].add(b);
    vecinos[b].add(a);
  }

  const salida = {};
  for (const cve of Object.keys(vecinos).sort()) salida[cve] = [...vecinos[cve]].sort();
  await writeFile(resolve(root, "data/vecinos.json"), JSON.stringify(salida));

  const total = Object.values(salida).reduce((s, v) => s + v.length, 0);
  console.log(
    `vecinos calculados: ${total / 2} fronteras · 09=${salida["09"]} · 01=${salida["01"]}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
