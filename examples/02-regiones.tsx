"use client";

/**
 * Pinta el país por región (regionalización de Banxico: Norte, Centro Norte,
 * Centro y Sur) usando el modo categórico. `REGION_POR_ESTADO` ya es el mapa
 * `CVE_ENT -> región` listo para la prop `categorias`.
 */
import { MapaMexico, Leyenda } from "@webrek/mx-geo/react";
import { REGIONES, REGION_POR_ESTADO, coloresCategorias } from "@webrek/mx-geo";

// `coloresCategorias` da los MISMOS colores que pinta el mapa (es lo que usa por
// dentro), así que la leyenda concuerda siempre con lo que se ve.
const colorPorRegion = coloresCategorias(REGION_POR_ESTADO);
const entradasLeyenda = REGIONES.map(
  (r) => [r.nombre, colorPorRegion.get(r.reg) ?? "#ccc"] as [string, string],
);

export function MapaPorRegion() {
  return (
    <div style={{ maxWidth: 720 }}>
      <MapaMexico
        categorias={REGION_POR_ESTADO}
        onSelect={(e) => console.log(e.nombreCorto, "→ región", e.region)}
      />
      <Leyenda tipo="categorias" titulo="Región (Banxico)" categorias={entradasLeyenda} />
    </div>
  );
}
