import type { Estado } from "./types";
import { ESTADOS } from "./estados.generated";

/**
 * Una región agrupa varios estados. La clave (`reg`) es la usada en el campo
 * `region` de cada `Estado`.
 */
export interface Region {
  /** Clave corta de la región (p. ej. "norte"). */
  reg: string;
  /** Nombre de la región (p. ej. "Norte"). */
  nombre: string;
  /** Claves INEGI (CVE_ENT) de los estados que la integran. */
  estados: string[];
}

/**
 * Regionalización de **Banxico** (Reporte sobre las Economías Regionales):
 * cuatro regiones —Norte, Centro Norte, Centro y Sur— ampliamente usadas para
 * análisis económico. Es la que alimenta el campo `region` del catálogo.
 *
 * Fuente: Banco de México, "Reporte sobre las Economías Regionales".
 */
export const REGIONES: readonly Region[] = [
  {
    reg: "norte",
    nombre: "Norte",
    estados: ["02", "03", "05", "08", "19", "25", "26", "28"],
    // BC, BCS, Coahuila, Chihuahua, Nuevo León, Sinaloa, Sonora, Tamaulipas
  },
  {
    reg: "centro-norte",
    nombre: "Centro Norte",
    estados: ["01", "06", "10", "11", "14", "16", "18", "22", "24", "32"],
    // Ags, Colima, Durango, Guanajuato, Jalisco, Michoacán, Nayarit,
    // Querétaro, San Luis Potosí, Zacatecas
  },
  {
    reg: "centro",
    nombre: "Centro",
    estados: ["09", "13", "15", "17", "21", "29"],
    // CDMX, Hidalgo, Estado de México, Morelos, Puebla, Tlaxcala
  },
  {
    reg: "sur",
    nombre: "Sur",
    estados: ["04", "07", "12", "20", "23", "27", "30", "31"],
    // Campeche, Chiapas, Guerrero, Oaxaca, Quintana Roo, Tabasco,
    // Veracruz, Yucatán
  },
];

const PORREG = new Map<string, Region>(REGIONES.map((r) => [r.reg, r]));

/** Devuelve la región con esa clave, o `null`. */
export function region(reg: string): Region | null {
  return PORREG.get(reg) ?? null;
}

/** Estados (objetos `Estado`) que integran una región. */
export function estadosDeRegion(reg: string): Estado[] {
  const r = PORREG.get(reg);
  if (!r) return [];
  const set = new Set(r.estados);
  return ESTADOS.filter((e) => set.has(e.cve));
}

/**
 * Mapa `CVE_ENT -> clave de región`, listo para pasarlo como `categorias` a
 * `<MapaMexico>` y pintar el país por región.
 */
export const REGION_POR_ESTADO: Readonly<Record<string, string>> = (() => {
  const m: Record<string, string> = {};
  for (const r of REGIONES) for (const cve of r.estados) m[cve] = r.reg;
  return m;
})();
