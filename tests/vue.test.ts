import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { MapaMexico } from "../src/vue";
import type { Estado } from "../src/index";

describe("<MapaMexico> (Vue)", () => {
  it("renderiza 32 estados con su clave", () => {
    const w = mount(MapaMexico);
    expect(w.findAll("path[data-cve]")).toHaveLength(32);
    expect(w.find("svg").attributes("role")).toBe("group");
  });

  it("emite 'select' con el estado al hacer clic", async () => {
    const w = mount(MapaMexico);
    await w.find('path[data-cve="14"]').trigger("click");
    const ev = w.emitted("select");
    expect(ev).toBeTruthy();
    expect((ev![0]![0] as Estado).cve).toBe("14");
    expect((ev![0]![0] as Estado).nombreCorto).toBe("Jalisco");
  });

  it("colorea distinto un estado con dato vs uno sin dato", () => {
    const w = mount(MapaMexico, { props: { data: { "09": 100 }, emptyColor: "#eeeeee" } });
    expect(w.find('path[data-cve="09"]').attributes("fill")).not.toBe("#eeeeee");
    expect(w.find('path[data-cve="01"]').attributes("fill")).toBe("#eeeeee");
  });

  it("acepta paleta con nombre (rojo → parada más oscura en el máximo)", () => {
    const w = mount(MapaMexico, { props: { data: { "09": 100 }, paleta: "rojo" } });
    expect(w.find('path[data-cve="09"]').attributes("fill")).toBe("#991b1b");
  });

  it("etiquetas pinta 32 textos y Enter emite select", async () => {
    const w = mount(MapaMexico, { props: { etiquetas: true } });
    expect(w.findAll("text").length).toBe(32);
    await w.find('path[data-cve="09"]').trigger("keydown", { key: "Enter" });
    expect((w.emitted("select")![0]![0] as Estado).cve).toBe("09");
  });
});
