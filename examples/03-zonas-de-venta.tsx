"use client";

/**
 * Modo categórico con TUS propias zonas (no las regiones integradas). Cualquier
 * mapa `CVE_ENT -> etiqueta` sirve: aquí, zonas comerciales internas. Los
 * estados que no estén en el objeto quedan en `emptyColor`.
 */
import { MapaMexico, Leyenda } from "@webrek/mx-geo/react";
import { coloresCategorias } from "@webrek/mx-geo";

const ZONAS: Record<string, string> = {
  // Noroeste
  "02": "Noroeste",
  "03": "Noroeste",
  "25": "Noroeste",
  "26": "Noroeste",
  // Bajío
  "11": "Bajío",
  "14": "Bajío",
  "22": "Bajío",
  "24": "Bajío",
  // Metro
  "09": "Metro",
  "15": "Metro",
  "13": "Metro",
};

// Mismos colores que pinta el mapa (helper determinista), para la leyenda.
const colores = coloresCategorias(ZONAS);
const leyenda = [...colores.entries()] as [string, string][];

export function MapaPorZona() {
  return (
    <div style={{ maxWidth: 720 }}>
      <MapaMexico categorias={ZONAS} emptyColor="#eef0f3" />
      <Leyenda tipo="categorias" titulo="Zona comercial" categorias={leyenda} />
    </div>
  );
}
