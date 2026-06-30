"use client";

import { interpolaPaleta, resuelvePaleta, type PaletaInput, type TramoCuantil } from "./colores";

/** Cómo se aceptan las categorías en la leyenda: pares `[etiqueta, color]`. */
export type EntradasCategorias =
  Map<string, string> | Record<string, string> | ReadonlyArray<readonly [string, string]>;

export type LeyendaProps = {
  /** Título opcional arriba de la leyenda. */
  titulo?: string;
  className?: string;
} & (
  | {
      /**
       * Barra de degradado continua. Requiere `dominio` `[min, max]`. Usa
       * `paleta` (o `colorRange`) para los colores.
       */
      tipo?: "gradiente";
      dominio: readonly [number, number];
      paleta?: PaletaInput;
      colorRange?: readonly [string, string];
      /** Formato de las etiquetas mín/máx. */
      formato?: (valor: number) => string;
      /** Número de bloques del degradado (suavidad). Por defecto 24. */
      pasos?: number;
    }
  | {
      /** Leyenda escalonada a partir de los tramos de `escalaCuantil`. */
      tipo: "cuantil";
      tramos: TramoCuantil[];
      formato?: (valor: number) => string;
    }
  | {
      /** Leyenda de categorías discretas (regiones, zonas…). */
      tipo: "categorias";
      categorias: EntradasCategorias;
    }
);

const FILA: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6 };
const SWATCH = (color: string): React.CSSProperties => ({
  width: 14,
  height: 14,
  borderRadius: 3,
  background: color,
  flex: "0 0 auto",
});

function entradas(c: EntradasCategorias): Array<[string, string]> {
  if (c instanceof Map) return [...c.entries()];
  if (Array.isArray(c)) return c.map(([k, v]) => [k, v]);
  return Object.entries(c as Record<string, string>);
}

/**
 * Leyenda para acompañar un mapa: degradado continuo, escalones por cuantil o
 * categorías discretas. HTML puro (sin dependencias), pensada para colocarse
 * junto a `<MapaMexico>` o `<MapaMunicipios>`.
 */
export function Leyenda(props: LeyendaProps) {
  const { titulo, className } = props;
  const tipo = props.tipo ?? "gradiente";

  const cuerpo = (() => {
    if (tipo === "categorias") {
      const items = entradas((props as Extract<LeyendaProps, { tipo: "categorias" }>).categorias);
      return (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
          {items.map(([etiqueta, color]) => (
            <li key={etiqueta} style={FILA}>
              <span style={SWATCH(color)} aria-hidden="true" />
              <span>{etiqueta}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (tipo === "cuantil") {
      const p = props as Extract<LeyendaProps, { tipo: "cuantil" }>;
      const fmt = p.formato ?? ((v: number) => String(Math.round(v)));
      return (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
          {p.tramos.map((t, i) => (
            <li key={i} style={FILA}>
              <span style={SWATCH(t.color)} aria-hidden="true" />
              <span>
                {fmt(t.desde)} – {fmt(t.hasta)}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    // gradiente
    const p = props as Extract<LeyendaProps, { tipo?: "gradiente" }>;
    const cols = resuelvePaleta(p.paleta, p.colorRange);
    const pasos = Math.max(2, p.pasos ?? 24);
    const fmt = p.formato ?? ((v: number) => String(Math.round(v)));
    const stops = Array.from({ length: pasos }, (_, i) => interpolaPaleta(cols, i / (pasos - 1)));
    const [min, max] = p.dominio;
    return (
      <div style={{ display: "grid", gap: 4 }}>
        <div
          style={{
            height: 12,
            borderRadius: 3,
            background: `linear-gradient(to right, ${stops.join(",")})`,
          }}
          aria-hidden="true"
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85em" }}>
          <span>{fmt(min)}</span>
          <span>{fmt(max)}</span>
        </div>
      </div>
    );
  })();

  return (
    <div className={className} style={{ fontSize: "0.9em", lineHeight: 1.3 }}>
      {titulo ? <div style={{ fontWeight: 600, marginBottom: 4 }}>{titulo}</div> : null}
      {cuerpo}
    </div>
  );
}
