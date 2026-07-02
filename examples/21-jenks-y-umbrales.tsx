"use client";

/**
 * Escalas escalonadas más allá del cuantil: **Jenks** (rupturas naturales)
 * corta donde los datos realmente saltan — ideal cuando hay grupos claros —
 * y **umbral** usa tus cortes de negocio (p. ej. metas de venta). Ambas
 * devuelven `{ color, tramos }`, igual que `escalaCuantil`, así que encajan
 * con la misma `<Leyenda tipo="cuantil">`.
 */
import { escalaJenks, escalaUmbral, rupturasJenks } from "@webrek/mx-geo";
import { MapaMexico, Leyenda } from "@webrek/mx-geo/react";

const ventas: Record<string, number> = {
  "09": 4800,
  "14": 2100,
  "19": 1950,
  "15": 620,
  "21": 580,
  "31": 90,
  "04": 75,
};

// 1) Jenks: encuentra los grupos naturales (CDMX arriba, GDL/MTY en medio…).
const jenks = escalaJenks(Object.values(ventas), "azul", 3);
console.log(rupturasJenks(Object.values(ventas), 3)); // los cortes que eligió

// 2) Umbral: tus reglas de negocio, extremos abiertos (-∞, +∞).
const metas = escalaUmbral([500, 2000], "verde"); // <500 flojo · 500–2000 ok · >2000 estrella

export default function Dashboard() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MapaMexico data={ventas} paleta="azul" />
      <Leyenda tipo="cuantil" tramos={jenks.tramos} titulo="Ventas (Jenks)" />
      <Leyenda tipo="cuantil" tramos={metas.tramos} titulo="Semáforo de metas" />
    </div>
  );
}
