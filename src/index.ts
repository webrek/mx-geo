import type { Estado } from "./types";
import { ESTADOS } from "./estados.generated";
import estadosTopo from "../data/estados.topo.json";

export type { Estado };
export { ESTADOS };
export { normaliza, buscaEstado, normalizaEstado } from "./normaliza";

// Regiones / zonas
export { REGIONES, REGION_POR_ESTADO, region, estadosDeRegion, type Region } from "./regiones";

// Colores, paletas y escalas (sin React)
export {
  PALETAS,
  PALETAS_DIVERGENTES,
  PALETA_CATEGORICA,
  resuelvePaleta,
  lerpHex,
  interpolaPaleta,
  escalaSecuencial,
  escalaCuantil,
  escalaCategorica,
  coloresCategorias,
  type Paleta,
  type PaletaInput,
  type NombrePaleta,
  type NombrePaletaDivergente,
  type TramoCuantil,
} from "./colores";

// Helpers de agregación
export { agregaMunicipiosAEstado } from "./agrega";

/**
 * TopoJSON de los 32 estados, llaveado por `cve` (CVE_ENT de INEGI) en las
 * propiedades de cada geometría. Geometría: Natural Earth (dominio público),
 * simplificada. El objeto se llama `estados`.
 */
export const estadosTopoJSON = estadosTopo as unknown as EstadosTopoJSON;

/** Mapa cve -> Estado, para búsquedas O(1) por clave. */
const PORCVE = new Map<string, Estado>(ESTADOS.map((e) => [e.cve, e]));

/** Devuelve el estado con esa clave INEGI (CVE_ENT), o `null`. */
export function estado(cve: string): Estado | null {
  return PORCVE.get(cve) ?? null;
}

/** Forma mínima del TopoJSON que exporta el paquete. */
export interface EstadosTopoJSON {
  type: "Topology";
  objects: {
    estados: {
      type: "GeometryCollection";
      geometries: Array<{
        type: string;
        arcs: unknown;
        properties: { cve: string; nombre: string; abr: string };
      }>;
    };
  };
  arcs: number[][][];
  transform?: { scale: [number, number]; translate: [number, number] };
}
