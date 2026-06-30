/**
 * Construye los artefactos de datos de @webrek/mx-geo a partir de Natural Earth
 * (dominio público): el catálogo tipado de los 32 estados (src/estados.generated.ts)
 * y un GeoJSON limpio y delgado que luego se simplifica a TopoJSON con mapshaper.
 *
 * Uso:  node scripts/build-data.mjs
 *
 * Requiere el archivo scripts/ne10_admin1.geojson (Natural Earth 10m admin-1).
 * Si no existe, lo descarga.
 */
import { readFile, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const NE_PATH = resolve(__dirname, "ne10_admin1.geojson");
const NE_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";

/**
 * Catálogo oficial. `cve` = CVE_ENT de INEGI (orden alfabético oficial).
 * `ne` = código que usa Natural Earth en iso_3166_2 (sin "MX-"); para CDMX
 * Natural Earth sigue usando el viejo "DIF".
 * `iso` = ISO 3166-2 vigente. `alias` = formas de entrada aceptadas por la
 * normalización (se comparan ya en minúsculas y sin acentos).
 */
const CATALOGO = [
  {
    cve: "01",
    ne: "AGU",
    iso: "MX-AGU",
    nombre: "Aguascalientes",
    corto: "Aguascalientes",
    abr: "Ags.",
    capital: "Aguascalientes",
    alias: [],
  },
  {
    cve: "02",
    ne: "BCN",
    iso: "MX-BCN",
    nombre: "Baja California",
    corto: "Baja California",
    abr: "BC",
    capital: "Mexicali",
    alias: ["bc"],
  },
  {
    cve: "03",
    ne: "BCS",
    iso: "MX-BCS",
    nombre: "Baja California Sur",
    corto: "Baja California Sur",
    abr: "BCS",
    capital: "La Paz",
    alias: ["bcs"],
  },
  {
    cve: "04",
    ne: "CAM",
    iso: "MX-CAM",
    nombre: "Campeche",
    corto: "Campeche",
    abr: "Camp.",
    capital: "San Francisco de Campeche",
    alias: [],
  },
  {
    cve: "05",
    ne: "COA",
    iso: "MX-COA",
    nombre: "Coahuila de Zaragoza",
    corto: "Coahuila",
    abr: "Coah.",
    capital: "Saltillo",
    alias: ["coahuila"],
  },
  {
    cve: "06",
    ne: "COL",
    iso: "MX-COL",
    nombre: "Colima",
    corto: "Colima",
    abr: "Col.",
    capital: "Colima",
    alias: [],
  },
  {
    cve: "07",
    ne: "CHP",
    iso: "MX-CHP",
    nombre: "Chiapas",
    corto: "Chiapas",
    abr: "Chis.",
    capital: "Tuxtla Gutiérrez",
    alias: [],
  },
  {
    cve: "08",
    ne: "CHH",
    iso: "MX-CHH",
    nombre: "Chihuahua",
    corto: "Chihuahua",
    abr: "Chih.",
    capital: "Chihuahua",
    alias: [],
  },
  {
    cve: "09",
    ne: "DIF",
    iso: "MX-CMX",
    nombre: "Ciudad de México",
    corto: "Ciudad de México",
    abr: "CDMX",
    capital: "Ciudad de México",
    alias: ["cdmx", "df", "distrito federal", "ciudad de mexico"],
  },
  {
    cve: "10",
    ne: "DUR",
    iso: "MX-DUR",
    nombre: "Durango",
    corto: "Durango",
    abr: "Dgo.",
    capital: "Victoria de Durango",
    alias: [],
  },
  {
    cve: "11",
    ne: "GUA",
    iso: "MX-GUA",
    nombre: "Guanajuato",
    corto: "Guanajuato",
    abr: "Gto.",
    capital: "Guanajuato",
    alias: [],
  },
  {
    cve: "12",
    ne: "GRO",
    iso: "MX-GRO",
    nombre: "Guerrero",
    corto: "Guerrero",
    abr: "Gro.",
    capital: "Chilpancingo de los Bravo",
    alias: [],
  },
  {
    cve: "13",
    ne: "HID",
    iso: "MX-HID",
    nombre: "Hidalgo",
    corto: "Hidalgo",
    abr: "Hgo.",
    capital: "Pachuca de Soto",
    alias: [],
  },
  {
    cve: "14",
    ne: "JAL",
    iso: "MX-JAL",
    nombre: "Jalisco",
    corto: "Jalisco",
    abr: "Jal.",
    capital: "Guadalajara",
    alias: [],
  },
  {
    cve: "15",
    ne: "MEX",
    iso: "MX-MEX",
    nombre: "México",
    corto: "Estado de México",
    abr: "Méx.",
    capital: "Toluca de Lerdo",
    alias: ["estado de mexico", "edomex", "edo. mex.", "edo mex"],
  },
  {
    cve: "16",
    ne: "MIC",
    iso: "MX-MIC",
    nombre: "Michoacán de Ocampo",
    corto: "Michoacán",
    abr: "Mich.",
    capital: "Morelia",
    alias: ["michoacan"],
  },
  {
    cve: "17",
    ne: "MOR",
    iso: "MX-MOR",
    nombre: "Morelos",
    corto: "Morelos",
    abr: "Mor.",
    capital: "Cuernavaca",
    alias: [],
  },
  {
    cve: "18",
    ne: "NAY",
    iso: "MX-NAY",
    nombre: "Nayarit",
    corto: "Nayarit",
    abr: "Nay.",
    capital: "Tepic",
    alias: [],
  },
  {
    cve: "19",
    ne: "NLE",
    iso: "MX-NLE",
    nombre: "Nuevo León",
    corto: "Nuevo León",
    abr: "NL",
    capital: "Monterrey",
    alias: ["nl", "nuevo leon"],
  },
  {
    cve: "20",
    ne: "OAX",
    iso: "MX-OAX",
    nombre: "Oaxaca",
    corto: "Oaxaca",
    abr: "Oax.",
    capital: "Oaxaca de Juárez",
    alias: [],
  },
  {
    cve: "21",
    ne: "PUE",
    iso: "MX-PUE",
    nombre: "Puebla",
    corto: "Puebla",
    abr: "Pue.",
    capital: "Puebla de Zaragoza",
    alias: [],
  },
  {
    cve: "22",
    ne: "QUE",
    iso: "MX-QUE",
    nombre: "Querétaro",
    corto: "Querétaro",
    abr: "Qro.",
    capital: "Santiago de Querétaro",
    alias: ["queretaro"],
  },
  {
    cve: "23",
    ne: "ROO",
    iso: "MX-ROO",
    nombre: "Quintana Roo",
    corto: "Quintana Roo",
    abr: "Q.R.",
    capital: "Chetumal",
    alias: ["quintana roo", "qroo", "qr"],
  },
  {
    cve: "24",
    ne: "SLP",
    iso: "MX-SLP",
    nombre: "San Luis Potosí",
    corto: "San Luis Potosí",
    abr: "SLP",
    capital: "San Luis Potosí",
    alias: ["slp", "san luis potosi"],
  },
  {
    cve: "25",
    ne: "SIN",
    iso: "MX-SIN",
    nombre: "Sinaloa",
    corto: "Sinaloa",
    abr: "Sin.",
    capital: "Culiacán Rosales",
    alias: [],
  },
  {
    cve: "26",
    ne: "SON",
    iso: "MX-SON",
    nombre: "Sonora",
    corto: "Sonora",
    abr: "Son.",
    capital: "Hermosillo",
    alias: [],
  },
  {
    cve: "27",
    ne: "TAB",
    iso: "MX-TAB",
    nombre: "Tabasco",
    corto: "Tabasco",
    abr: "Tab.",
    capital: "Villahermosa",
    alias: [],
  },
  {
    cve: "28",
    ne: "TAM",
    iso: "MX-TAM",
    nombre: "Tamaulipas",
    corto: "Tamaulipas",
    abr: "Tamps.",
    capital: "Ciudad Victoria",
    alias: [],
  },
  {
    cve: "29",
    ne: "TLA",
    iso: "MX-TLA",
    nombre: "Tlaxcala",
    corto: "Tlaxcala",
    abr: "Tlax.",
    capital: "Tlaxcala de Xicohténcatl",
    alias: [],
  },
  {
    cve: "30",
    ne: "VER",
    iso: "MX-VER",
    nombre: "Veracruz de Ignacio de la Llave",
    corto: "Veracruz",
    abr: "Ver.",
    capital: "Xalapa-Enríquez",
    alias: ["veracruz"],
  },
  {
    cve: "31",
    ne: "YUC",
    iso: "MX-YUC",
    nombre: "Yucatán",
    corto: "Yucatán",
    abr: "Yuc.",
    capital: "Mérida",
    alias: ["yucatan"],
  },
  {
    cve: "32",
    ne: "ZAC",
    iso: "MX-ZAC",
    nombre: "Zacatecas",
    corto: "Zacatecas",
    abr: "Zac.",
    capital: "Zacatecas",
    alias: [],
  },
];

/**
 * Datos por estado (CVE_ENT) que enriquecen el catálogo:
 *  - `region`: clave de la regionalización de Banxico (ver src/regiones.ts).
 *  - `poblacion`: población total del Censo de Población y Vivienda 2020 (INEGI).
 *  - `superficie`: superficie en km² (INEGI, valores de referencia).
 *  - `huso`: zona horaria IANA principal del estado (México sin DST desde 2022,
 *    salvo municipios fronterizos del norte).
 */
const DATOS = {
  "01": {
    region: "centro-norte",
    poblacion: 1425607,
    superficie: 5618,
    huso: "America/Mexico_City",
  },
  "02": { region: "norte", poblacion: 3769020, superficie: 71450, huso: "America/Tijuana" },
  "03": { region: "norte", poblacion: 798447, superficie: 73909, huso: "America/Mazatlan" },
  "04": { region: "sur", poblacion: 928363, superficie: 57484, huso: "America/Merida" },
  "05": { region: "norte", poblacion: 3146771, superficie: 151563, huso: "America/Monterrey" },
  "06": {
    region: "centro-norte",
    poblacion: 731391,
    superficie: 5627,
    huso: "America/Mexico_City",
  },
  "07": { region: "sur", poblacion: 5543828, superficie: 73311, huso: "America/Mexico_City" },
  "08": { region: "norte", poblacion: 3741869, superficie: 247460, huso: "America/Chihuahua" },
  "09": { region: "centro", poblacion: 9209944, superficie: 1495, huso: "America/Mexico_City" },
  10: {
    region: "centro-norte",
    poblacion: 1832650,
    superficie: 123367,
    huso: "America/Mexico_City",
  },
  11: {
    region: "centro-norte",
    poblacion: 6166934,
    superficie: 30608,
    huso: "America/Mexico_City",
  },
  12: { region: "sur", poblacion: 3540685, superficie: 63596, huso: "America/Mexico_City" },
  13: { region: "centro", poblacion: 3082841, superficie: 20856, huso: "America/Mexico_City" },
  14: {
    region: "centro-norte",
    poblacion: 8348151,
    superficie: 78588,
    huso: "America/Mexico_City",
  },
  15: { region: "centro", poblacion: 16992418, superficie: 22357, huso: "America/Mexico_City" },
  16: {
    region: "centro-norte",
    poblacion: 4748846,
    superficie: 58599,
    huso: "America/Mexico_City",
  },
  17: { region: "centro", poblacion: 1971520, superficie: 4879, huso: "America/Mexico_City" },
  18: { region: "centro-norte", poblacion: 1235456, superficie: 27857, huso: "America/Mazatlan" },
  19: { region: "norte", poblacion: 5784442, superficie: 64156, huso: "America/Monterrey" },
  20: { region: "sur", poblacion: 4132148, superficie: 93757, huso: "America/Mexico_City" },
  21: { region: "centro", poblacion: 6583278, superficie: 34290, huso: "America/Mexico_City" },
  22: {
    region: "centro-norte",
    poblacion: 2368467,
    superficie: 11699,
    huso: "America/Mexico_City",
  },
  23: { region: "sur", poblacion: 1857985, superficie: 42361, huso: "America/Cancun" },
  24: {
    region: "centro-norte",
    poblacion: 2822255,
    superficie: 60983,
    huso: "America/Mexico_City",
  },
  25: { region: "norte", poblacion: 3026943, superficie: 57377, huso: "America/Mazatlan" },
  26: { region: "norte", poblacion: 2944840, superficie: 179503, huso: "America/Hermosillo" },
  27: { region: "sur", poblacion: 2402598, superficie: 24731, huso: "America/Mexico_City" },
  28: { region: "norte", poblacion: 3527735, superficie: 80175, huso: "America/Monterrey" },
  29: { region: "centro", poblacion: 1342977, superficie: 3997, huso: "America/Mexico_City" },
  30: { region: "sur", poblacion: 8062579, superficie: 71826, huso: "America/Mexico_City" },
  31: { region: "sur", poblacion: 2320898, superficie: 39524, huso: "America/Merida" },
  32: {
    region: "centro-norte",
    poblacion: 1622138,
    superficie: 75275,
    huso: "America/Mexico_City",
  },
};

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(NE_PATH))) {
    console.log("descargando Natural Earth 10m admin-1…");
    const res = await fetch(NE_URL);
    if (!res.ok) throw new Error(`no se pudo bajar NE: HTTP ${res.status}`);
    await writeFile(NE_PATH, Buffer.from(await res.arrayBuffer()));
  }

  const ne = JSON.parse(await readFile(NE_PATH, "utf8"));
  const byNe = new Map(CATALOGO.map((e) => [e.ne, e]));

  const features = [];
  for (const f of ne.features) {
    if (f.properties.adm0_a3 !== "MEX") continue;
    const code = String(f.properties.iso_3166_2 || "").replace(/^MX-/, "");
    const e = byNe.get(code);
    if (!e) continue; // descarta el sliver "X01~"
    features.push({
      type: "Feature",
      properties: { cve: e.cve, nombre: e.nombre, abr: e.abr },
      geometry: f.geometry,
    });
  }
  features.sort((a, b) => a.properties.cve.localeCompare(b.properties.cve));

  if (features.length !== 32) {
    throw new Error(`esperaba 32 estados, encontré ${features.length}`);
  }

  const cleanPath = resolve(__dirname, "estados.geojson");
  await writeFile(cleanPath, JSON.stringify({ type: "FeatureCollection", features }));
  console.log(`escrito ${cleanPath} (${features.length} estados)`);

  // Catálogo TS (fuente única de verdad para la librería)
  const rows = CATALOGO.map((e) => {
    const d = DATOS[e.cve];
    if (!d) throw new Error(`falta DATOS para la clave ${e.cve}`);
    return (
      `  { cve: ${JSON.stringify(e.cve)}, nombre: ${JSON.stringify(e.nombre)}, ` +
      `nombreCorto: ${JSON.stringify(e.corto)}, abreviatura: ${JSON.stringify(e.abr)}, ` +
      `iso: ${JSON.stringify(e.iso)}, capital: ${JSON.stringify(e.capital)}, ` +
      `region: ${JSON.stringify(d.region)}, poblacion: ${d.poblacion}, ` +
      `superficie: ${d.superficie}, huso: ${JSON.stringify(d.huso)}, ` +
      `alias: ${JSON.stringify(e.alias)} },`
    );
  }).join("\n");

  const ts = `// GENERADO por scripts/build-data.mjs — no editar a mano.
import type { Estado } from "./types";

/** Los 32 estados de México con su CVE_ENT de INEGI. */
export const ESTADOS: readonly Estado[] = [
${rows}
] as const;
`;
  const tsPath = resolve(root, "src/estados.generated.ts");
  await writeFile(tsPath, ts);
  console.log(`escrito ${tsPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
