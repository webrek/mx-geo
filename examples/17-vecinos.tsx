"use client";

/**
 * Resalta un estado y sus colindantes usando la adyacencia (`vecinos`) y el modo
 * categórico. Clic en cualquier estado para ver su "zona".
 */
import { useState } from "react";
import { MapaMexico } from "@webrek/mx-geo/react";
import { vecinos, type Estado } from "@webrek/mx-geo";

export function ZonaDeUnEstado() {
  const [sel, setSel] = useState<Estado | null>(null);

  const categorias = sel
    ? {
        [sel.cve]: "seleccionado",
        ...Object.fromEntries(vecinos(sel.cve).map((c) => [c, "vecino"])),
      }
    : undefined;

  return (
    <div style={{ maxWidth: 720 }}>
      <p>{sel ? `${sel.nombre} + ${vecinos(sel.cve).length} vecinos` : "Haz clic en un estado."}</p>
      <MapaMexico
        categorias={categorias}
        paletaCategorica={["#2563eb", "#93c5fd"]} // seleccionado, vecino
        onSelect={setSel}
      />
    </div>
  );
}
