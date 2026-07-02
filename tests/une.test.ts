import { describe, it, expect } from "vitest";
import { uneEstados } from "../src/index";

interface Venta {
  estado: string | null;
  monto: number;
}

describe("uneEstados", () => {
  const filas: Venta[] = [
    { estado: "CDMX", monto: 100 },
    { estado: "Jalisco", monto: 50 },
    { estado: "MX-NLE", monto: 30 },
    { estado: "Wakanda", monto: 20 }, // no existe
    { estado: "Narnia", monto: 10 }, // no existe
    { estado: null, monto: 5 }, // sin valor
  ];

  it("separa filas emparejadas de las que no matchean", () => {
    const { emparejados, sinMatch } = uneEstados(filas, (f) => f.estado);
    expect(emparejados.map((e) => e.cve)).toEqual(["09", "14", "19"]);
    expect(emparejados[0]!.estado.nombreCorto).toBe("Ciudad de México");
    expect(emparejados[0]!.fila.monto).toBe(100);
    expect(sinMatch.map((s) => s.valor)).toEqual(["Wakanda", "Narnia", null]);
  });

  it("reporta cubiertos y faltantes contra los 32 estados", () => {
    const { cubiertos, faltantes } = uneEstados(filas, (f) => f.estado);
    expect(cubiertos).toEqual(["09", "14", "19"]);
    expect(cubiertos.length + faltantes.length).toBe(32);
    expect(faltantes).toContain("01"); // Aguascalientes no aparece en los datos
    expect(faltantes).not.toContain("09");
  });

  it("acepta claves y números, no solo texto", () => {
    const { emparejados, sinMatch } = uneEstados(
      [{ estado: 9 }, { estado: "31" }, { estado: undefined }],
      (f) => f.estado as string | number | null | undefined,
    );
    expect(emparejados.map((e) => e.cve)).toEqual(["09", "31"]);
    expect(sinMatch).toHaveLength(1);
  });

  it("con lista vacía, los 32 estados quedan faltantes", () => {
    const { emparejados, faltantes } = uneEstados([] as Venta[], (f) => f.estado);
    expect(emparejados).toEqual([]);
    expect(faltantes).toHaveLength(32);
  });
});
