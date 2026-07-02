import { describe, it, expect } from "vitest";
import { rupturasJenks, escalaJenks, escalaUmbral } from "../src/index";

describe("rupturasJenks", () => {
  it("encuentra el salto natural entre dos grupos claros", () => {
    // Dos clusters obvios: el corte debe caer al inicio del segundo.
    const datos = [1, 2, 3, 100, 101, 102];
    expect(rupturasJenks(datos, 2)).toEqual([100]);
  });

  it("separa tres grupos en sus fronteras naturales", () => {
    const datos = [1, 2, 3, 50, 51, 52, 900, 901, 902];
    expect(rupturasJenks(datos, 3)).toEqual([50, 900]);
  });

  it("devuelve n-1 cortes ordenados", () => {
    const datos = [4, 9, 1, 30, 28, 70, 72, 2, 31];
    const cortes = rupturasJenks(datos, 4);
    expect(cortes).toHaveLength(3);
    expect([...cortes].sort((a, b) => a - b)).toEqual(cortes);
  });

  it("ignora valores no finitos y tolera casos degenerados", () => {
    expect(rupturasJenks([], 5)).toEqual([]);
    expect(rupturasJenks([7], 5)).toEqual([]); // una sola observación → una clase
    expect(rupturasJenks([1, NaN, 100, Infinity], 2)).toEqual([100]);
  });
});

describe("escalaJenks", () => {
  it("colorea cada cluster con su propia clase", () => {
    const datos = [1, 2, 3, 100, 101, 102];
    const { color, tramos } = escalaJenks(datos, "azul", 2);
    expect(tramos).toHaveLength(2);
    // Todo el cluster bajo comparte color, distinto al del cluster alto.
    expect(color(1)).toBe(color(3));
    expect(color(100)).toBe(color(102));
    expect(color(1)).not.toBe(color(100));
  });

  it("los tramos cubren [min, max] y traen color (para la <Leyenda>)", () => {
    const datos = [5, 8, 20, 22, 90];
    const { tramos } = escalaJenks(datos, "verde", 3);
    expect(tramos[0]!.desde).toBe(5);
    expect(tramos[tramos.length - 1]!.hasta).toBe(90);
    for (const t of tramos) expect(t.color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("con lista vacía devuelve una escala utilizable de un tramo", () => {
    const { color, tramos } = escalaJenks([], "azul", 5);
    expect(tramos).toHaveLength(1);
    expect(color(42)).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("escalaUmbral", () => {
  it("asigna clases por cortes manuales con extremos abiertos", () => {
    const { color, tramos } = escalaUmbral([100, 500, 1000], "azul");
    expect(tramos).toHaveLength(4);
    expect(tramos[0]!.desde).toBe(-Infinity);
    expect(tramos[3]!.hasta).toBe(Infinity);
    // Mismo tramo → mismo color; tramos distintos → distinto.
    expect(color(-5)).toBe(color(99));
    expect(color(100)).toBe(color(499)); // el corte pertenece a la clase superior
    expect(color(99)).not.toBe(color(100));
    expect(color(1000)).toBe(color(999999));
  });

  it("ordena los cortes y descarta los no finitos", () => {
    const a = escalaUmbral([1000, 100, NaN, 500]);
    const b = escalaUmbral([100, 500, 1000]);
    expect(a.tramos).toEqual(b.tramos);
  });
});
