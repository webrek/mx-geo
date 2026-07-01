import { describe, it, expect } from "vitest";
import { tasa, porCapita, porKm2, densidadPoblacion, estado } from "../src/index";

describe("tasa / porCapita / porKm2", () => {
  it("porCapita divide entre población y aplica el factor", () => {
    const pob = estado("09")!.poblacion; // CDMX
    const r = porCapita({ "09": pob }, 100_000);
    expect(r["09"]).toBeCloseTo(100_000, 6); // valor == población → factor exacto
  });

  it("porKm2 divide entre la superficie", () => {
    const sup = estado("15")!.superficie;
    const r = porKm2({ "15": sup * 3 });
    expect(r["15"]).toBeCloseTo(3, 6);
  });

  it("tasa acepta un denominador propio por CVE_ENT", () => {
    const r = tasa({ "01": 50 }, { "01": 10 }, 2);
    expect(r["01"]).toBe(10);
  });

  it("omite estados sin denominador o con denominador 0", () => {
    const r = tasa({ "01": 50, "02": 50 }, { "01": 0 });
    expect(r["01"]).toBeUndefined(); // /0
    expect(r["02"]).toBeUndefined(); // sin denominador
  });

  it("densidadPoblacion cubre los 32 estados con valores positivos", () => {
    const d = densidadPoblacion();
    expect(Object.keys(d)).toHaveLength(32);
    // CDMX es, con mucho, la más densa
    const cdmx = d["09"]!;
    expect(cdmx).toBeGreaterThan(d["03"]!); // > Baja California Sur (la menos densa)
    expect(cdmx).toBeGreaterThan(3000);
  });
});
