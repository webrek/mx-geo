import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { MapaMexico } from "../src/react";

afterEach(cleanup);

describe("<MapaMexico>", () => {
  it("renderiza 32 trazos de estado, cada uno con su clave", () => {
    const { container } = render(<MapaMexico />);
    const paths = container.querySelectorAll("path[data-cve]");
    expect(paths).toHaveLength(32);
    // todos los trazos tienen geometría (atributo d no vacío)
    for (const p of paths) {
      expect((p.getAttribute("d") ?? "").length).toBeGreaterThan(0);
    }
  });

  it("pinta distinto un estado con dato que uno sin dato", () => {
    const { container } = render(<MapaMexico data={{ "09": 100 }} emptyColor="#eeeeee" />);
    const cdmx = container.querySelector('path[data-cve="09"]')!;
    const otro = container.querySelector('path[data-cve="01"]')!;
    expect(cdmx.getAttribute("fill")).not.toBe("#eeeeee");
    expect(otro.getAttribute("fill")).toBe("#eeeeee");
  });

  it("llama onSelect con el estado al hacer clic", () => {
    const onSelect = vi.fn();
    const { container } = render(<MapaMexico onSelect={onSelect} />);
    fireEvent.click(container.querySelector('path[data-cve="14"]')!);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.lastCall?.[0]).toMatchObject({ cve: "14", nombreCorto: "Jalisco" });
  });
});
