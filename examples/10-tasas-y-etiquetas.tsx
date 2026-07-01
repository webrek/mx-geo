"use client";

/**
 * Normaliza valores absolutos a una tasa por cápita antes de pintar, para que
 * los estados grandes no dominen el mapa solo por tamaño. Y muestra etiquetas
 * con la abreviatura de cada estado.
 */
import { MapaMexico, Leyenda } from "@webrek/mx-geo/react";
import { porCapita } from "@webrek/mx-geo";

// Casos absolutos por estado (demo).
const casos: Record<string, number> = {
  "09": 12000,
  "15": 15000,
  "14": 6000,
  "19": 4000,
  "31": 900,
};

// Casos por cada 100 mil habitantes: la comparación justa.
const tasa = porCapita(casos, 100_000);
const dominio: [number, number] = [
  Math.min(...Object.values(tasa)),
  Math.max(...Object.values(tasa)),
];
const fmt = (v: number) => v.toFixed(1);

export function TasaPorCapita() {
  return (
    <div style={{ maxWidth: 720 }}>
      <MapaMexico data={tasa} paleta="morado" etiquetas formatValue={fmt} />
      <Leyenda dominio={dominio} paleta="morado" titulo="Casos por 100 mil hab." formato={fmt} />
    </div>
  );
}
