/**
 * Construye scripts/municipios.geojson a partir del TopoJSON de
 * diegovalle/mxmaps (derivado de INEGI): los 2,436 municipios con su CVEGEO
 * de 5 dígitos (CVE_ENT + CVE_MUN) y nombre. Luego se simplifica a TopoJSON
 * con mapshaper (ver el script build:data:municipios en package.json).
 *
 * Uso:  node scripts/build-municipios.mjs
 */
import { readFile, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { feature } from "topojson-client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, "mx_tj.json");
const URL = "https://gist.githubusercontent.com/diegovalle/5129746/raw/mx_tj.json";

const pad = (n, w) => String(n).padStart(w, "0");

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(SRC))) {
    console.log("descargando mx_tj.json (diegovalle/mxmaps)…");
    const res = await fetch(URL);
    if (!res.ok) throw new Error(`no se pudo bajar el gist: HTTP ${res.status}`);
    await writeFile(SRC, Buffer.from(await res.arrayBuffer()));
  }

  const topo = JSON.parse(await readFile(SRC, "utf8"));
  const fc = feature(topo, topo.objects.municipalities);

  const features = fc.features.map((f) => {
    const p = f.properties;
    const cve_ent = pad(p.state_code, 2);
    const cve_mun = pad(p.mun_code, 3);
    return {
      type: "Feature",
      properties: { cvegeo: cve_ent + cve_mun, cve_ent, cve_mun, nombre: p.mun_name },
      geometry: f.geometry,
    };
  });

  if (features.length < 2000) {
    throw new Error(`esperaba ~2,436 municipios, encontré ${features.length}`);
  }

  const out = resolve(__dirname, "municipios.geojson");
  await writeFile(out, JSON.stringify({ type: "FeatureCollection", features }));
  console.log(`escrito ${out} (${features.length} municipios)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
