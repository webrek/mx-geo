/**
 * Caso típico: tienes una tabla con el estado escrito "como sea" (CSV, captura
 * a mano, otra base) y quieres cruzarla con tus datos por CVE_ENT. `normalizaEstado`
 * resuelve clave, ISO, nombre, abreviatura y alias ("CDMX", "DF", "Edomex"…).
 */
import { normalizaEstado, estado } from "@webrek/mx-geo";

type Fila = { estadoTexto: string; ventas: number };

const filas: Fila[] = [
  { estadoTexto: "CDMX", ventas: 1200 },
  { estadoTexto: "Distrito Federal", ventas: 300 }, // mismo estado, otra grafía
  { estadoTexto: "edo. mex.", ventas: 1500 },
  { estadoTexto: "nuevo leon", ventas: 760 },
  { estadoTexto: "Narnia", ventas: 99 }, // no es un estado → se descarta
];

// Agrega ventas por CVE_ENT, listo para <MapaMexico data={...} />.
const porEstado: Record<string, number> = {};
const sinResolver: string[] = [];

for (const f of filas) {
  const cve = normalizaEstado(f.estadoTexto);
  if (!cve) {
    sinResolver.push(f.estadoTexto);
    continue;
  }
  porEstado[cve] = (porEstado[cve] ?? 0) + f.ventas;
}

console.log(porEstado); // { "09": 1500, "15": 1500, "19": 760 }
console.log("no resueltos:", sinResolver); // ["Narnia"]
console.log("09 =", estado("09")?.nombre); // "Ciudad de México"
