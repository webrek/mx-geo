"use client";

import { useId, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";
import { estadosTopoJSON } from "./index";
import { ESTADOS } from "./estados.generated";
import { CENTROIDES_ESTADOS } from "./centroides";
import type { Estado } from "./types";

type Props = {
  /** Valores por clave INEGI (CVE_ENT). El área de la burbuja es proporcional. */
  data: Record<string, number>;
  /** Radio máximo de burbuja en px (el del valor más alto). Por defecto 26. */
  radioMax?: number;
  /** Color de relleno de las burbujas. */
  color?: string;
  /** Opacidad de las burbujas (0–1). */
  opacidad?: number;
  /** Color de relleno de los estados (mapa base). */
  colorBase?: string;
  /** Color del borde de los estados. */
  stroke?: string;
  /** Clic en una burbuja/estado. */
  onSelect?: (estado: Estado) => void;
  /** Da formato al valor del tooltip. */
  formatValue?: (valor: number, estado: Estado) => string;
  ariaLabel?: string;
  className?: string;
};

const WIDTH = 800;
const HEIGHT = 600;
const PORCVE = new Map<string, Estado>(ESTADOS.map((e) => [e.cve, e]));

/**
 * Mapa de **burbujas** (símbolos proporcionales): un círculo por estado con
 * área proporcional a `data[cve]`, colocado en el centroide. Alternativa al
 * choropleth cuando quieres comparar magnitudes absolutas. SVG puro.
 */
export function MapaBurbujas({
  data,
  radioMax = 26,
  color = "#2563eb",
  opacidad = 0.6,
  colorBase = "#eef2f7",
  stroke = "#ffffff",
  onSelect,
  formatValue,
  ariaLabel = "Mapa de burbujas de México",
  className,
}: Props) {
  const titleId = useId();
  const [hover, setHover] = useState<string | null>(null);

  const { paths, burbujas } = useMemo(() => {
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
    const paths = fc.features.map((f) => ({ cve: f.properties.cve, d: path(f) ?? "" }));

    const vals = Object.values(data).filter((v) => Number.isFinite(v) && v > 0);
    const max = vals.length ? Math.max(...vals) : 0;

    // Área ∝ valor  ⇒  radio ∝ √valor. Mayores primero, para no tapar los chicos.
    const burbujas = Object.entries(data)
      .filter(([, v]) => Number.isFinite(v) && v > 0)
      .map(([cve, v]) => {
        const p = projection(CENTROIDES_ESTADOS[cve] ?? [0, 0]);
        const r = max > 0 && p ? radioMax * Math.sqrt(v / max) : 0;
        return { cve, v, x: p?.[0] ?? 0, y: p?.[1] ?? 0, r };
      })
      .sort((a, b) => b.r - a.r);

    return { paths, burbujas };
  }, [data, radioMax]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={className}
      role="img"
      aria-labelledby={titleId}
      style={{ width: "100%", height: "auto" }}
    >
      <title id={titleId}>{ariaLabel}</title>
      {paths.map(({ cve, d }) => (
        <path key={cve} d={d} fill={colorBase} stroke={stroke} strokeWidth={0.6} data-cve={cve} />
      ))}
      {burbujas.map(({ cve, v, x, y, r }) => {
        const e = PORCVE.get(cve);
        const etiqueta = `${e?.nombreCorto}: ${formatValue ? formatValue(v, e!) : v}`;
        return (
          <circle
            key={`b-${cve}`}
            cx={x}
            cy={y}
            r={r}
            fill={color}
            fillOpacity={hover === cve ? Math.min(1, opacidad + 0.25) : opacidad}
            stroke={color}
            strokeWidth={0.8}
            style={{ cursor: onSelect ? "pointer" : "default" }}
            onMouseEnter={() => setHover(cve)}
            onMouseLeave={() => setHover((h) => (h === cve ? null : h))}
            onClick={onSelect && e ? () => onSelect(e) : undefined}
            data-cve-burbuja={cve}
          >
            <title>{etiqueta}</title>
          </circle>
        );
      })}
    </svg>
  );
}
