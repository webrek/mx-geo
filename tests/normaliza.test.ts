import { describe, it, expect } from "vitest";
import { ESTADOS, buscaEstado, normalizaEstado, estado, estadosTopoJSON } from "../src/index";

describe("catálogo", () => {
  it("tiene los 32 estados con claves únicas 01–32", () => {
    expect(ESTADOS).toHaveLength(32);
    const claves = ESTADOS.map((e) => e.cve);
    expect(new Set(claves).size).toBe(32);
    expect(claves).toContain("01");
    expect(claves).toContain("32");
  });

  it("toda clave en orden alfabético oficial de INEGI", () => {
    expect(estado("09")?.nombre).toBe("Ciudad de México");
    expect(estado("15")?.nombreCorto).toBe("Estado de México");
    expect(estado("30")?.nombre).toBe("Veracruz de Ignacio de la Llave");
  });
});

describe("buscaEstado / normalizaEstado", () => {
  it("resuelve por clave con o sin cero", () => {
    expect(normalizaEstado("09")).toBe("09");
    expect(normalizaEstado("9")).toBe("09");
    expect(normalizaEstado(9)).toBe("09");
  });

  it("resuelve CDMX por todos sus nombres", () => {
    for (const forma of ["CDMX", "Distrito Federal", "DF", "Ciudad de México", "MX-CMX"]) {
      expect(normalizaEstado(forma)).toBe("09");
    }
  });

  it("resuelve por nombre, abreviatura, ISO y alias", () => {
    expect(normalizaEstado("Jalisco")).toBe("14");
    expect(normalizaEstado("nuevo leon")).toBe("19");
    expect(normalizaEstado("NL")).toBe("19");
    expect(normalizaEstado("MX-NLE")).toBe("19");
    expect(normalizaEstado("Edomex")).toBe("15");
    expect(normalizaEstado("Veracruz")).toBe("30");
    expect(normalizaEstado("Q.R.")).toBe("23");
  });

  it("es indiferente a acentos y mayúsculas", () => {
    expect(normalizaEstado("MÉXICO")).toBe("15");
    expect(normalizaEstado("yucatan")).toBe("31");
    expect(buscaEstado("michoacán")?.cve).toBe("16");
  });

  it("devuelve null para algo desconocido", () => {
    expect(normalizaEstado("Narnia")).toBeNull();
    expect(buscaEstado("")).toBeNull();
  });
});

describe("topojson", () => {
  it("trae 32 geometrías cuyas claves coinciden con el catálogo", () => {
    const geoms = estadosTopoJSON.objects.estados.geometries;
    expect(geoms).toHaveLength(32);
    const clavesTopo = new Set(geoms.map((g) => g.properties.cve));
    for (const e of ESTADOS) expect(clavesTopo.has(e.cve)).toBe(true);
  });
});
