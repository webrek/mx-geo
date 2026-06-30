"use client";

import { useId, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry, FeatureCollection } from "geojson";
import municipiosTopo from "../data/municipios.topo.json";

/** Un municipio (o alcaldía) con sus claves de INEGI. */
export interface Municipio {
  /** CVEGEO de 5 dígitos: clave de entidad (2) + clave de municipio (3). */
  cvegeo: string;
  /** CVE_ENT del estado al que pertenece (2 dígitos). */
  cve_ent: string;
  /** CVE_MUN dentro del estado (3 dígitos). */
  cve_mun: string;
  /** Nombre del municipio. */
  nombre: string;
}

interface MunicipiosTopo {
  type: "Topology";
  objects: {
    municipios: { type: "GeometryCollection"; geometries: Array<{ properties: Municipio }> };
  };
  arcs: number[][][];
  transform?: { scale: [number, number]; translate: [number, number] };
}

/** TopoJSON de los 2,436 municipios, llaveado por `cvegeo`. Derivado de INEGI. */
export const municipiosTopoJSON = municipiosTopo as unknown as MunicipiosTopo;

const TODOS: readonly Municipio[] = municipiosTopoJSON.objects.municipios.geometries.map(
  (g) => g.properties,
);

/** Lista de municipios; si pasas una clave de estado (CVE_ENT) la filtra. */
export function municipios(cveEnt?: string): Municipio[] {
  return cveEnt ? TODOS.filter((m) => m.cve_ent === cveEnt) : TODOS.slice();
}

/** Devuelve un municipio por su CVEGEO, o `null`. */
export function municipio(cvegeo: string): Municipio | null {
  return TODOS.find((m) => m.cvegeo === cvegeo) ?? null;
}

type Props = {
  /** Clave del estado (CVE_ENT) cuyos municipios se dibujan, p. ej. "09". */
  estado: string;
  /** Valores por CVEGEO, p. ej. `{ "09012": 1200 }`. */
  data?: Record<string, number>;
  onSelect?: (municipio: Municipio) => void;
  colorRange?: [string, string];
  emptyColor?: string;
  stroke?: string;
  formatValue?: (valor: number, municipio: Municipio) => string;
  ariaLabel?: string;
  className?: string;
};

const WIDTH = 800;
const HEIGHT = 600;

function lerpHex(a: string, b: string, t: number): string {
  const rgb = (h: string): [number, number, number] => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = rgb(a);
  const [br, bg, bb] = rgb(b);
  const mix = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${mix(ar, br)}${mix(ag, bg)}${mix(ab, bb)}`;
}

/**
 * Mapa choropleth de los municipios de un estado. Misma idea que `<MapaMexico>`
 * pero a nivel municipal: filtra por `estado` (CVE_ENT) y ajusta el encuadre a
 * ese estado. SVG puro, sin librería de mapas ni API key.
 */
export function MapaMunicipios({
  estado,
  data,
  onSelect,
  colorRange = ["#dcfce7", "#166534"],
  emptyColor = "#e5e7eb",
  stroke = "#ffffff",
  formatValue,
  ariaLabel = "Mapa de municipios",
  className,
}: Props) {
  const titleId = useId();
  const [hover, setHover] = useState<string | null>(null);

  const { paths, min, max } = useMemo(() => {
    const full = feature(
      municipiosTopoJSON as never,
      (municipiosTopoJSON as never as { objects: { municipios: unknown } }).objects
        .municipios as never,
    ) as unknown as FeatureCollection<Geometry, Municipio>;

    const feats = full.features.filter((f) => f.properties.cve_ent === estado);
    const projection = geoMercator().fitExtent(
      [
        [12, 12],
        [WIDTH - 12, HEIGHT - 12],
      ],
      { type: "FeatureCollection", features: feats } as never,
    );
    const path = geoPath(projection);

    const vals = data ? Object.values(data).filter((v) => Number.isFinite(v)) : [];
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 0;

    const paths = feats.map((f: Feature<Geometry, Municipio>) => ({
      m: f.properties,
      d: path(f) ?? "",
    }));
    return { paths, min, max };
  }, [estado, data]);

  function fillFor(cvegeo: string): string {
    const v = data?.[cvegeo];
    if (v == null || !Number.isFinite(v)) return emptyColor;
    const t = max > min ? (v - min) / (max - min) : 1;
    return lerpHex(colorRange[0], colorRange[1], t);
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={className}
      role="img"
      aria-labelledby={titleId}
      style={{ width: "100%", height: "auto" }}
    >
      <title id={titleId}>{ariaLabel}</title>
      {paths.map(({ m, d }) => {
        const v = data?.[m.cvegeo];
        const etiqueta =
          v != null && Number.isFinite(v)
            ? `${m.nombre}: ${formatValue ? formatValue(v, m) : v}`
            : m.nombre;
        return (
          <path
            key={m.cvegeo}
            d={d}
            fill={fillFor(m.cvegeo)}
            stroke={stroke}
            strokeWidth={hover === m.cvegeo ? 1.2 : 0.4}
            style={{ cursor: onSelect ? "pointer" : "default", outline: "none" }}
            onMouseEnter={() => setHover(m.cvegeo)}
            onMouseLeave={() => setHover((h) => (h === m.cvegeo ? null : h))}
            onClick={onSelect ? () => onSelect(m) : undefined}
            data-cvegeo={m.cvegeo}
          >
            <title>{etiqueta}</title>
          </path>
        );
      })}
    </svg>
  );
}
