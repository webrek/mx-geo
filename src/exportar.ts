"use client";

/**
 * Utilidades para exportar el mapa (un `<svg>` renderizado) a archivo. Son de
 * navegador: pásales la referencia al elemento `<svg>` del mapa.
 */

/** Serializa un `<svg>` del DOM a una cadena XML autónoma. */
export function svgAString(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new XMLSerializer().serializeToString(clone);
}

function descargarBlob(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

/** Descarga el mapa como archivo `.svg`. */
export function descargaSVG(svg: SVGSVGElement, nombre = "mapa.svg"): void {
  descargarBlob(new Blob([svgAString(svg)], { type: "image/svg+xml;charset=utf-8" }), nombre);
}

/**
 * Rasteriza el mapa a PNG y lo descarga. `escala` multiplica la resolución
 * (2 = retina); `fondo` pinta un color de fondo (el SVG suele ser transparente).
 */
export async function descargaPNG(
  svg: SVGSVGElement,
  nombre = "mapa.png",
  opts: { escala?: number; fondo?: string } = {},
): Promise<void> {
  const { escala = 2, fondo } = opts;
  const vb = svg.viewBox?.baseVal;
  const w = vb && vb.width ? vb.width : svg.clientWidth || 800;
  const h = vb && vb.height ? vb.height : svg.clientHeight || 600;

  const url = URL.createObjectURL(
    new Blob([svgAString(svg)], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const img = new Image();
    img.width = w;
    img.height = h;
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("no se pudo cargar el SVG"));
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * escala);
    canvas.height = Math.round(h * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("sin contexto 2d");
    if (fondo) {
      ctx.fillStyle = fondo;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    await new Promise<void>((res) =>
      canvas.toBlob((b) => {
        if (b) descargarBlob(b, nombre);
        res();
      }, "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
