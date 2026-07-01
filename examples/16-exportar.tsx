"use client";

/**
 * Descargar el mapa como PNG o SVG. Los helpers reciben el elemento `<svg>`
 * renderizado; aquí lo tomamos con un ref al contenedor.
 */
import { useRef } from "react";
import { MapaMexico, descargaPNG, descargaSVG } from "@webrek/mx-geo/react";

const ventas: Record<string, number> = { "09": 1200, "14": 980, "19": 760, "15": 1500 };

export function ConExportar() {
  const ref = useRef<HTMLDivElement>(null);
  const svg = () => ref.current?.querySelector("svg") as SVGSVGElement;

  return (
    <div ref={ref}>
      <MapaMexico data={ventas} paleta="walmart" etiquetas />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => descargaPNG(svg(), "mapa.png", { escala: 2, fondo: "#ffffff" })}>
          Descargar PNG
        </button>
        <button onClick={() => descargaSVG(svg(), "mapa.svg")}>Descargar SVG</button>
      </div>
    </div>
  );
}
