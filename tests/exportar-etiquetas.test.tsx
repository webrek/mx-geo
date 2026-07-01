import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MapaMunicipios } from "../src/municipios";
import { svgAString, descargaSVG } from "../src/react";

afterEach(cleanup);

describe("<MapaMunicipios> etiquetas", () => {
  it("sin etiquetas no dibuja <text> de municipio", async () => {
    const { container } = render(<MapaMunicipios estado="09" />);
    await waitFor(() => expect(container.querySelectorAll("path[data-cvegeo]")).toHaveLength(16));
    expect(container.querySelectorAll("text")).toHaveLength(0);
  });

  it("etiquetas pinta el nombre de cada municipio", async () => {
    const { container } = render(<MapaMunicipios estado="09" etiquetas />);
    await waitFor(() => expect(container.querySelectorAll("path[data-cvegeo]")).toHaveLength(16));
    const textos = [...container.querySelectorAll("text")].map((t) => t.textContent);
    expect(textos.length).toBe(16);
    expect(textos).toContain("Coyoacán");
  });
});

describe("exportar", () => {
  it("svgAString serializa el SVG con el namespace", () => {
    const { container } = render(
      <svg viewBox="0 0 10 10">
        <rect width="10" height="10" />
      </svg>,
    );
    const svg = container.querySelector("svg")!;
    const s = svgAString(svg as unknown as SVGSVGElement);
    expect(s).toContain("<svg");
    expect(s).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(s).toContain("<rect");
  });

  it("descargaSVG dispara la descarga de un blob", () => {
    // jsdom no implementa URL.createObjectURL; lo definimos.
    const createURL = vi.fn(() => "blob:x");
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = createURL;
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const { container } = render(
      <svg viewBox="0 0 10 10">
        <rect width="10" height="10" />
      </svg>,
    );
    descargaSVG(container.querySelector("svg")! as unknown as SVGSVGElement, "prueba.svg");
    expect(click).toHaveBeenCalledOnce();
    expect(createURL).toHaveBeenCalledOnce();
    click.mockRestore();
  });
});
