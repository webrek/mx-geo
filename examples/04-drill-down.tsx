"use client";

/**
 * Drill-down: clic en un estado y se dibujan sus municipios. La geometría
 * municipal se carga bajo demanda (un chunk por estado), así que solo bajas la
 * del estado que abres.
 */
import { useState } from "react";
import { MapaMexico } from "@webrek/mx-geo/react";
import { MapaMunicipios } from "@webrek/mx-geo/municipios";
import type { Estado } from "@webrek/mx-geo";

export function DrillDown() {
  const [estado, setEstado] = useState<Estado | null>(null);

  if (estado) {
    return (
      <div style={{ maxWidth: 720 }}>
        <button onClick={() => setEstado(null)}>← Volver a estados</button>
        <h3>Municipios de {estado.nombre}</h3>
        <MapaMunicipios
          estado={estado.cve}
          paleta="verde"
          onSelect={(m) => console.log(m.cvegeo, m.nombre)}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <p>Haz clic en un estado para ver sus municipios.</p>
      <MapaMexico onSelect={setEstado} />
    </div>
  );
}
