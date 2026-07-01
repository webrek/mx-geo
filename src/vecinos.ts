import vecinosData from "../data/vecinos.json";
import type { Estado } from "./types";
import { ESTADOS } from "./estados.generated";

/** Mapa `CVE_ENT -> claves de los estados colindantes`. */
export const VECINOS = vecinosData as Record<string, string[]>;

const PORCVE = new Map<string, Estado>(ESTADOS.map((e) => [e.cve, e]));

/** Claves INEGI de los estados que colindan con `cve`. */
export function vecinos(cve: string): string[] {
  return (VECINOS[cve] ?? []).slice();
}

/** Estados (objetos `Estado`) que colindan con `cve`. */
export function estadosVecinos(cve: string): Estado[] {
  return vecinos(cve)
    .map((c) => PORCVE.get(c))
    .filter((e): e is Estado => e != null);
}

/** ¿`a` y `b` colindan? */
export function sonVecinos(a: string, b: string): boolean {
  return (VECINOS[a] ?? []).includes(b);
}
