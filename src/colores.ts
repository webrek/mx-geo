/**
 * Paletas de color y escalas para los mapas de @webrek/mx-geo. Este módulo no
 * depende de React: son funciones puras que también puedes usar para construir
 * tu propia leyenda o pintar el TopoJSON con otra herramienta.
 */

/** Una paleta es una lista de 2 o más colores hex (`#rrggbb`) de claro a oscuro. */
export type Paleta = readonly string[];

/**
 * Paletas secuenciales (un solo tono, de claro a oscuro) listas para usar como
 * choropleth. La clave es el nombre que aceptan los componentes en la prop
 * `paleta`.
 */
export const PALETAS = {
  azul: ["#eff6ff", "#93c5fd", "#3b82f6", "#1e3a8a"],
  verde: ["#f0fdf4", "#86efac", "#22c55e", "#166534"],
  rojo: ["#fef2f2", "#fca5a5", "#ef4444", "#991b1b"],
  naranja: ["#fff7ed", "#fdba74", "#f97316", "#9a3412"],
  morado: ["#faf5ff", "#d8b4fe", "#a855f7", "#6b21a8"],
  teal: ["#f0fdfa", "#5eead4", "#14b8a6", "#115e59"],
  rosa: ["#fdf2f8", "#f9a8d4", "#ec4899", "#9d174d"],
  ambar: ["#fffbeb", "#fcd34d", "#f59e0b", "#92400e"],
  gris: ["#f9fafb", "#d1d5db", "#6b7280", "#1f2937"],
  /** Marca Walmart (azul corporativo). */
  walmart: ["#e6f2fb", "#79bdec", "#0071ce", "#003b73"],
} as const satisfies Record<string, Paleta>;

/** Paletas divergentes (dos tonos con punto medio claro), para datos con centro. */
export const PALETAS_DIVERGENTES = {
  rojoVerde: ["#991b1b", "#fca5a5", "#f3f4f6", "#86efac", "#166534"],
  azulRojo: ["#1e3a8a", "#93c5fd", "#f3f4f6", "#fca5a5", "#991b1b"],
  moradoVerde: ["#6b21a8", "#d8b4fe", "#f3f4f6", "#86efac", "#166534"],
} as const satisfies Record<string, Paleta>;

/**
 * Paleta categórica: colores distinguibles para grupos discretos (regiones,
 * zonas de venta, categorías). Pensada para acompañarse con una leyenda.
 */
export const PALETA_CATEGORICA: Paleta = [
  "#2563eb", // azul
  "#16a34a", // verde
  "#dc2626", // rojo
  "#f59e0b", // ámbar
  "#7c3aed", // morado
  "#0d9488", // teal
  "#db2777", // rosa
  "#ca8a04", // oro
  "#4f46e5", // índigo
  "#65a30d", // lima
  "#0891b2", // cian
  "#9333ea", // violeta
];

/** Nombre de una paleta secuencial integrada. */
export type NombrePaleta = keyof typeof PALETAS;

/** Nombre de una paleta divergente integrada. */
export type NombrePaletaDivergente = keyof typeof PALETAS_DIVERGENTES;

/** Lo que aceptan los componentes en `paleta`: un nombre integrado o tus colores. */
export type PaletaInput = NombrePaleta | NombrePaletaDivergente | Paleta;

const TODAS: Record<string, Paleta> = { ...PALETAS, ...PALETAS_DIVERGENTES };

/**
 * Resuelve la entrada de `paleta` a una lista de colores. Acepta el nombre de
 * una paleta integrada (`"azul"`, `"rojoVerde"`…) o un array de colores propio.
 * Como compatibilidad, un `colorRange` de dos colores se usa si no hay `paleta`.
 * Por defecto: `azul`.
 */
export function resuelvePaleta(
  paleta?: PaletaInput,
  colorRange?: readonly [string, string],
): Paleta {
  if (paleta) {
    if (typeof paleta === "string") {
      const p = TODAS[paleta];
      if (p) return p;
      throw new Error(`paleta desconocida: ${paleta}`);
    }
    if (paleta.length >= 2) return paleta;
    throw new Error("una paleta necesita al menos 2 colores");
  }
  if (colorRange) return colorRange;
  return PALETAS.azul;
}

