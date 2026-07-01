import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MapaMexico } from "../src/react";

afterEach(cleanup);

describe("leyenda embebida", () => {
  it("sin leyenda ni tooltip la raíz es el <svg>", () => {
    const { container } = render(<MapaMexico data={{ "09": 100 }} />);
    expect((container.firstChild as Element)?.tagName.toLowerCase()).toBe("svg");
  });

  it("con `leyenda` envuelve en <div> y muestra el título", () => {
    const { container, getByText } = render(
      <MapaMexico data={{ "09": 100, "14": 50 }} leyenda leyendaTitulo="Ventas" />,
    );
    expect((container.firstChild as Element)?.tagName.toLowerCase()).toBe("div");
    expect(getByText("Ventas")).toBeTruthy();
  });

  it("con `leyenda` y categorías muestra la leyenda categórica", () => {
    const { getByText } = render(
      <MapaMexico categorias={{ "09": "centro", "19": "norte" }} leyenda leyendaTitulo="Zona" />,
    );
    expect(getByText("Zona")).toBeTruthy();
    expect(getByText("centro")).toBeTruthy();
    expect(getByText("norte")).toBeTruthy();
  });
});

describe("animación de relleno", () => {
  it("por defecto el path tiene transición de fill", () => {
    const { container } = render(<MapaMexico data={{ "09": 100 }} />);
    expect(container.querySelector('path[data-cve="09"]')!.getAttribute("style")).toContain(
      "fill 0.3s",
    );
  });

  it("animar=false quita la transición", () => {
    const { container } = render(<MapaMexico data={{ "09": 100 }} animar={false} />);
    const style = container.querySelector('path[data-cve="09"]')!.getAttribute("style") ?? "";
    expect(style).not.toContain("fill 0.3s");
  });
});
