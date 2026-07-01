/**
 * Render en el servidor (Node, sin navegador): genera el mapa como SVG y
 * guárdalo, mándalo por correo o conviértelo a PNG para un PDF/reporte.
 */
import { writeFileSync } from "node:fs";
import { mapaSVG } from "@webrek/mx-geo/svg";

const ventas: Record<string, number> = {
  "09": 1200,
  "15": 1500,
  "14": 980,
  "19": 760,
  "21": 540,
};

const svg = mapaSVG({
  data: ventas,
  paleta: "walmart",
  etiquetas: true,
  background: "#ffffff",
  titulo: "Ventas por estado — junio",
  width: 900,
  height: 680,
});

writeFileSync("ventas.svg", svg);
// Para PNG: pásalo por sharp/resvg, o `mapshaper`/`rsvg-convert` en tu pipeline.
console.log(`SVG de ${svg.length} bytes escrito en ventas.svg`);
