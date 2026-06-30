"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry, FeatureCollection } from "geojson";
import indexData from "../data/municipios-index.json";

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

/** TopoJSON de los municipios de un estado (un objeto). */
export interface MunicipiosEstadoTopo {
  type: "Topology";
  objects: Record<
    string,
    { type: "GeometryCollection"; geometries: Array<{ properties: Municipio }> }
  >;
  arcs: number[][][];
  transform?: { scale: [number, number]; translate: [number, number] };
}

const TODOS: readonly Municipio[] = indexData as Municipio[];

/** Lista de municipios (índice ligero, sin geometría); filtra por CVE_ENT. */
export function municipios(cveEnt?: string): Municipio[] {
  return cveEnt ? TODOS.filter((m) => m.cve_ent === cveEnt) : TODOS.slice();
}

/** Devuelve un municipio por su CVEGEO, o `null`. */
export function municipio(cvegeo: string): Municipio | null {
  return TODOS.find((m) => m.cvegeo === cvegeo) ?? null;
}

// Cada estado carga su geometría bajo demanda (un chunk por estado).
const CARGADORES: Record<string, () => Promise<{ default: unknown }>> = {
  "01": () => import("../data/municipios/01.json"),
  "02": () => import("../data/municipios/02.json"),
  "03": () => import("../data/municipios/03.json"),
  "04": () => import("../data/municipios/04.json"),
  "05": () => import("../data/municipios/05.json"),
  "06": () => import("../data/municipios/06.json"),
  "07": () => import("../data/municipios/07.json"),
  "08": () => import("../data/municipios/08.json"),
  "09": () => import("../data/municipios/09.json"),
  "10": () => import("../data/municipios/10.json"),
  "11": () => import("../data/municipios/11.json"),
  "12": () => import("../data/municipios/12.json"),
  "13": () => import("../data/municipios/13.json"),
  "14": () => import("../data/municipios/14.json"),
  "15": () => import("../data/municipios/15.json"),
  "16": () => import("../data/municipios/16.json"),
  "17": () => import("../data/municipios/17.json"),
  "18": () => import("../data/municipios/18.json"),
  "19": () => import("../data/municipios/19.json"),
  "20": () => import("../data/municipios/20.json"),
  "21": () => import("../data/municipios/21.json"),
  "22": () => import("../data/municipios/22.json"),
  "23": () => import("../data/municipios/23.json"),
  "24": () => import("../data/municipios/24.json"),
  "25": () => import("../data/municipios/25.json"),
  "26": () => import("../data/municipios/26.json"),
  "27": () => import("../data/municipios/27.json"),
  "28": () => import("../data/municipios/28.json"),
  "29": () => import("../data/municipios/29.json"),
  "30": () => import("../data/municipios/30.json"),
  "31": () => import("../data/municipios/31.json"),
  "32": () => import("../data/municipios/32.json"),
};

const CACHE = new Map<string, MunicipiosEstadoTopo>();

/** Carga (con caché) el TopoJSON de los municipios de un estado por su CVE_ENT. */
export async function cargaMunicipios(cveEnt: string): Promise<MunicipiosEstadoTopo> {
  const hit = CACHE.get(cveEnt);
  if (hit) return hit;
  const loader = CARGADORES[cveEnt];
  if (!loader) throw new Error(`estado desconocido: ${cveEnt}`);
  const mod = await loader();
  const topo = ((mod as { default?: unknown }).default ?? mod) as MunicipiosEstadoTopo;
  CACHE.set(cveEnt, topo);
  return topo;
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
 * Mapa choropleth de los municipios de un estado. Carga la geometría del estado
 * bajo demanda (un chunk por estado, alta resolución de INEGI). SVG puro, sin
 * librería de mapas ni API key.
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
  const [topo, setTopo] = useState<MunicipiosEstadoTopo | null>(null);

  useEffect(() => {
    let vivo = true;
    setTopo(null);
    cargaMunicipios(estado).then((t) => {
      if (vivo) setTopo(t);
    });
    return () => {
      vivo = false;
    };
  }, [estado]);

  const { paths, min, max } = useMemo(() => {
    if (!topo) return { paths: [] as Array<{ m: Municipio; d: string }>, min: 0, max: 0 };
    const objName = Object.keys(topo.objects)[0]!;
    const fc = feature(
      topo as never,
      topo.objects[objName] as never,
    ) as unknown as FeatureCollection<Geometry, Municipio>;

    const projection = geoMercator().fitExtent(
      [
        [12, 12],
        [WIDTH - 12, HEIGHT - 12],
      ],
      fc as never,
    );
    const path = geoPath(projection);

    const vals = data ? Object.values(data).filter((v) => Number.isFinite(v)) : [];
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 0;

    const paths = fc.features.map((f: Feature<Geometry, Municipio>) => ({
      m: f.properties,
      d: path(f) ?? "",
    }));
    return { paths, min, max };
  }, [topo, data]);

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
