"use client";

/**
 * Choropleth básico: ventas por estado con una paleta con nombre y una leyenda.
 * Las claves del objeto `data` son CVE_ENT de INEGI ("09" = CDMX).
 */
import { MapaMexico, Leyenda } from "@webrek/mx-geo/react";

const ventas: Record<string, number> = {
  "09": 1200, // Ciudad de México
  "14": 980, // Jalisco
  "15": 1500, // Estado de México
  "19": 760, // Nuevo León
  "21": 540, // Puebla
};

const fmt = (n: number) => `$${n.toLocaleString("es-MX")}`;
const dominio: [number, number] = [
  Math.min(...Object.values(ventas)),
  Math.max(...Object.values(ventas)),
];

export function VentasPorEstado() {
  return (
    <figure style={{ maxWidth: 720, margin: 0 }}>
      <MapaMexico
        data={ventas}
        paleta="walmart" // azul corporativo; prueba "verde", "naranja", "rojoVerde"…
        formatValue={(v) => fmt(v)}
        onSelect={(e) => console.log("clic en", e.nombre, e.cve)}
      />
      <figcaption style={{ marginTop: 8 }}>
        <Leyenda dominio={dominio} paleta="walmart" titulo="Ventas" formato={fmt} />
      </figcaption>
    </figure>
  );
}
