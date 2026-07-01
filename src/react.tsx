"use client";

import { useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";
import { estadosTopoJSON } from "./index";
import { ESTADOS } from "./estados.generated";
import { CENTROIDES_ESTADOS } from "./centroides";
import { CapaTooltip, useTooltipPos } from "./tooltip";
import { useZoomPan } from "./zoom";
import type { Estado } from "./types";
import {
  PALETA_CATEGORICA,
  coloresCategorias,
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
  /**
   * Tarjeta flotante a la medida al pasar el cursor (reemplaza al tooltip
   * nativo `<title>`). Recibe el estado y su valor (`null` si no hay dato).
   */
  renderTooltip?: (estado: Estado, valor: number | null) => ReactNode;
  /**
   * Habilita zoom con la rueda y pan arrastrando (doble clic reinicia). `true`
   * usa límites por defecto; con objeto puedes fijar `min`/`max` de escala.
   */
  zoom?: boolean | { min?: number; max?: number };
  /**
   * Dibuja una etiqueta de texto sobre cada estado, en su centroide:
   * `"abr"` (abreviatura, por defecto si `true`), `"nombre"` (nombre corto) o
   * una función que devuelve el texto por estado.
   */
  etiquetas?: boolean | "abr" | "nombre" | ((estado: Estado) => string);
  /** Color del texto de las etiquetas. */
  colorEtiqueta?: string;
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
  renderTooltip,
  zoom,
  etiquetas,
  colorEtiqueta = "#334155",
  ariaLabel = "Mapa de México por estados",
  className,
}: Props) {
  const titleId = useId();
  const [hover, setHover] = useState<string | null>(null);
  const { pos, onMove, clear } = useTooltipPos();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zp = useZoomPan(svgRef, WIDTH, HEIGHT, {
    enabled: !!zoom,
    ...(typeof zoom === "object" ? zoom : {}),
  });

  const cols = useMemo<Paleta>(() => resuelvePaleta(paleta, colorRange), [paleta, colorRange]);

  // Colores estables por categoría (orden alfabético, determinista). El mismo
  // helper `coloresCategorias` sirve para construir la leyenda y que coincida.
  const colorPorCategoria = useMemo(
    () => (categorias ? coloresCategorias(categorias, paletaCategorica) : null),
    [categorias, paletaCategorica],
  );

  const { paths, centros, min, max } = useMemo(() => {
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

    // Centroides proyectados a píxeles, para las etiquetas.
    const centros: Record<string, [number, number]> = {};
    for (const [cve, ll] of Object.entries(CENTROIDES_ESTADOS)) {
      const p = projection(ll);
      if (p) centros[cve] = p;
    }
    return { paths, centros, min, max };
  }, [data]);

  function textoEtiqueta(e: Estado): string {
    if (typeof etiquetas === "function") return etiquetas(e);
    if (etiquetas === "nombre") return e.nombreCorto;
    return e.abreviatura;
  }

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

  const tip =
    renderTooltip && hover ? renderTooltip(PORCVE.get(hover)!, data?.[hover] ?? null) : null;

  const { style: zStyle, ...zHandlers } = zp.handlers as { style?: CSSProperties };

  const svg = (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={className}
      role="img"
      aria-labelledby={titleId}
      style={{ width: "100%", height: "auto", display: "block", ...zStyle }}
      onMouseMove={renderTooltip ? onMove : undefined}
      onMouseLeave={renderTooltip ? clear : undefined}
      {...zHandlers}
    >
      <title id={titleId}>{ariaLabel}</title>
      <g transform={zp.transform}>
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
              vectorEffect="non-scaling-stroke"
              style={{ cursor: onSelect ? "pointer" : "default", outline: "none" }}
              onMouseEnter={() => setHover(cve)}
              onMouseLeave={() => setHover((h) => (h === cve ? null : h))}
              onClick={
                onSelect && e ? () => (zp.seArrastro() ? undefined : onSelect(e)) : undefined
              }
              data-cve={cve}
            >
              {renderTooltip ? null : <title>{etiqueta}</title>}
            </path>
          );
        })}
        {etiquetas
          ? paths.map(({ cve }) => {
              const e = PORCVE.get(cve);
              const p = centros[cve];
              if (!e || !p) return null;
              return (
                <text
                  key={`t-${cve}`}
                  x={p[0]}
                  y={p[1]}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fill={colorEtiqueta}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {textoEtiqueta(e)}
                </text>
              );
            })
          : null}
      </g>
    </svg>
  );

  if (!renderTooltip) return svg;
  return (
    <div style={{ position: "relative" }}>
      {svg}
      <CapaTooltip pos={pos}>{tip}</CapaTooltip>
    </div>
  );
}

export { Leyenda } from "./leyenda";
export type { LeyendaProps } from "./leyenda";
export { MapaBurbujas } from "./burbujas";
export { MapaMosaico } from "./mosaico-react";
export { svgAString, descargaSVG, descargaPNG } from "./exportar";
