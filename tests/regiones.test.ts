import { describe, it, expect } from "vitest";
import { ESTADOS, REGIONES, REGION_POR_ESTADO, region, estadosDeRegion } from "../src/index";

describe("regiones", () => {
  it("cubre los 32 estados exactamente una vez", () => {
    const todas = REGIONES.flatMap((r) => r.estados);
    expect(todas).toHaveLength(32);
    expect(new Set(todas).size).toBe(32);
    const claves = new Set(ESTADOS.map((e) => e.cve));
    for (const cve of todas) expect(claves.has(cve)).toBe(true);
  });

  it("usa claves de región válidas y sin duplicar", () => {
    const regs = REGIONES.map((r) => r.reg);
    expect(new Set(regs).size).toBe(regs.length);
  });

  it("region() devuelve la región o null", () => {
    expect(region("norte")?.nombre).toBe("Norte");
    expect(region("inexistente")).toBeNull();
  });

  it("estadosDeRegion() devuelve los objetos Estado", () => {
    const sur = estadosDeRegion("sur");
    expect(sur.map((e) => e.cve)).toContain("31"); // Yucatán
    expect(sur.every((e) => e.region === "sur")).toBe(true);
  });

  it("REGION_POR_ESTADO concuerda con el campo region del catálogo", () => {
    for (const e of ESTADOS) {
      expect(REGION_POR_ESTADO[e.cve]).toBe(e.region);
    }
  });
});
