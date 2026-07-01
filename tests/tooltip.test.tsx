import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { MapaMexico, MapaBurbujas } from "../src/react";

afterEach(cleanup);

describe("renderTooltip", () => {
  it("sin renderTooltip usa el <title> nativo dentro de cada path", () => {
    const { container } = render(<MapaMexico data={{ "09": 100 }} />);
    expect(container.querySelectorAll("path title").length).toBe(32);
  });

  it("con renderTooltip no pinta <title> en los paths", () => {
    const { container } = render(
      <MapaMexico data={{ "09": 100 }} renderTooltip={(e) => e.nombre} />,
    );
    expect(container.querySelectorAll("path title").length).toBe(0);
  });

  it("muestra la tarjeta al pasar el cursor por un estado", () => {
    const { container } = render(
      <MapaMexico data={{ "09": 100 }} renderTooltip={(e, v) => `${e.nombreCorto}=${v}`} />,
    );
    const svg = container.querySelector("svg")!;
    fireEvent.mouseEnter(container.querySelector('path[data-cve="09"]')!);
    fireEvent.mouseMove(svg, { clientX: 10, clientY: 10 });
    expect(container.textContent).toContain("Ciudad de México=100");
  });

  it("pasa null como valor cuando el estado no tiene dato", () => {
    const { container } = render(
      <MapaMexico
        data={{ "09": 100 }}
        renderTooltip={(e, v) => `${e.cve}:${v === null ? "s/d" : v}`}
      />,
    );
    const svg = container.querySelector("svg")!;
    fireEvent.mouseEnter(container.querySelector('path[data-cve="01"]')!);
    fireEvent.mouseMove(svg, { clientX: 5, clientY: 5 });
    expect(container.textContent).toContain("01:s/d");
  });

  it("<MapaBurbujas> también soporta renderTooltip", () => {
    const { container } = render(
      <MapaBurbujas data={{ "09": 100 }} renderTooltip={(e, v) => `${e.nombreCorto} ${v}`} />,
    );
    const svg = container.querySelector("svg")!;
    fireEvent.mouseEnter(container.querySelector('circle[data-cve-burbuja="09"]')!);
    fireEvent.mouseMove(svg, { clientX: 8, clientY: 8 });
    expect(container.textContent).toContain("Ciudad de México 100");
  });
});
