"use client";

/**
 * Mapa de burbujas (símbolos proporcionales): el área de cada círculo es
 * proporcional al valor. Útil para totales absolutos (tiendas, ventas,
 * población) donde el choropleth por color se satura.
 */
import { MapaBurbujas } from "@webrek/mx-geo/react";

// Población por estado (Censo 2020) como ejemplo de magnitud absoluta.
const poblacion: Record<string, number> = {
  "15": 16992418,
  "09": 9209944,
  "14": 8348151,
  "30": 8062579,
  "21": 6583278,
  "11": 6166934,
  "19": 5784442,
  "07": 5543828,
  "03": 798447,
  "06": 731391,
};

export function Poblacion() {
  return (
    <MapaBurbujas
      data={poblacion}
      radioMax={30}
      color="#2563eb"
      onSelect={(e) => console.log(e.nombre)}
      formatValue={(v) => v.toLocaleString("es-MX")}
    />
  );
}
