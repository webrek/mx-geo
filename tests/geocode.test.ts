import { describe, it, expect } from "vitest";
import { estadoDeCoordenada, centroideEstado, ESTADOS } from "../src/index";

describe("estadoDeCoordenada", () => {
  it("ubica ciudades conocidas en su estado", () => {
    expect(estadoDeCoordenada([-99.1332, 19.4326])).toBe("09"); // CDMX (Zócalo)
    expect(estadoDeCoordenada([-103.3496, 20.6597])).toBe("14"); // Guadalajara, Jalisco
    expect(estadoDeCoordenada([-100.3161, 25.6866])).toBe("19"); // Monterrey, Nuevo León
    expect(estadoDeCoordenada([-89.5926, 20.9674])).toBe("31"); // Mérida, Yucatán
  });

  it("el centroide de cada estado cae dentro de ese mismo estado", () => {
    // No es cierto para toda geometría cóncava, pero sí para el centroide
    // precalculado que este paquete usa para colocar etiquetas.
    for (const e of ESTADOS) {
      expect(estadoDeCoordenada(centroideEstado(e.cve)!)).toBe(e.cve);
    }
  });

  it("devuelve null en el mar o fuera de México", () => {
    expect(estadoDeCoordenada([-100, 5])).toBeNull(); // Pacífico, al sur
    expect(estadoDeCoordenada([-70, 20])).toBeNull(); // Atlántico/Caribe
    expect(estadoDeCoordenada([0, 0])).toBeNull();
  });

  it("devuelve null con coordenadas no finitas", () => {
    expect(estadoDeCoordenada([NaN, 19])).toBeNull();
    expect(estadoDeCoordenada([-99, Infinity])).toBeNull();
  });
});
