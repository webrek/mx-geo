/**
 * El núcleo no depende de React: catálogo, TopoJSON, paletas y escalas. Útil si
 * dibujas el mapa con D3, canvas o tu propio SVG y solo quieres los colores y
 * la geometría llaveada por CVE_ENT.
 */
import { estadosTopoJSON, escalaSecuencial, interpolaPaleta, PALETAS } from "@webrek/mx-geo";

const poblacionFicticia: Record<string, number> = { "09": 9.2, "15": 16.9, "31": 2.3 };

// 1) Una función valor → color, con dominio y paleta con nombre.
const color = escalaSecuencial([0, 17], "morado");
console.log(color(9.2)); // un morado intermedio
console.log(color(16.9)); // casi el extremo oscuro

// 2) Interpola una paleta a mano (t ∈ [0,1]) — p. ej. para una barra de leyenda.
const rampa = Array.from({ length: 5 }, (_, i) => interpolaPaleta(PALETAS.teal, i / 4));
console.log(rampa); // 5 pasos de la paleta "teal"

// 3) La geometría cruda (TopoJSON), llaveada por `cve` en cada `properties`.
for (const g of estadosTopoJSON.objects.estados.geometries) {
  const valor = poblacionFicticia[g.properties.cve];
  if (valor != null) {
    // dibuja g con fill = color(valor) en tu herramienta favorita…
    console.log(g.properties.nombre, "→", color(valor));
  }
}
