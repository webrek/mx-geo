import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { MapaMexico } from "../src/react";

afterEach(cleanup);

function transformDe(container: HTMLElement) {
  return container.querySelector("svg > g")?.getAttribute("transform") ?? null;
}

describe("zoom & pan", () => {
  it("sin zoom no aplica transform al grupo", () => {
    const { container } = render(<MapaMexico />);
    expect(transformDe(container)).toBeNull();
  });

  it("con zoom parte en escala 1", () => {
    const { container } = render(<MapaMexico zoom />);
    expect(transformDe(container)).toBe("translate(0 0) scale(1)");
  });

  it("la rueda hacia arriba acerca (escala > 1)", () => {
    const { container } = render(<MapaMexico zoom />);
    const svg = container.querySelector("svg")!;
    fireEvent.wheel(svg, { deltaY: -100 });
    const tr = transformDe(container)!;
    const k = Number(tr.match(/scale\(([\d.]+)\)/)![1]);
    expect(k).toBeGreaterThan(1);
  });

  it("respeta la escala máxima", () => {
    const { container } = render(<MapaMexico zoom={{ max: 2 }} />);
    const svg = container.querySelector("svg")!;
    for (let i = 0; i < 30; i++) fireEvent.wheel(svg, { deltaY: -100 });
    const k = Number(transformDe(container)!.match(/scale\(([\d.]+)\)/)![1]);
    expect(k).toBeLessThanOrEqual(2);
  });

  it("doble clic reinicia el zoom", () => {
    const { container } = render(<MapaMexico zoom />);
    const svg = container.querySelector("svg")!;
    fireEvent.wheel(svg, { deltaY: -100 });
    expect(transformDe(container)).not.toBe("translate(0 0) scale(1)");
    fireEvent.doubleClick(svg);
    expect(transformDe(container)).toBe("translate(0 0) scale(1)");
  });
});
