import { ESTADOS } from "./estados.generated";

const PORCVE = new Map(ESTADOS.map((e) => [e.cve, e]));

/** Denominador de una tasa: un campo del catálogo o tu propio mapa por CVE_ENT. */
export type Denominador = "poblacion" | "superficie" | Record<string, number>;

function denomDe(cve: string, entre: Denominador): number | undefined {
  if (entre === "poblacion") return PORCVE.get(cve)?.poblacion;
  if (entre === "superficie") return PORCVE.get(cve)?.superficie;
  return entre[cve];
}

/**
 * Convierte valores absolutos por estado en una **tasa**, dividiendo entre un
 * denominador (población o superficie del catálogo, o tu propio mapa) y
 * multiplicando por `factor`. Omite estados sin denominador o con denominador 0.
 *
 * @example
 * tasa(casos, "poblacion", 100_000) // casos por 100 mil habitantes
 * tasa(ventas, "superficie")        // ventas por km²
 */
export function tasa(
  data: Record<string, number>,
  entre: Denominador,
  factor = 1,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [cve, valor] of Object.entries(data)) {
    if (!Number.isFinite(valor)) continue;
    const d = denomDe(cve, entre);
    if (d == null || !Number.isFinite(d) || d === 0) continue;
    out[cve] = (valor / d) * factor;
  }
  return out;
}

/** Tasa por cada `por` habitantes (Censo 2020). Por defecto, por habitante. */
export function porCapita(data: Record<string, number>, por = 1): Record<string, number> {
  return tasa(data, "poblacion", por);
}

/** Tasa por km² de superficie estatal. */
export function porKm2(data: Record<string, number>): Record<string, number> {
  return tasa(data, "superficie");
}

/**
 * Densidad de población (habitantes por km²) de los 32 estados, a partir del
 * catálogo. Útil como capa base o para comparar.
 */
export function densidadPoblacion(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of ESTADOS) out[e.cve] = e.poblacion / e.superficie;
  return out;
}
