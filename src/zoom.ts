"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

export type Transform = { x: number; y: number; k: number };

export interface OpcionesZoom {
  /** Habilita el zoom/pan. Si es `false`, el hook no hace nada. */
  enabled?: boolean;
  /** Escala mínima (1 = mapa completo). */
  min?: number;
  /** Escala máxima. */
  max?: number;
}

const IDENTIDAD: Transform = { x: 0, y: 0, k: 1 };

/**
 * Zoom con la rueda (centrado en el cursor) y pan arrastrando, sobre un `<svg>`
 * con `viewBox` `0 0 width height`. Devuelve el `transform` para un `<g>` que
 * envuelve el contenido, los manejadores para el `<svg>` y `reset()`.
 * Implementación propia (sin d3-zoom) para no engordar el bundle.
 */
export function useZoomPan(
  ref: RefObject<SVGSVGElement | null>,
  width: number,
  height: number,
  { enabled = true, min = 1, max = 8 }: OpcionesZoom = {},
) {
  const [t, setT] = useState<Transform>(IDENTIDAD);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const arrastro = useRef(false);

  const puntoSvg = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return {
        x: r.width ? ((clientX - r.left) / r.width) * width : 0,
        y: r.height ? ((clientY - r.top) / r.height) * height : 0,
      };
    },
    [ref, width, height],
  );

  // Rueda en modo no-pasivo para poder preventDefault (evita el scroll de la página).
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setT((prev) => {
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        const k = Math.max(min, Math.min(max, prev.k * factor));
        if (k === prev.k) return prev;
        const c = puntoSvg(e.clientX, e.clientY);
        const ratio = k / prev.k;
        return { k, x: c.x - (c.x - prev.x) * ratio, y: c.y - (c.y - prev.y) * ratio };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ref, enabled, min, max, puntoSvg]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (!enabled) return;
      drag.current = puntoSvg(e.clientX, e.clientY);
      arrastro.current = false;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    [enabled, puntoSvg],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!drag.current) return;
      const p = puntoSvg(e.clientX, e.clientY);
      const dx = p.x - drag.current.x;
      const dy = p.y - drag.current.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) arrastro.current = true;
      drag.current = p;
      setT((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    },
    [puntoSvg],
  );

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  const reset = useCallback(() => setT(IDENTIDAD), []);
  /** `true` si el último gesto fue un arrastre (para suprimir el clic de selección). */
  const seArrastro = useCallback(() => arrastro.current, []);

  const activo = enabled && t.k !== 1;
  return {
    transform: enabled ? `translate(${t.x} ${t.y}) scale(${t.k})` : undefined,
    escala: t.k,
    reset,
    seArrastro,
    handlers: enabled
      ? {
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerLeave: onPointerUp,
          onDoubleClick: reset,
          style: { cursor: activo ? "grab" : "default", touchAction: "none" as const },
        }
      : {},
  };
}
