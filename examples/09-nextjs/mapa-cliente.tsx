"use client";

/**
 * Next.js App Router — Client Component.
 * Ruta sugerida: app/ventas/mapa-cliente.tsx
 *
 * Recibe los datos ya resueltos por el servidor y dibuja el mapa + leyenda.
 */
import { MapaMexico, Leyenda } from "@webrek/mx-geo/react";

export function MapaCliente({ data }: { data: Record<string, number> }) {
  const vals = Object.values(data);
  const dominio: [number, number] = [Math.min(...vals), Math.max(...vals)];
  const fmt = (v: number) => v.toLocaleString("es-MX");

  return (
    <>
      <MapaMexico
        data={data}
        paleta="azul"
        formatValue={fmt}
        onSelect={(e) => console.log("clic en", e.nombre)}
      />
      <Leyenda dominio={dominio} paleta="azul" titulo="Ventas" formato={fmt} />
    </>
  );
}
