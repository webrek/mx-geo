import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { MapaMosaico } from "../src/react";
import { mosaicoSVG } from "../src/svg";
import { MOSAICO_ESTADOS } from "../src/index";

afterEach(cleanup);

describe("layout del mosaico", () => {
  it("tiene los 32 estados en celdas únicas", () => {
    const claves = Object.keys(MOSAICO_ESTADOS);
    expect(claves).toHaveLength(32);
    const celdas = new Set(Object.values(MOSAICO_ESTADOS).map((c) => c.join(",")));
    expect(celdas.size).toBe(32);
  });
});

describe("<MapaMosaico>", () => {
  it("dibuja 32 mosaicos con su abreviatura", () => {
    const { container, getByText } = render(<MapaMosaico />);
    expect(container.querySelectorAll("g[data-cve]")).toHaveLength(32);
    expect(getByText("CDMX")).toBeTruthy();
  });

  it("muestra el valor bajo la abreviatura cuando hay data", () => {
    const { getByText } = render(
      <MapaMosaico data={{ "09": 320 }} formatValue={(v) => String(v)} />,
    );
    expect(getByText("320")).toBeTruthy();
  });

  it("llama onSelect con el estado al hacer clic", () => {
    const onSelect = vi.fn();
    const { container } = render(<MapaMosaico onSelect={onSelect} />);
    fireEvent.click(container.querySelector('g[data-cve="14"]')!);
    expect(onSelect.mock.lastCall?.[0]).toMatchObject({ cve: "14" });
  });

  it("colorea distinto un estado con dato vs uno sin dato", () => {
    const { container } = render(<MapaMosaico data={{ "09": 100 }} emptyColor="#eeeeee" />);
    const con = container.querySelector('g[data-cve="09"] rect')!;
    const sin = container.querySelector('g[data-cve="01"] rect')!;
    expect(con.getAttribute("fill")).not.toBe("#eeeeee");
    expect(sin.getAttribute("fill")).toBe("#eeeeee");
  });
});

describe("mosaicoSVG", () => {
  it("genera 32 mosaicos como SVG", () => {
    const svg = mosaicoSVG();
    expect(svg.startsWith("<svg")).toBe(true);
    expect((svg.match(/<rect/g) ?? []).length).toBe(32);
  });

  it("incluye el valor y escapa el título", () => {
    const svg = mosaicoSVG({ data: { "09": 320 }, formatValue: (v) => String(v), titulo: "A & B" });
    expect(svg).toContain(">320<");
    expect(svg).toContain("A &amp; B");
  });
});
