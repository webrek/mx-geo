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
import { MOSAICO_ESTADOS, MOSAICO_COLUMNAS, MOSAICO_FILAS } from "./mosaico";
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

export interface OpcionesMosaicoSVG {
  data?: Record<string, number>;
  categorias?: Record<string, string>;
  paleta?: PaletaInput;
  colorRange?: [string, string];
  paletaCategorica?: Paleta;
  emptyColor?: string;
  /** Muestra el valor bajo la abreviatura (si hay `data`). Por defecto sí. */
  mostrarValor?: boolean;
  formatValue?: (valor: number, estado: Estado) => string;
  background?: string;
  titulo?: string;
}

const TILE = 54;
const GAP = 6;

function textoContraste(fill: string): string {
  const n = parseInt(fill.slice(1), 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 150 ? "#1f2937" : "#ffffff";
}

/**
 * Cartograma de mosaicos como cadena SVG (sin React). Cada estado, una celda
 * del mismo tamaño en una rejilla — peso visual parejo. Para PDFs y reportes.
 */
export function mosaicoSVG(opts: OpcionesMosaicoSVG = {}): string {
  const {
    data,
    categorias,
    paleta,
    colorRange,
    paletaCategorica = PALETA_CATEGORICA,
    emptyColor = "#e5e7eb",
    mostrarValor = true,
    formatValue,
    background,
    titulo = "Cartograma de mosaicos de México",
  } = opts;

  const cols = resuelvePaleta(paleta, colorRange);
  const colorCat = categorias ? coloresCategorias(categorias, paletaCategorica) : null;
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

  const paso = TILE + GAP;
  const width = MOSAICO_COLUMNAS * paso - GAP;
  const height = MOSAICO_FILAS * paso - GAP;

  const celdas = ESTADOS.map((e) => {
    const celda = MOSAICO_ESTADOS[e.cve];
    if (!celda) return "";
    const x = celda[0] * paso;
    const y = celda[1] * paso;
    const f = fill(e.cve);
    const tc = textoContraste(f);
    const v = data?.[e.cve];
    const val =
      v != null && Number.isFinite(v) ? (formatValue ? formatValue(v, e) : String(v)) : null;
    const abrY = val && mostrarValor ? TILE / 2 - 6 : TILE / 2;
    let t = `<g transform="translate(${x} ${y})"><rect width="${TILE}" height="${TILE}" rx="7" fill="${f}" stroke="#ffffff" stroke-width="1"/>`;
    t += `<text x="${TILE / 2}" y="${abrY}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="${tc}" font-family="sans-serif">${esc(e.abreviatura)}</text>`;
    if (val && mostrarValor) {
      t += `<text x="${TILE / 2}" y="${TILE / 2 + 11}" text-anchor="middle" dominant-baseline="central" font-size="9" fill="${tc}" font-family="sans-serif">${esc(val)}</text>`;
    }
    return t + "</g>";
  }).join("");

  const bg = background ? `<rect width="${width}" height="${height}" fill="${background}"/>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
    `width="${width}" height="${height}" role="img" aria-label="${esc(titulo)}">` +
    `<title>${esc(titulo)}</title>${bg}${celdas}</svg>`
  );
}
