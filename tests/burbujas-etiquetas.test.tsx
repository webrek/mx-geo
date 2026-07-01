import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { MapaMexico, MapaBurbujas } from "../src/react";

afterEach(cleanup);

describe("<MapaMexico> etiquetas", () => {
  it("sin etiquetas no renderiza <text> de estado", () => {
    const { container } = render(<MapaMexico />);
    // solo el <title> accesible, ningún <text>
    expect(container.querySelectorAll("text")).toHaveLength(0);
  });

  it("etiquetas=true pinta la abreviatura de los 32 estados", () => {
    const { container, getAllByText } = render(<MapaMexico etiquetas />);
    expect(container.querySelectorAll("text")).toHaveLength(32);
    expect(getAllByText("CDMX").length).toBeGreaterThan(0);
  });

  it('etiquetas="nombre" usa el nombre corto', () => {
    const { container } = render(<MapaMexico etiquetas="nombre" />);
    const textos = [...container.querySelectorAll("text")].map((t) => t.textContent);
    expect(textos).toContain("Jalisco");
  });

  it("etiquetas función recibe el estado", () => {
    const { container } = render(<MapaMexico etiquetas={(e) => e.cve} />);
    const textos = [...container.querySelectorAll("text")].map((t) => t.textContent);
    expect(textos).toContain("14"); // Jalisco
  });
});

describe("<MapaBurbujas>", () => {
  it("dibuja una burbuja por estado con dato positivo", () => {
    const { container } = render(<MapaBurbujas data={{ "09": 100, "14": 40 }} />);
    expect(container.querySelectorAll("circle[data-cve-burbuja]")).toHaveLength(2);
  });

  it("el radio crece con la raíz del valor (área proporcional)", () => {
    const { container } = render(<MapaBurbujas data={{ "09": 100, "14": 25 }} radioMax={40} />);
    const c09 = container.querySelector('circle[data-cve-burbuja="09"]')!;
    const c14 = container.querySelector('circle[data-cve-burbuja="14"]')!;
    // 100 → r=40 (máx); 25 → r=40*sqrt(0.25)=20
    expect(Number(c09.getAttribute("r"))).toBeCloseTo(40, 5);
    expect(Number(c14.getAttribute("r"))).toBeCloseTo(20, 5);
  });

  it("ignora valores no positivos y llama onSelect al hacer clic", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <MapaBurbujas data={{ "09": 100, "14": 0, "19": -5 }} onSelect={onSelect} />,
    );
    expect(container.querySelectorAll("circle[data-cve-burbuja]")).toHaveLength(1);
    fireEvent.click(container.querySelector('circle[data-cve-burbuja="09"]')!);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.lastCall?.[0]).toMatchObject({ cve: "09" });
  });
});
