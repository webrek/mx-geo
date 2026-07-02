/**
 * Diagnóstico de joins: como `05-normaliza-join`, pero con el reporte completo
 * en una sola llamada — qué filas se emparejaron, cuáles no (y con qué valor,
 * para limpiar tu fuente) y qué estados quedarán vacíos en el mapa.
 */
import { uneEstados } from "@webrek/mx-geo";

type Fila = { estadoTexto: string | null; ventas: number };

const filas: Fila[] = [
  { estadoTexto: "CDMX", ventas: 1200 },
  { estadoTexto: "nuevo leon", ventas: 760 },
  { estadoTexto: "MX-JAL", ventas: 430 },
  { estadoTexto: "Narnia", ventas: 99 }, // no existe
  { estadoTexto: null, ventas: 5 }, // sin capturar
];

const { emparejados, sinMatch, cubiertos, faltantes } = uneEstados(filas, (f) => f.estadoTexto);

// 1) El join, con la fila original y el estado completo del catálogo.
const porEstado: Record<string, number> = {};
for (const { cve, fila } of emparejados) {
  porEstado[cve] = (porEstado[cve] ?? 0) + fila.ventas;
}
console.log(porEstado); // { "09": 1200, "14": 430, "19": 760 }

// 2) Lo que NO matcheó, con el valor original — arregla la fuente, no el síntoma.
console.log(sinMatch.map((s) => s.valor)); // ["Narnia", null]

// 3) Cobertura: qué estados pintará el mapa y cuáles saldrán vacíos.
console.log(cubiertos); // ["09", "14", "19"]
console.log(`faltan ${faltantes.length} estados sin datos`); // 29
