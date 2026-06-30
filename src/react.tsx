"use client";

import { useId, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";
import { estadosTopoJSON } from "./index";
import { ESTADOS } from "./estados.generated";
import type { Estado } from "./types";
import {
  PALETA_CATEGORICA,
  escalaCategorica,
  interpolaPaleta,
  resuelvePaleta,
  type Paleta,
  type PaletaInput,
} from "./colores";

type Props = {
  /** Valores por clave INEGI (CVE_ENT), p. ej. `{ "09": 1200, "14": 800 }`. */
  data?: Record<string, number>;
  /** Se llama al hacer clic en un estado. */
  onSelect?: (estado: Estado) => void;
  /**
   * Paleta del choropleth: nombre integrado (`"azul"`, `"verde"`, `"rojoVerde"`…)
   * o una lista de colores hex. Por defecto `"azul"`.
   */
  paleta?: PaletaInput;
  /**
   * Rango de color `[mínimo, máximo]`. Atajo de dos colores; si pasas `paleta`,
   * esta tiene prioridad. (Compatibilidad con versiones anteriores.)
   */
  colorRange?: [string, string];
  /**
   * Modo categórico: mapa `CVE_ENT -> categoría` (región, zona de venta…). Cada
   * categoría recibe un color distinto de `paletaCategorica`. Tiene prioridad
   * sobre `data` para el relleno.
   */
  categorias?: Record<string, string>;
  /** Colores para el modo categórico. Por defecto, `PALETA_CATEGORICA`. */
  paletaCategorica?: Paleta;
  /** Color de un estado sin valor en `data` (o sin categoría). */
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

/**
 * Mapa choropleth de los 32 estados de México. SVG puro, sin librería de mapas
 * ni API key. Pinta cada estado según `data[cve]` (o por `categorias[cve]` en
 * modo categórico); si no hay valor, usa `emptyColor`.
 */
export function MapaMexico({
  data,
  onSelect,
  paleta,
  colorRange,
  categorias,
  paletaCategorica = PALETA_CATEGORICA,
  emptyColor = "#e5e7eb",
  stroke = "#ffffff",
  formatValue,
  ariaLabel = "Mapa de México por estados",
  className,
}: Props) {
  const titleId = useId();
  const [hover, setHover] = useState<string | null>(null);

  const cols = useMemo<Paleta>(() => resuelvePaleta(paleta, colorRange), [paleta, colorRange]);

  // Colores estables por categoría (en el orden oficial de los estados).
  const colorPorCategoria = useMemo(() => {
    if (!categorias) return null;
    const enOrden = ESTADOS.map((e) => categorias[e.cve]).filter((c): c is string => c != null);
    return escalaCategorica(enOrden, paletaCategorica);
  }, [categorias, paletaCategorica]);

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
    if (colorPorCategoria) {
      const cat = categorias?.[cve];
      return (cat != null ? colorPorCategoria.get(cat) : undefined) ?? emptyColor;
    }
    const v = data?.[cve];
    if (v == null || !Number.isFinite(v)) return emptyColor;
    const t = max > min ? (v - min) / (max - min) : 1;
    return interpolaPaleta(cols, t);
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
            : categorias?.[cve] != null
              ? `${e?.nombreCorto}: ${categorias[cve]}`
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

export { Leyenda } from "./leyenda";
export type { LeyendaProps } from "./leyenda";
