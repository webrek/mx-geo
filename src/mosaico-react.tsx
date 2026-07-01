"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { ESTADOS } from "./estados.generated";
import { MOSAICO_ESTADOS, MOSAICO_COLUMNAS, MOSAICO_FILAS } from "./mosaico";
import {
  PALETA_CATEGORICA,
  coloresCategorias,
  interpolaPaleta,
  resuelvePaleta,
  type Paleta,
  type PaletaInput,
} from "./colores";
import { CapaTooltip, useTooltipPos } from "./tooltip";
import type { Estado } from "./types";

type Props = {
  /** Valores por CVE_ENT para el choropleth. */
  data?: Record<string, number>;
  /** Modo categórico `CVE_ENT -> categoría` (tiene prioridad sobre `data`). */
  categorias?: Record<string, string>;
  paleta?: PaletaInput;
  colorRange?: [string, string];
  paletaCategorica?: Paleta;
  emptyColor?: string;
  /** Muestra el valor debajo de la abreviatura (si hay `data`). Por defecto sí. */
  mostrarValor?: boolean;
  onSelect?: (estado: Estado) => void;
  formatValue?: (valor: number, estado: Estado) => string;
  renderTooltip?: (estado: Estado, valor: number | null) => ReactNode;
  ariaLabel?: string;
  className?: string;
};

const TILE = 54;
const GAP = 6;
const PASO = TILE + GAP;
const WIDTH = MOSAICO_COLUMNAS * PASO - GAP;
const HEIGHT = MOSAICO_FILAS * PASO - GAP;

const PORCVE = new Map<string, Estado>(ESTADOS.map((e) => [e.cve, e]));

/**
 * Cartograma de mosaicos: los 32 estados en una rejilla, cada uno del mismo
 * tamaño. SVG puro. Igual que `<MapaMexico>` para colorear (`data` o
 * `categorias`), pero con peso visual parejo.
 */
export function MapaMosaico({
  data,
  categorias,
  paleta,
  colorRange,
  paletaCategorica = PALETA_CATEGORICA,
  emptyColor = "#e5e7eb",
  mostrarValor = true,
  onSelect,
  formatValue,
  renderTooltip,
  ariaLabel = "Cartograma de mosaicos de México",
  className,
}: Props) {
  const titleId = useId();
  const [hover, setHover] = useState<string | null>(null);
  const { pos, onMove, clear } = useTooltipPos();

  const cols = useMemo<Paleta>(() => resuelvePaleta(paleta, colorRange), [paleta, colorRange]);
  const colorPorCategoria = useMemo(
    () => (categorias ? coloresCategorias(categorias, paletaCategorica) : null),
    [categorias, paletaCategorica],
  );

  const { min, max } = useMemo(() => {
    const vals = data ? Object.values(data).filter((v) => Number.isFinite(v)) : [];
    return { min: vals.length ? Math.min(...vals) : 0, max: vals.length ? Math.max(...vals) : 0 };
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

  // Texto oscuro sobre relleno claro, claro sobre oscuro (contraste simple).
  function textoColor(fill: string): string {
    const n = parseInt(fill.slice(1), 16);
    const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    return lum > 150 ? "#1f2937" : "#ffffff";
  }

  const tip =
    renderTooltip && hover ? renderTooltip(PORCVE.get(hover)!, data?.[hover] ?? null) : null;

  const svg = (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={className}
      role="img"
      aria-labelledby={titleId}
      style={{ width: "100%", height: "auto", display: "block" }}
      onMouseMove={renderTooltip ? onMove : undefined}
      onMouseLeave={renderTooltip ? clear : undefined}
    >
      <title id={titleId}>{ariaLabel}</title>
      {ESTADOS.map((e) => {
        const celda = MOSAICO_ESTADOS[e.cve];
        if (!celda) return null;
        const [col, fila] = celda;
        const x = col * PASO;
        const y = fila * PASO;
        const fill = fillFor(e.cve);
        const tc = textoColor(fill);
        const v = data?.[e.cve];
        const val =
          v != null && Number.isFinite(v) ? (formatValue ? formatValue(v, e) : String(v)) : null;
        const nativo =
          v != null && Number.isFinite(v)
            ? `${e.nombreCorto}: ${val}`
            : categorias?.[e.cve] != null
              ? `${e.nombreCorto}: ${categorias[e.cve]}`
              : e.nombreCorto;
        return (
          <g
            key={e.cve}
            transform={`translate(${x} ${y})`}
            style={{ cursor: onSelect ? "pointer" : "default" }}
            onMouseEnter={() => setHover(e.cve)}
            onMouseLeave={() => setHover((h) => (h === e.cve ? null : h))}
            onClick={onSelect ? () => onSelect(e) : undefined}
            data-cve={e.cve}
          >
            <rect
              width={TILE}
              height={TILE}
              rx={7}
              fill={fill}
              stroke={hover === e.cve ? "#111827" : "#ffffff"}
              strokeWidth={hover === e.cve ? 2 : 1}
            />
            <text
              x={TILE / 2}
              y={val && mostrarValor ? TILE / 2 - 6 : TILE / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={600}
              fill={tc}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {e.abreviatura}
            </text>
            {val && mostrarValor ? (
              <text
                x={TILE / 2}
                y={TILE / 2 + 11}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={9}
                fill={tc}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {val}
              </text>
            ) : null}
            {renderTooltip ? null : <title>{nativo}</title>}
          </g>
        );
      })}
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
