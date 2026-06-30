import { describe, it, expect } from "vitest";
import { ESTADOS, REGIONES, estado } from "../src/index";
import { agregaMunicipiosAEstado } from "../src/agrega";

const REGS = new Set(REGIONES.map((r) => r.reg));

describe("catálogo enriquecido", () => {
  it("cada estado trae region, poblacion, superficie y huso válidos", () => {
    for (const e of ESTADOS) {
      expect(REGS.has(e.region)).toBe(true);
      expect(e.poblacion).toBeGreaterThan(0);
      expect(e.superficie).toBeGreaterThan(0);
      expect(e.huso).toMatch(/^America\//);
    }
  });

  it("trae cifras del Censo 2020 reconocibles", () => {
    expect(estado("15")?.poblacion).toBe(16992418); // Estado de México, el más poblado
    expect(estado("09")?.huso).toBe("America/Mexico_City");
    expect(estado("23")?.huso).toBe("America/Cancun"); // Quintana Roo, UTC-5
    expect(estado("26")?.huso).toBe("America/Hermosillo"); // Sonora, sin DST
  });

  it("la suma de poblaciones es del orden del país (~126 M)", () => {
    const total = ESTADOS.reduce((s, e) => s + e.poblacion, 0);
    expect(total).toBeGreaterThan(125_000_000);
    expect(total).toBeLessThan(127_000_000);
  });
});

describe("agregaMunicipiosAEstado", () => {
  it("suma valores municipales por CVE_ENT", () => {
    const out = agregaMunicipiosAEstado({ "20067": 100, "20001": 50, "09010": 7 });
    expect(out["20"]).toBe(150);
    expect(out["09"]).toBe(7);
  });
  it("ignora valores no finitos", () => {
    const out = agregaMunicipiosAEstado({ "14039": NaN, "14040": 5 });
    expect(out["14"]).toBe(5);
  });
  it("acepta un combinador personalizado (p. ej. máximo)", () => {
    const out = agregaMunicipiosAEstado({ "05030": 10, "05035": 40 }, (a, b) => Math.max(a, b));
    expect(out["05"]).toBe(40);
  });
});
