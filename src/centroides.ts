import centroidesData from "../data/centroides-estados.json";

/** Coordenada geográfica `[longitud, latitud]` en grados. */
export type LonLat = [number, number];

/**
 * Centroide `[lon, lat]` de cada estado (CVE_ENT), precalculado en tiempo de
 * build sobre la geometría de INEGI. Útil para colocar etiquetas o burbujas.
 */
export const CENTROIDES_ESTADOS = centroidesData as unknown as Record<string, LonLat>;

/** Devuelve el centroide `[lon, lat]` del estado, o `null` si la clave no existe. */
export function centroideEstado(cve: string): LonLat | null {
  return CENTROIDES_ESTADOS[cve] ?? null;
}
