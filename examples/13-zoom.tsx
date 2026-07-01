"use client";

/**
 * Zoom con la rueda y pan arrastrando (doble clic reinicia). Útil para ver los
 * estados chicos del centro sin bizquear. Funciona igual en <MapaMunicipios>.
 */
import { MapaMexico } from "@webrek/mx-geo/react";

const data: Record<string, number> = { "09": 1200, "15": 1500, "17": 400, "29": 300 };

export function ConZoom() {
  return (
    <MapaMexico
      data={data}
      paleta="azul"
      zoom // o `zoom={{ min: 1, max: 12 }}` para fijar los límites
      formatValue={(v) => v.toLocaleString("es-MX")}
    />
  );
}