/** Convierte `#rgb` o `#rrggbb` a sus tres canales; lanza si no es hex válido. */
function aRgb(hex: string): [number, number, number] {
  let s = hex.trim().replace(/^#/, "");
  if (s.length === 3) s = s.replace(/./g, (c) => c + c); // #abc -> #aabbcc
  if (!/^[0-9a-fA-F]{6}$/.test(s)) {
    throw new Error(`color hex inválido: ${hex} (se espera "#rgb" o "#rrggbb")`);
  }
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

/** Interpola dos colores hex (`#rgb` o `#rrggbb`) en el punto `t` ∈ [0, 1]. */
export function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = aRgb(a);
  const [br, bg, bb] = aRgb(b);
  const mix = (x: number, y: number) =>
    Math.round(x + (y - x) * Math.max(0, Math.min(1, t)))
      .toString(16)
      .padStart(2, "0");
  return `#${mix(ar, br)}${mix(ag, bg)}${mix(ab, bb)}`;
}

/**
 * Interpola una paleta de N colores en el punto `t` ∈ [0, 1]: reparte los
 * colores en tramos iguales e interpola dentro del tramo que toca.
 */
export function interpolaPaleta(paleta: Paleta, t: number): string {
  if (paleta.length === 0) throw new Error("la paleta no puede estar vacía");
  if (paleta.length === 1) return paleta[0]!;
  const x = Math.max(0, Math.min(1, t)) * (paleta.length - 1);
  const i = Math.min(Math.floor(x), paleta.length - 2);
  return lerpHex(paleta[i]!, paleta[i + 1]!, x - i);
}

/**
 * Crea una escala secuencial continua: dado el dominio `[min, max]` y una
 * paleta, devuelve una función que mapea un valor a su color. Fuera del dominio
 * se recorta a los extremos.
 */
export function escalaSecuencial(
  dominio: readonly [number, number],
  paleta: PaletaInput = "azul",
): (valor: number) => string {
  const cols = resuelvePaleta(paleta);
  const [min, max] = dominio;
  return (valor: number) => {
    const t = max > min ? (valor - min) / (max - min) : 1;
    return interpolaPaleta(cols, t);
  };
}

/** Un tramo de una escala por cuantiles: rango `[desde, hasta)` y su color. */
export interface TramoCuantil {
  desde: number;
  hasta: number;
  color: string;
}

/**
 * Crea una escala por cuantiles: parte los `valores` en `n` grupos de igual
 * tamaño y asigna a cada grupo un color de la paleta. Útil cuando los datos
 * están sesgados y un degradado lineal aplana las diferencias.
 *
 * Devuelve la función de color y los `tramos` (para dibujar la leyenda).
 */
export function escalaCuantil(
  valores: readonly number[],
  paleta: PaletaInput = "azul",
  n = 5,
): { color: (valor: number) => string; tramos: TramoCuantil[] } {
  const cols = resuelvePaleta(paleta);
  const finitos = valores.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  const grupos = Math.max(1, n);

  if (finitos.length === 0) {
    const color = () => interpolaPaleta(cols, 0);
    return { color, tramos: [] };
  }

  // Cortes por cuantil (interpolación lineal entre posiciones).
  const cuantil = (q: number) => {
    const pos = q * (finitos.length - 1);
    const base = Math.floor(pos);
    const resto = pos - base;
    const lo = finitos[base]!;
    const hi = finitos[Math.min(base + 1, finitos.length - 1)]!;
    return lo + (hi - lo) * resto;
  };

  const cortes: number[] = [];
  for (let i = 1; i < grupos; i++) cortes.push(cuantil(i / grupos));

  const colorDeGrupo = (g: number) => interpolaPaleta(cols, grupos === 1 ? 1 : g / (grupos - 1));

  const grupoDe = (valor: number) => {
    let g = 0;
    while (g < cortes.length && valor >= cortes[g]!) g++;
    return g;
  };

  const min = finitos[0]!;
  const max = finitos[finitos.length - 1]!;
  const tramos: TramoCuantil[] = [];
  for (let g = 0; g < grupos; g++) {
    tramos.push({
      desde: g === 0 ? min : cortes[g - 1]!,
      hasta: g === grupos - 1 ? max : cortes[g]!,
      color: colorDeGrupo(g),
    });
  }

  return { color: (valor: number) => colorDeGrupo(grupoDe(valor)), tramos };
}

/**
 * Asigna un color de la paleta categórica a cada categoría, en orden de primera
 * aparición. Devuelve un mapa `categoría -> color` estable.
 */
export function escalaCategorica(
  categorias: Iterable<string>,
  paleta: Paleta = PALETA_CATEGORICA,
): Map<string, string> {
  const m = new Map<string, string>();
  let i = 0;
  for (const cat of categorias) {
    if (!m.has(cat)) {
      m.set(cat, paleta[i % paleta.length]!);
      i++;
    }
  }
  return m;
}

/**
 * Mapa `categoría -> color` **determinista** a partir de un objeto
 * `clave -> categoría` (el mismo que recibe `<MapaMexico categorias>`). A
 * diferencia de `escalaCategorica`, ordena las categorías **alfabéticamente**,
 * así que no depende del orden de iteración del objeto: el mapa y la leyenda
 * obtienen exactamente los mismos colores. Es justo lo que usa `<MapaMexico>`
 * internamente; úsalo también para construir la `<Leyenda tipo="categorias">`.
 */
export function coloresCategorias(
  categorias: Record<string, string>,
  paleta: Paleta = PALETA_CATEGORICA,
): Map<string, string> {
  const unicas = [...new Set(Object.values(categorias))].sort();
  return escalaCategorica(unicas, paleta);
}
