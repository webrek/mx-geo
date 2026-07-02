/**
 * Cruza (*join*) una tabla tuya contra el catálogo de estados y te dice
 * exactamente qué se emparejó y qué no — para que puedas confiar en el mapa y
 * limpiar tus datos, en vez de perder filas en silencio.
 */
import type { Estado } from "./types";
import { ESTADOS } from "./estados.generated";
import { buscaEstado } from "./normaliza";

/** Una fila cuyo estado sí se resolvió a una clave INEGI. */
export interface FilaEmparejada<T> {
  /** CVE_ENT resuelta (dos dígitos). */
  cve: string;
  /** El estado del catálogo. */
  estado: Estado;
  /** La fila original. */
  fila: T;
}

/** Una fila cuyo estado no se pudo resolver. */
export interface FilaSinMatch<T> {
  /** El valor original que no matcheó (útil para depurar tus datos). */
  valor: unknown;
  /** La fila original. */
  fila: T;
}

/** Resultado de {@link uneEstados}: el join, con su diagnóstico. */
export interface ResultadoUnion<T> {
  /** Filas resueltas, con su clave y su estado. */
  emparejados: Array<FilaEmparejada<T>>;
  /** Filas cuyo valor de estado no se reconoció. */
  sinMatch: Array<FilaSinMatch<T>>;
  /** CVE_ENT que al menos una fila cubrió (sin repetir, orden INEGI). */
  cubiertos: string[];
  /** CVE_ENT de estados que ninguna fila cubrió (saldrían vacíos en el mapa). */
  faltantes: string[];
}

/**
 * Cruza cada fila con el catálogo usando {@link buscaEstado} (acepta clave,
 * ISO, nombre, abreviatura o alias) y reporta el resultado del join.
 *
 * ```ts
 * const { emparejados, sinMatch, faltantes } = uneEstados(ventas, (r) => r.estado);
 * // sinMatch → filas con "Edo Mex ", "D.F.", etc. que debes limpiar
 * // faltantes → estados sin ventas que el mapa pintará vacíos
 * ```
 *
 * @param filas   Tus registros.
 * @param clave   Extrae de cada fila el texto/clave del estado.
 */
export function uneEstados<T>(
  filas: readonly T[],
  clave: (fila: T) => string | number | null | undefined,
): ResultadoUnion<T> {
  const emparejados: Array<FilaEmparejada<T>> = [];
  const sinMatch: Array<FilaSinMatch<T>> = [];
  const cubiertosSet = new Set<string>();

  for (const fila of filas) {
    const valor = clave(fila);
    const estado = valor == null ? null : buscaEstado(valor);
    if (estado) {
      emparejados.push({ cve: estado.cve, estado, fila });
      cubiertosSet.add(estado.cve);
    } else {
      sinMatch.push({ valor, fila });
    }
  }

  const cubiertos = ESTADOS.map((e) => e.cve).filter((cve) => cubiertosSet.has(cve));
  const faltantes = ESTADOS.map((e) => e.cve).filter((cve) => !cubiertosSet.has(cve));

  return { emparejados, sinMatch, cubiertos, faltantes };
}
