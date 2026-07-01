import { describe, it, expect } from "vitest";
import { CENTROIDES_ESTADOS, centroideEstado } from "../src/index";

describe("centroides", () => {
  it("hay un centroide [lon, lat] por cada uno de los 32 estados", () => {
    expect(Object.keys(CENTROIDES_ESTADOS)).toHaveLength(32);
    for (const [cve, ll] of Object.entries(CENTROIDES_ESTADOS)) {
      expect(cve).toMatch(/^\d{2}$/);
      const [lon, lat] = ll;
      // México continental: lon ~ -117..-86, lat ~ 14..33
      expect(lon).toBeGreaterThan(-118);
      expect(lon).toBeLessThan(-86);
      expect(lat).toBeGreaterThan(14);
      expect(lat).toBeLessThan(33);
    }
  });

  it("centroideEstado devuelve la CDMX cerca de (-99.1, 19.3)", () => {
    const [lon, lat] = centroideEstado("09")!;
    expect(lon).toBeCloseTo(-99.1, 0);
    expect(lat).toBeCloseTo(19.3, 0);
  });

  it("devuelve null para una clave inexistente", () => {
    expect(centroideEstado("99")).toBeNull();
  });
});
