"use client";

import { useId, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";
import { estadosTopoJSON } from "./index";
import { ESTADOS } from "./estados.generated";
import type { Estado } from "./types";

type Props = {
  /** Valores por clave INEGI (CVE_ENT), p. ej. `{ "09": 1200, "14": 800 }`. */
  data?: Record<string, number>;
  /** Se llama al hacer clic en un estado. */
  onSelect?: (estado: Estado) => void;
  /** Rango de color [mínimo, máximo] para el choropleth. */
  colorRange?: [string, string];
  /** Color de un estado sin valor en `data`. */
  emptyColor?: string;
  /** Color del borde. */
  stroke?: string;
  /** Da formato al valor mostrado en el tooltip nativo. */
  formatValue?: (valor: number, estado: Estado) => string;
  /** Etiqueta accesible del mapa. */
  ariaLabel?: string;
  className?: string;
};

const WIDTH = 800;
const HEIGHT = 600;

const PORCVE = new Map<string, Estado>(ESTADOS.map((e) => [e.cve, e]));

/** Interpola dos colores hex (#rrggbb) en el punto t∈[0,1]. */
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
 * Mapa choropleth de los 32 estados de México. SVG puro, sin librería de mapas
 * ni API key. Pinta cada estado según `data[cve]`; si no hay dato, usa
 * `emptyColor`.
 */
export function MapaMexico({
  data,
  onSelect,
  colorRange = ["#dbeafe", "#1e3a8a"],
  emptyColor = "#e5e7eb",
  stroke = "#ffffff",
  formatValue,
  ariaLabel = "Mapa de México por estados",
  className,
}: Props) {
  const titleId = useId();
  const [hover, setHover] = useState<string | null>(null);

  const { paths, min, max } = useMemo(() => {
    const fc = feature(
      estadosTopoJSON as never,
      (estadosTopoJSON as never as { objects: { estados: unknown } }).objects.estados as never,
    ) as unknown as { features: Array<Feature<Geometry, { cve: string }>> };

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

    const paths = fc.features.map((f) => ({
      cve: f.properties.cve,
      d: path(f) ?? "",
    }));
    return { paths, min, max };
  }, [data]);

  function fillFor(cve: string): string {
    const v = data?.[cve];
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
      {paths.map(({ cve, d }) => {
        const e = PORCVE.get(cve);
        const v = data?.[cve];
        const etiqueta =
          v != null && Number.isFinite(v)
            ? `${e?.nombreCorto}: ${formatValue ? formatValue(v, e!) : v}`
            : (e?.nombreCorto ?? cve);
        return (
          <path
            key={cve}
            d={d}
            fill={fillFor(cve)}
            stroke={stroke}
            strokeWidth={hover === cve ? 1.5 : 0.6}
            style={{ cursor: onSelect ? "pointer" : "default", outline: "none" }}
            onMouseEnter={() => setHover(cve)}
            onMouseLeave={() => setHover((h) => (h === cve ? null : h))}
            onClick={onSelect && e ? () => onSelect(e) : undefined}
            data-cve={cve}
          >
            <title>{etiqueta}</title>
          </path>
        );
      })}
    </svg>
  );
}
