import { describe, it, expect } from "vitest";
import { mapaSVG } from "../src/svg";

describe("mapaSVG (render en servidor)", () => {
  it("devuelve un SVG con los 32 estados", () => {
    const svg = mapaSVG();
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
    expect((svg.match(/<path/g) ?? []).length).toBe(32);
  });

  it("sin etiquetas no incluye <text>; con etiquetas incluye 32", () => {
    expect((mapaSVG().match(/<text/g) ?? []).length).toBe(0);
    expect((mapaSVG({ etiquetas: true }).match(/<text/g) ?? []).length).toBe(32);
  });

  it("pinta el valor máximo con la parada más oscura de la paleta", () => {
    const svg = mapaSVG({ data: { "09": 100, "01": 1 }, paleta: "rojo" });
    expect(svg).toContain('fill="#991b1b"'); // extremo de la paleta rojo
  });

  it("respeta width/height/background", () => {
    const svg = mapaSVG({ width: 400, height: 300, background: "#fff" });
    expect(svg).toContain('viewBox="0 0 400 300"');
    expect(svg).toContain('<rect width="400" height="300" fill="#fff"/>');
  });

  it("escapa caracteres especiales del título", () => {
    const svg = mapaSVG({ titulo: 'Ventas <A & B> "2026"' });
    expect(svg).toContain("Ventas &lt;A &amp; B&gt; &quot;2026&quot;");
    expect(svg).not.toContain("<A & B>");
  });

  it("modo categórico pinta por categoría", () => {
    const svg = mapaSVG({ categorias: { "09": "a", "19": "b" }, emptyColor: "#eeeeee" });
    // al menos dos colores de categoría distintos del emptyColor
    const fills = [...svg.matchAll(/fill="(#[0-9a-f]{6})"/g)].map((m) => m[1]);
    const noVacios = new Set(fills.filter((c) => c !== "#eeeeee" && c !== "#ffffff"));
    expect(noVacios.size).toBeGreaterThanOrEqual(2);
  });

  it("cada path lleva data-cve y data-nombre (interactividad vanilla)", () => {
    const svg = mapaSVG();
    const cves = [...svg.matchAll(/data-cve="(\d{2})"/g)].map((m) => m[1]);
    expect(new Set(cves).size).toBe(32);
    expect(svg).toContain('data-cve="09" data-nombre="Ciudad de México"');
  });
});

describe("mosaicoSVG (data-attrs)", () => {
  it("cada celda lleva data-cve y data-nombre", async () => {
    const { mosaicoSVG } = await import("../src/svg");
    const svg = mosaicoSVG();
    const cves = [...svg.matchAll(/data-cve="(\d{2})"/g)].map((m) => m[1]);
    expect(new Set(cves).size).toBe(32);
    expect(svg).toContain('data-cve="19" data-nombre="Nuevo León"');
  });
});
