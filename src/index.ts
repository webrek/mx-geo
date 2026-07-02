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
  escalaJenks,
  escalaUmbral,
  rupturasJenks,
  escalaCategorica,
  coloresCategorias,
  type Paleta,
  type PaletaInput,
  type NombrePaleta,
  type NombrePaletaDivergente,
  type TramoCuantil,
  type EscalaTramos,
} from "./colores";

// Helpers de agregación
export { agregaMunicipiosAEstado } from "./agrega";

// Tasas y densidad (usan el catálogo enriquecido)
export { tasa, porCapita, porKm2, densidadPoblacion, type Denominador } from "./tasas";

// Centroides por estado (para etiquetas y burbujas)
export { CENTROIDES_ESTADOS, centroideEstado, type LonLat } from "./centroides";

// Geocodificación inversa: coordenada -> estado (point-in-polygon)
export { estadoDeCoordenada } from "./geocode";

// Diagnóstico de joins: qué se emparejó con el catálogo y qué no
export { uneEstados, type ResultadoUnion, type FilaEmparejada, type FilaSinMatch } from "./une";

// Cartograma de mosaicos (rejilla de estados)
export { MOSAICO_ESTADOS, MOSAICO_COLUMNAS, MOSAICO_FILAS, type Celda } from "./mosaico";

// Adyacencia (estados colindantes)
export { VECINOS, vecinos, estadosVecinos, sonVecinos } from "./vecinos";

/**
 * TopoJSON de los 32 estados, llaveado por `cve` (CVE_ENT de INEGI) en las
 * propiedades de cada geometría. Geometría: Marco Geoestadístico de INEGI
 * (municipios disueltos por estado), simplificada. El objeto se llama `estados`.
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
