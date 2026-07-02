import { describe, it, expect } from "vitest";
import { municipioDeCoordenada, municipio } from "../src/municipios";

describe("municipioDeCoordenada", () => {
  it("ubica una coordenada en su municipio (CVEGEO válido del estado correcto)", async () => {
    const cvegeo = await municipioDeCoordenada([-99.1332, 19.4326]); // Centro de la CDMX
    expect(cvegeo).toMatch(/^09\d{3}$/); // pertenece a la CDMX (cve_ent 09)
    expect(municipio(cvegeo!)).not.toBeNull(); // es un municipio real del índice
  });

  it("ubica Guadalajara en un municipio de Jalisco", async () => {
    const cvegeo = await municipioDeCoordenada([-103.3496, 20.6597]);
    expect(cvegeo).toMatch(/^14\d{3}$/);
  });

  it("devuelve null en el mar o fuera de México", async () => {
    expect(await municipioDeCoordenada([-100, 5])).toBeNull();
    expect(await municipioDeCoordenada([NaN, 19])).toBeNull();
  });
});
