"use client";

import { useState, type ReactNode, type CSSProperties } from "react";

/** Posición del cursor relativa al contenedor del mapa, en píxeles. */
export type PosTooltip = { x: number; y: number } | null;

/**
 * Estado y manejadores para un tooltip que sigue al cursor dentro de un
 * contenedor con `position: relative`. `onMove` va en el `<svg>`; `clear` al
 * salir.
 */
export function useTooltipPos() {
  const [pos, setPos] = useState<PosTooltip>(null);
  const onMove = (e: { clientX: number; clientY: number; currentTarget: Element }) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const clear = () => setPos(null);
  return { pos, onMove, clear };
}

const CAJA: CSSProperties = {
  position: "absolute",
  transform: "translate(-50%, calc(-100% - 12px))",
  pointerEvents: "none",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "6px 9px",
  fontSize: "0.85em",
  lineHeight: 1.25,
  color: "#1f2937",
  boxShadow: "0 2px 10px rgba(0,0,0,.12)",
  whiteSpace: "nowrap",
  zIndex: 10,
};

/** Tarjeta flotante posicionada en `pos`. No renderiza nada si falta contenido. */
export function CapaTooltip({ pos, children }: { pos: PosTooltip; children: ReactNode }) {
  if (!pos || children == null || children === false) return null;
  return <div style={{ ...CAJA, left: pos.x, top: pos.y }}>{children}</div>;
}
