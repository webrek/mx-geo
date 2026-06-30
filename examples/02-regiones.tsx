"use client";

/**
 * Pinta el país por región (regionalización de Banxico: Norte, Centro Norte,
 * Centro y Sur) usando el modo categórico. `REGION_POR_ESTADO` ya es el mapa
 * `CVE_ENT -> región` listo para la prop `categorias`.
 */
import { MapaMexico, Leyenda } from "@webrek/mx-geo/react";
import { ESTADOS, REGIONES, REGION_POR_ESTADO, escalaCategorica } from "@webrek/mx-geo";

// Reproduce los colores que asigna el mapa (orden oficial de los estados) para
// que la leyenda concuerde con lo que se ve.
const colorPorRegion = escalaCategorica(ESTADOS.map((e) => REGION_POR_ESTADO[e.cve]!));
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
