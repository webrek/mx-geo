"use client";

/**
 * Cuando los datos están sesgados (un par de estados enormes y el resto chico),
 * un degradado lineal aplana las diferencias. `escalaCuantil` parte los valores
 * en grupos de igual tamaño y devuelve los `tramos` (rango + color) para una
 * leyenda escalonada, mientras el mapa usa la misma paleta como degradado.
 */
import { useMemo } from "react";
import { MapaMexico, Leyenda } from "@webrek/mx-geo/react";
import { escalaCuantil } from "@webrek/mx-geo";

export function MapaCuantil({ data }: { data: Record<string, number> }) {
  const { tramos } = useMemo(() => escalaCuantil(Object.values(data), "naranja", 5), [data]);

  return (
    <div style={{ maxWidth: 720 }}>
      <MapaMexico data={data} paleta="naranja" formatValue={(v) => v.toLocaleString("es-MX")} />
      {/* La leyenda agrupa por cuantil: cada renglón es 1/5 de los estados. */}
      <Leyenda
        tipo="cuantil"
        titulo="Cuantiles"
        tramos={tramos}
        formato={(v) => v.toLocaleString("es-MX")}
      />
    </div>
  );
}
