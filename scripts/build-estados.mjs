/**
 * Genera el TopoJSON de los 32 estados **disolviendo los municipios de INEGI**
 * (data/municipios/<CVE_ENT>.json) en un solo polígono por estado. Así los
 * estados usan la MISMA geometría de alta resolución que el drill-down (bordes
 * que coinciden exactamente) en vez de la versión muy simplificada de Natural
 * Earth, que se veía poligonal.
 *
 * Uso:  node scripts/build-estados.mjs [simplify%] [precision]
 *        (por defecto 8% y 0.0004° ≈ 45 m: suave a escala nacional, ~75 KB gzip)
 *
 * Los nombres/abreviaturas (cve, nombre, abr) se toman de scripts/estados.geojson
 * (que produce build-data.mjs), para no re-declararlos aquí.
 */
import { readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import mapshaper from "mapshaper";
import { feature } from "topojson-client";
import { geoCentroid } from "d3-geo";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const munDir = resolve(root, "data/municipios");
const salida = resolve(root, "data/estados.topo.json");
const salidaCentroides = resolve(root, "data/centroides-estados.json");
const simplify = process.argv[2] ?? "8%";
const precision = process.argv[3] ?? "0.0004";

async function main() {
  const claves = Array.from({ length: 32 }, (_, i) => String(i + 1).padStart(2, "0"));
  const entradas = claves.map((c) => `"${resolve(munDir, `${c}.json`)}"`).join(" ");

  // Combina los 32 TopoJSON de municipios, los funde por estado (dissolve2 cierra
  // huecos/slivers entre municipios contiguos), simplifica y saca TopoJSON.
  const tmp = resolve(__dirname, "estados-from-mun.topo.json");
  await mapshaper.runCommands(
    `-i ${entradas} combine-files -merge-layers force ` +
      `-dissolve2 cve_ent ` +
      `-each "cve=cve_ent" -filter-fields cve ` +
      `-simplify ${simplify} keep-shapes -clean ` +
      `-rename-layers estados ` +
      `-o "${tmp}" format=topojson precision=${precision}`,
  );

  // Nombres/abreviaturas desde scripts/estados.geojson (lo genera build-data.mjs).
  const cat = JSON.parse(await readFile(resolve(__dirname, "estados.geojson"), "utf8"));
  const nombres = new Map(cat.features.map((f) => [f.properties.cve, f.properties]));

  const topo = JSON.parse(await readFile(tmp, "utf8"));
  const geoms = topo.objects.estados.geometries;
  if (geoms.length !== 32) throw new Error(`esperaba 32 estados, hallé ${geoms.length}`);

  for (const g of geoms) {
    const meta = nombres.get(g.properties.cve);
    if (!meta) throw new Error(`sin nombre para la clave ${g.properties.cve}`);
    g.properties = { cve: meta.cve, nombre: meta.nombre, abr: meta.abr };
  }
  geoms.sort((a, b) => a.properties.cve.localeCompare(b.properties.cve));

  await writeFile(salida, JSON.stringify(topo));
  await rm(tmp, { force: true });
  console.log(`escrito ${salida} (${geoms.length} estados, simplify ${simplify})`);

  // Centroides [lon, lat] por estado, para etiquetas y burbujas (sin d3 en runtime).
  const fc = feature(topo, topo.objects.estados);
  const centroides = {};
  for (const f of fc.features) {
    const [lon, lat] = geoCentroid(f);
    centroides[f.properties.cve] = [Math.round(lon * 1e4) / 1e4, Math.round(lat * 1e4) / 1e4];
  }
  await writeFile(salidaCentroides, JSON.stringify(centroides));
  console.log(`escrito ${salidaCentroides} (${Object.keys(centroides).length} centroides)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
