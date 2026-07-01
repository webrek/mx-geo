/**
 * Genera el choropleth de estados como una cadena **SVG**, sin React ni
 * navegador. Pensado para el servidor: incrústalo en un PDF, un correo o un
 * reporte. Reutiliza la proyección, las paletas y los centroides del paquete.
 */
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";
import { estadosTopoJSON } from "./index";
import { ESTADOS } from "./estados.generated";
import { CENTROIDES_ESTADOS } from "./centroides";
import {
  PALETA_CATEGORICA,
  coloresCategorias,
  interpolaPaleta,
  resuelvePaleta,
  type Paleta,
  type PaletaInput,
} from "./colores";
import type { Estado } from "./types";

export interface OpcionesMapaSVG {
  /** Valores por CVE_ENT para el choropleth. */
  data?: Record<string, number>;
  /** Modo categórico `CVE_ENT -> categoría` (tiene prioridad sobre `data`). */
  categorias?: Record<string, string>;
  /** Paleta con nombre o lista de colores. */
  paleta?: PaletaInput;
  /** Atajo de dos colores (si no pasas `paleta`). */
  colorRange?: [string, string];
  /** Colores del modo categórico. */
  paletaCategorica?: Paleta;
  /** Color de un estado sin valor. */
  emptyColor?: string;
  /** Color y grosor del borde. */
  stroke?: string;
  strokeWidth?: number;
  /** Tamaño del lienzo (viewBox). */
  width?: number;
  height?: number;
  /** Color de fondo (por defecto sin fondo, transparente). */
  background?: string;
  /** Etiquetas sobre el centroide: `true`/`"abr"`, `"nombre"` o una función. */
  etiquetas?: boolean | "abr" | "nombre" | ((estado: Estado) => string);
  colorEtiqueta?: string;
  fontSize?: number;
  /** Título accesible (`<title>` y `aria-label`). */
  titulo?: string;
}

const PORCVE = new Map<string, Estado>(ESTADOS.map((e) => [e.cve, e]));

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ESCAPES[c]!);

/** Devuelve el choropleth de los 32 estados como una cadena SVG independiente. */
export function mapaSVG(opts: OpcionesMapaSVG = {}): string {
  const {
    data,
    categorias,
    paleta,
    colorRange,
    paletaCategorica = PALETA_CATEGORICA,
    emptyColor = "#e5e7eb",
    stroke = "#ffffff",
    strokeWidth = 0.6,
    width = 800,
    height = 600,
    background,
    etiquetas,
    colorEtiqueta = "#334155",
    fontSize = 9,
    titulo = "Mapa de México por estados",
  } = opts;

  const cols = resuelvePaleta(paleta, colorRange);
  const colorCat = categorias ? coloresCategorias(categorias, paletaCategorica) : null;

  const fc = feature(
    estadosTopoJSON as never,
    (estadosTopoJSON as never as { objects: { estados: unknown } }).objects.estados as never,
  ) as unknown as { features: Array<Feature<Geometry, { cve: string }>> };

  const projection = geoMercator().fitExtent(
    [
      [12, 12],
      [width - 12, height - 12],
    ],
    fc as never,
  );
  const path = geoPath(projection);

  const vals = data ? Object.values(data).filter((v) => Number.isFinite(v)) : [];
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 0;

  const fill = (cve: string): string => {
    if (colorCat) {
      const c = categorias?.[cve];
      return (c != null ? colorCat.get(c) : undefined) ?? emptyColor;
    }
    const v = data?.[cve];
    if (v == null || !Number.isFinite(v)) return emptyColor;
    const t = max > min ? (v - min) / (max - min) : 1;
    return interpolaPaleta(cols, t);
  };

  const paths = fc.features
    .map(
      (f) =>
        `<path d="${path(f) ?? ""}" fill="${fill(f.properties.cve)}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`,
    )
    .join("");

  let labels = "";
  if (etiquetas) {
    const texto = (e: Estado) =>
      typeof etiquetas === "function"
        ? etiquetas(e)
        : etiquetas === "nombre"
          ? e.nombreCorto
          : e.abreviatura;
    labels = Object.entries(CENTROIDES_ESTADOS)
      .map(([cve, ll]) => {
        const e = PORCVE.get(cve);
        const p = e ? projection(ll) : null;
        if (!e || !p) return "";
        return `<text x="${p[0].toFixed(1)}" y="${p[1].toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" fill="${colorEtiqueta}" font-family="sans-serif">${esc(texto(e))}</text>`;
      })
      .join("");
  }

  const bg = background ? `<rect width="${width}" height="${height}" fill="${background}"/>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
    `width="${width}" height="${height}" role="img" aria-label="${esc(titulo)}">` +
    `<title>${esc(titulo)}</title>${bg}${paths}${labels}</svg>`
  );
}
