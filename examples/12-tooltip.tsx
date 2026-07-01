"use client";

/**
 * Tooltip a la medida: en vez del `<title>` nativo del SVG, una tarjeta
 * flotante con HTML propio (varias líneas, formato, lo que quieras). Sigue al
 * cursor y recibe el estado y su valor (`null` si no hay dato).
 */
import { MapaMexico } from "@webrek/mx-geo/react";

const ventas: Record<string, number> = { "09": 1200, "14": 980, "19": 760 };

export function ConTooltip() {
  return (
    <MapaMexico
      data={ventas}
      paleta="teal"
      renderTooltip={(estado, valor) => (
        <div>
          <strong>{estado.nombre}</strong>
          <div style={{ color: "#6b7280" }}>{estado.capital}</div>
          <div>{valor === null ? "Sin ventas" : `$${valor.toLocaleString("es-MX")}`}</div>
        </div>
      )}
    />
  );
}
