import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MapaMexico, Leyenda } from "../src/react";
import { REGION_POR_ESTADO, escalaCuantil, PALETA_CATEGORICA } from "../src/index";

afterEach(cleanup);

describe("<MapaMexico> categórico", () => {
  it("pinta por categoría (región) y no por degradado", () => {
    const { container } = render(
      <MapaMexico categorias={REGION_POR_ESTADO} emptyColor="#eeeeee" />,
    );
    const cdmx = container.querySelector('path[data-cve="09"]')!; // centro
    const nl = container.querySelector('path[data-cve="19"]')!; // norte
    expect(cdmx.getAttribute("fill")).not.toBe("#eeeeee");
    // regiones distintas => colores distintos
    expect(cdmx.getAttribute("fill")).not.toBe(nl.getAttribute("fill"));
  });

  it("acepta una paleta con nombre integrado", () => {
    const { container } = render(<MapaMexico data={{ "09": 100 }} paleta="rojo" />);
    const cdmx = container.querySelector('path[data-cve="09"]')!;
    // valor máximo => parada más oscura de la paleta rojo
    expect(cdmx.getAttribute("fill")).toBe("#991b1b");
  });
});

describe("<Leyenda>", () => {
  it("modo gradiente muestra los extremos del dominio", () => {
    const { getByText } = render(<Leyenda dominio={[0, 1000]} paleta="azul" />);
    expect(getByText("0")).toBeTruthy();
    expect(getByText("1000")).toBeTruthy();
  });

  it("modo cuantil dibuja un renglón por tramo", () => {
    const { tramos } = escalaCuantil([1, 2, 3, 4, 5, 6, 7, 8], "verde", 4);
    const { container } = render(<Leyenda tipo="cuantil" tramos={tramos} />);
    expect(container.querySelectorAll("li")).toHaveLength(4);
  });

  it("modo categorías lista cada etiqueta", () => {
    const cats = new Map([
      ["Norte", PALETA_CATEGORICA[0]!],
      ["Sur", PALETA_CATEGORICA[1]!],
    ]);
    const { getByText, container } = render(<Leyenda tipo="categorias" categorias={cats} />);
    expect(getByText("Norte")).toBeTruthy();
    expect(getByText("Sur")).toBeTruthy();
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });
});
