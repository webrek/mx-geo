import { describe, it, expect } from "vitest";
import { VECINOS, vecinos, estadosVecinos, sonVecinos, ESTADOS } from "../src/index";

describe("vecinos (adyacencia)", () => {
  it("cubre los 32 estados, todos con al menos un vecino", () => {
    expect(Object.keys(VECINOS)).toHaveLength(32);
    for (const e of ESTADOS) expect(vecinos(e.cve).length).toBeGreaterThan(0);
  });

  it("la adyacencia es simétrica", () => {
    for (const e of ESTADOS) {
      for (const v of vecinos(e.cve)) {
        expect(sonVecinos(v, e.cve)).toBe(true);
      }
    }
  });

  it("acierta casos conocidos", () => {
    expect(vecinos("09").sort()).toEqual(["15", "17"]); // CDMX: Edomex + Morelos
    expect(vecinos("01").sort()).toEqual(["14", "32"]); // Aguascalientes: Jalisco + Zacatecas
    expect(sonVecinos("02", "03")).toBe(true); // BC ↔ BCS (parche)
    expect(sonVecinos("09", "13")).toBe(false); // CDMX NO colinda con Hidalgo
  });

  it("estadosVecinos devuelve objetos Estado", () => {
    const v = estadosVecinos("31"); // Yucatán
    expect(v.map((e) => e.nombreCorto).sort()).toEqual(["Campeche", "Quintana Roo"]);
  });

  it("vecinos('99') vacío para clave inexistente", () => {
    expect(vecinos("99")).toEqual([]);
  });
});
