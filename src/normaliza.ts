import type { Estado } from "./types";
import { ESTADOS } from "./estados.generated";

/** Minúsculas, sin acentos, sin puntos, espacios colapsados. */
export function normaliza(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita diacríticos
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Índice de búsqueda: cada forma normalizada -> estado.
const INDICE: Map<string, Estado> = (() => {
  const m = new Map<string, Estado>();
  for (const e of ESTADOS) {
    const formas = [
      e.cve, // "09"
      String(Number(e.cve)), // "9"
      e.iso, // "mx-cmx"
      e.iso.replace(/^MX-/, ""), // "cmx"
      e.nombre,
      e.nombreCorto,
      e.abreviatura,
      ...e.alias,
    ];
    for (const f of formas) {
      const key = normaliza(f);
      if (key && !m.has(key)) m.set(key, e);
    }
  }
  return m;
})();

/**
 * Encuentra un estado a partir de casi cualquier forma de escribirlo: clave
 * INEGI ("09" o "9"), ISO ("MX-CMX"), nombre, nombre corto, abreviatura o
 * alias ("CDMX", "Distrito Federal", "DF", "Edomex"…). Devuelve `null` si no
 * hay coincidencia.
 */
export function buscaEstado(entrada: string | number): Estado | null {
  if (entrada == null) return null;
  return INDICE.get(normaliza(String(entrada))) ?? null;
}

/**
 * Como {@link buscaEstado} pero devuelve solo la clave INEGI (CVE_ENT) o `null`.
 * Útil para normalizar una columna de texto a clave antes de un *join*.
 */
export function normalizaEstado(entrada: string | number): string | null {
  return buscaEstado(entrada)?.cve ?? null;
}
