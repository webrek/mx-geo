/**
 * Genera los datos de municipios de @webrek/mx-geo a partir del Marco
 * Geoestadístico de INEGI (servicio ArcGIS, 2,475 municipios en alta
 * resolución): un TopoJSON por estado en data/municipios/<CVE_ENT>.json y un
 * índice ligero (sin geometría) en data/municipios-index.json.
 *
 * Uso (necesita memoria por el tamaño del origen):
 *   NODE_OPTIONS=--max-old-space-size=8192 node scripts/build-municipios.mjs
 */
import { readFile, writeFile, access, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import mapshaper from "mapshaper";
import { feature } from "topojson-client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const SVC =
  "https://services5.arcgis.com/0TAhhrymXRLOcVMe/arcgis/rest/services/00mun/FeatureServer/0/query";

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function descargaPagina(offset) {
  const dest = resolve(__dirname, `inegi_mun_${offset}.geojson`);
  if (await exists(dest)) return dest;
  const q = new URLSearchParams({
    where: "1=1",
    outFields: "CVEGEO,CVE_ENT,CVE_MUN,NOMGEO",
    outSR: "4326",
    f: "geojson",
    resultRecordCount: "2000",
    resultOffset: String(offset),
  });
  console.log(`descargando municipios offset ${offset}…`);
  const res = await fetch(`${SVC}?${q}`);
  if (!res.ok) throw new Error(`ArcGIS HTTP ${res.status}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

async function main() {
  const p0 = await descargaPagina(0);
  const p1 = await descargaPagina(2000);

  // Combina, normaliza campos, simplifica y limpia -> GeoJSON de una capa.
  const simpl = resolve(__dirname, "municipios.simpl.geojson");
  await mapshaper.runCommands(
    `-i "${p0}" "${p1}" combine-files -merge-layers force ` +
      `-rename-fields cvegeo=CVEGEO,cve_ent=CVE_ENT,cve_mun=CVE_MUN,nombre=NOMGEO ` +
      `-filter-fields cvegeo,cve_ent,cve_mun,nombre ` +
      `-simplify 6% keep-shapes -clean -o "${simpl}" format=geojson`,
  );

  const fc = JSON.parse(await readFile(simpl, "utf8"));
  const feats = fc.features;
  if (feats.length < 2400) throw new Error(`esperaba ~2,475 municipios, hallé ${feats.length}`);

  // Índice ligero (sin geometría).
  const index = feats.map((f) => f.properties).sort((a, b) => a.cvegeo.localeCompare(b.cvegeo));
  await writeFile(resolve(root, "data/municipios-index.json"), JSON.stringify(index));

  // Un TopoJSON por estado (carga bajo demanda).
  const dir = resolve(root, "data/municipios");
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const estados = [...new Set(feats.map((f) => f.properties.cve_ent))].sort();
  for (const cve of estados) {
    const sub = {
      type: "FeatureCollection",
      features: feats.filter((f) => f.properties.cve_ent === cve),
    };
    const out = await mapshaper.applyCommands("-i muni.json -clean -o out.json format=topojson", {
      "muni.json": JSON.stringify(sub),
    });
    await writeFile(resolve(dir, `${cve}.json`), out["out.json"]);
  }
  console.log(`listo: ${estados.length} estados, ${index.length} municipios`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
