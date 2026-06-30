import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { municipios, municipio, municipiosTopoJSON, MapaMunicipios } from "../src/municipios";

afterEach(cleanup);

describe("datos de municipios", () => {
  it("trae 2,436 municipios con CVEGEO de 5 dígitos", () => {
    const todos = municipios();
    expect(todos.length).toBe(2436);
    expect(municipiosTopoJSON.objects.municipios.geometries).toHaveLength(2436);
    for (const m of todos.slice(0, 50)) {
      expect(m.cvegeo).toMatch(/^\d{5}$/);
      expect(m.cvegeo).toBe(m.cve_ent + m.cve_mun);
    }
  });

  it("filtra por estado y CDMX tiene 16 alcaldías", () => {
    expect(municipios("09")).toHaveLength(16);
    expect(municipios("09").every((m) => m.cve_ent === "09")).toBe(true);
  });

  it("busca un municipio por CVEGEO", () => {
    expect(municipio("09012")?.nombre).toBe("Tlalpan");
    expect(municipio("99999")).toBeNull();
  });
});

describe("<MapaMunicipios>", () => {
  it("dibuja solo los municipios del estado indicado", () => {
    const { container } = render(<MapaMunicipios estado="09" />);
    const paths = container.querySelectorAll("path[data-cvegeo]");
    expect(paths).toHaveLength(16);
    for (const p of paths) {
      expect(p.getAttribute("data-cvegeo")!.startsWith("09")).toBe(true);
      expect((p.getAttribute("d") ?? "").length).toBeGreaterThan(0);
    }
  });

  it("llama onSelect con el municipio al hacer clic", () => {
    const onSelect = vi.fn();
    const { container } = render(<MapaMunicipios estado="09" onSelect={onSelect} />);
    fireEvent.click(container.querySelector('path[data-cvegeo="09012"]')!);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.lastCall?.[0]).toMatchObject({ cvegeo: "09012", nombre: "Tlalpan" });
  });
});
