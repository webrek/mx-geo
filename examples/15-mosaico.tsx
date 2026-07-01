"use client";

/**
 * Cartograma de mosaicos: los 32 estados en una rejilla, todos del mismo tamaño.
 * Ideal cuando los estados chicos del centro (CDMX, Morelos, Tlaxcala) importan
 * tanto como los grandes y no quieres que se pierdan por su tamaño real.
 */
import { MapaMosaico } from "@webrek/mx-geo/react";

const ventas: Record<string, number> = {
  "09": 1200,
  "15": 1500,
  "14": 980,
  "19": 760,
  "21": 540,
  "17": 300,
  "29": 180,
};

export function Mosaico() {
  return (
    <MapaMosaico
      data={ventas}
      paleta="walmart"
      onSelect={(e) => console.log(e.nombre)}
      formatValue={(v) => `$${v.toLocaleString("es-MX")}`}
    />
  );
}
