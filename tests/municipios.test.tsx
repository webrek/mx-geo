import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { municipios, municipio, cargaMunicipios, MapaMunicipios } from "../src/municipios";

afterEach(cleanup);

describe("índice de municipios", () => {
  it("trae 2,475 municipios con CVEGEO de 5 dígitos", () => {
    const todos = municipios();
    expect(todos.length).toBe(2475);
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

describe("cargaMunicipios", () => {
  it("carga la geometría de un estado bajo demanda", async () => {
    const topo = await cargaMunicipios("09");
    const obj = topo.objects[Object.keys(topo.objects)[0]!]!;
    expect(obj.geometries).toHaveLength(16);
    expect(obj.geometries[0]!.properties.cve_ent).toBe("09");
  });

  it("rechaza un estado desconocido", async () => {
    await expect(cargaMunicipios("99")).rejects.toThrow();
  });
});

describe("<MapaMunicipios>", () => {
  it("dibuja los municipios del estado tras cargar la geometría", async () => {
    const { container } = render(<MapaMunicipios estado="09" />);
    await waitFor(() => {
      expect(container.querySelectorAll("path[data-cvegeo]")).toHaveLength(16);
    });
    for (const p of container.querySelectorAll("path[data-cvegeo]")) {
      expect(p.getAttribute("data-cvegeo")!.startsWith("09")).toBe(true);
      expect((p.getAttribute("d") ?? "").length).toBeGreaterThan(0);
    }
  });

  it("llama onSelect con el municipio al hacer clic", async () => {
    const onSelect = vi.fn();
    const { container } = render(<MapaMunicipios estado="09" onSelect={onSelect} />);
    await waitFor(() =>
      expect(container.querySelector('path[data-cvegeo="09012"]')).not.toBeNull(),
    );
    fireEvent.click(container.querySelector('path[data-cvegeo="09012"]')!);
    expect(onSelect.mock.lastCall?.[0]).toMatchObject({ cvegeo: "09012", nombre: "Tlalpan" });
  });
});
