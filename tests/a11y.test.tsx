import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { MapaMexico, MapaMosaico, MapaBurbujas } from "../src/react";

afterEach(cleanup);

describe("accesibilidad — teclado y roles", () => {
  it("sin onSelect el svg es role=img y los estados no son enfocables", () => {
    const { container } = render(<MapaMexico />);
    expect(container.querySelector("svg")!.getAttribute("role")).toBe("img");
    expect(container.querySelector('path[data-cve="09"]')!.getAttribute("tabindex")).toBeNull();
  });

  it("con onSelect el svg es role=group y cada estado es un botón enfocable con etiqueta", () => {
    const { container } = render(<MapaMexico data={{ "09": 100 }} onSelect={() => {}} />);
    expect(container.querySelector("svg")!.getAttribute("role")).toBe("group");
    const cdmx = container.querySelector('path[data-cve="09"]')!;
    expect(cdmx.getAttribute("tabindex")).toBe("0");
    expect(cdmx.getAttribute("role")).toBe("button");
    expect(cdmx.getAttribute("aria-label")).toContain("Ciudad de México");
  });

  it("Enter y Espacio disparan onSelect", () => {
    const onSelect = vi.fn();
    const { container } = render(<MapaMexico onSelect={onSelect} />);
    const jal = container.querySelector('path[data-cve="14"]')!;
    fireEvent.keyDown(jal, { key: "Enter" });
    fireEvent.keyDown(jal, { key: " " });
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect.mock.lastCall?.[0]).toMatchObject({ cve: "14" });
  });

  it("<MapaMosaico> también expone botones enfocables", () => {
    const { container } = render(<MapaMosaico onSelect={() => {}} />);
    expect(container.querySelector('g[data-cve="09"]')!.getAttribute("tabindex")).toBe("0");
    expect(container.querySelector('g[data-cve="09"]')!.getAttribute("role")).toBe("button");
  });

  it("<MapaBurbujas> dispara onSelect con teclado", () => {
    const onSelect = vi.fn();
    const { container } = render(<MapaBurbujas data={{ "09": 100 }} onSelect={onSelect} />);
    fireEvent.keyDown(container.querySelector('circle[data-cve-burbuja="09"]')!, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
