/**
 * Geocodificación inversa: de una coordenada `[lon, lat]` a la clave del estado
 * (CVE_ENT) que la contiene. Usa *point-in-polygon* esférico (`d3-geo`) sobre
 * las mismas geometrías de INEGI que pinta el mapa — sin API keys ni red.
 *
 * El nivel municipio vive en el subpath `@webrek/mx-geo/municipios`
 * (`municipioDeCoordenada`), porque carga la geometría municipal bajo demanda.
 */
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import estadosTopo from "../data/estados.topo.json";
import type { EstadosTopoJSON } from "./index";
import type { LonLat } from "./centroides";

const TOPO = estadosTopo as unknown as EstadosTopoJSON;

// Los 32 estados como features de GeoJSON, calculados una sola vez (perezoso).
let FEATURES: Array<{ cve: string; geometria: Feature<Geometry> }> | null = null;

function features(): Array<{ cve: string; geometria: Feature<Geometry> }> {
  if (FEATURES) return FEATURES;
  const fc = feature(TOPO as never, TOPO.objects.estados as never) as unknown as FeatureCollection<
    Geometry,
    { cve: string }
  >;
  FEATURES = fc.features.map((f) => ({ cve: String(f.properties.cve), geometria: f }));
  return FEATURES;
}

/**
 * Devuelve la clave INEGI (CVE_ENT) del estado que contiene la coordenada
 * `[longitud, latitud]` en grados, o `null` si cae fuera de México (mar,
 * frontera, valores no finitos).
 *
 * ```ts
 * estadoDeCoordenada([-99.1332, 19.4326]); // "09" (Ciudad de México)
 * estadoDeCoordenada([-103.3496, 20.6597]); // "14" (Jalisco)
 * estadoDeCoordenada([-120, 20]); // null (Pacífico)
 * ```
 */
export function estadoDeCoordenada(punto: LonLat): string | null {
  const [lon, lat] = punto;
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  for (const { cve, geometria } of features()) {
    if (geoContains(geometria as never, punto)) return cve;
  }
  return null;
}
