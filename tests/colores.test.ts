import { describe, it, expect } from "vitest";
import {
  PALETAS,
  PALETA_CATEGORICA,
  lerpHex,
  interpolaPaleta,
  resuelvePaleta,
  escalaSecuencial,
  escalaCuantil,
  escalaCategorica,
} from "../src/colores";

describe("lerpHex", () => {
  it("devuelve los extremos en t=0 y t=1", () => {
    expect(lerpHex("#000000", "#ffffff", 0)).toBe("#000000");
    expect(lerpHex("#000000", "#ffffff", 1)).toBe("#ffffff");
  });
  it("interpola a la mitad", () => {
    expect(lerpHex("#000000", "#ffffff", 0.5)).toBe("#808080");
  });
  it("recorta t fuera de [0,1]", () => {
    expect(lerpHex("#000000", "#ffffff", -1)).toBe("#000000");
    expect(lerpHex("#000000", "#ffffff", 2)).toBe("#ffffff");
  });
});

describe("interpolaPaleta", () => {
  it("toca cada parada de la paleta", () => {
    const p = ["#000000", "#808080", "#ffffff"];
    expect(interpolaPaleta(p, 0)).toBe("#000000");
    expect(interpolaPaleta(p, 0.5)).toBe("#808080");
    expect(interpolaPaleta(p, 1)).toBe("#ffffff");
  });
});

describe("resuelvePaleta", () => {
  it("acepta el nombre de una paleta integrada", () => {
    expect(resuelvePaleta("verde")).toEqual(PALETAS.verde);
  });
  it("acepta un array de colores propio", () => {
    const mia = ["#111111", "#222222"];
    expect(resuelvePaleta(mia)).toBe(mia);
  });
  it("usa colorRange si no hay paleta (compatibilidad)", () => {
    expect(resuelvePaleta(undefined, ["#aaaaaa", "#bbbbbb"])).toEqual(["#aaaaaa", "#bbbbbb"]);
  });
  it("por defecto es azul", () => {
    expect(resuelvePaleta()).toEqual(PALETAS.azul);
  });
  it("lanza con un nombre desconocido", () => {
    expect(() => resuelvePaleta("arcoiris" as never)).toThrow(/desconocida/);
  });
});

describe("escalaSecuencial", () => {
  it("mapea el dominio a los extremos de la paleta", () => {
    const c = escalaSecuencial([0, 100], ["#000000", "#ffffff"]);
    expect(c(0)).toBe("#000000");
    expect(c(100)).toBe("#ffffff");
    expect(c(50)).toBe("#808080");
  });
});

describe("escalaCuantil", () => {
  it("parte en n grupos y describe los tramos", () => {
    const valores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const { color, tramos } = escalaCuantil(valores, "azul", 4);
    expect(tramos).toHaveLength(4);
    // valores de distintos cuantiles dan colores distintos
    expect(color(1)).not.toBe(color(10));
    // el primer tramo arranca en el mínimo, el último termina en el máximo
    expect(tramos[0]!.desde).toBe(1);
    expect(tramos[tramos.length - 1]!.hasta).toBe(10);
  });
  it("no truena con lista vacía", () => {
    const { tramos } = escalaCuantil([], "verde", 5);
    expect(tramos).toEqual([]);
  });
  it("con más grupos que valores distintos da n tramos sin colores NaN", () => {
    const { color, tramos } = escalaCuantil([5, 10], "azul", 5);
    expect(tramos).toHaveLength(5);
    for (const t of tramos) expect(t.color).toMatch(/^#[0-9a-f]{6}$/);
    expect(color(5)).toMatch(/^#[0-9a-f]{6}$/);
  });
  it("con todos los valores iguales no produce NaN ni truena", () => {
    const { color, tramos } = escalaCuantil([7, 7, 7, 7], "verde", 4);
    expect(tramos).toHaveLength(4);
    expect(color(7)).toMatch(/^#[0-9a-f]{6}$/);
    expect(tramos.every((t) => t.color.includes("NaN") === false)).toBe(true);
  });
  it("ignora valores no finitos al construir la escala", () => {
    const { tramos } = escalaCuantil([1, NaN, 3, Infinity, 5], "rojo", 2);
    expect(tramos[0]!.desde).toBe(1);
    expect(tramos[tramos.length - 1]!.hasta).toBe(5);
  });
});

describe("interpolaPaleta / escalaCategorica — bordes", () => {
  it("interpolaPaleta con un solo color devuelve ese color", () => {
    expect(interpolaPaleta(["#123456"], 0.7)).toBe("#123456");
  });
  it("escalaCategorica recicla la paleta si hay más categorías que colores", () => {
    const cats = Array.from({ length: PALETA_CATEGORICA.length + 2 }, (_, i) => `c${i}`);
    const m = escalaCategorica(cats);
    expect(m.size).toBe(cats.length);
    // la categoría n+0 y la n+length comparten color (módulo)
    expect(m.get("c0")).toBe(m.get(`c${PALETA_CATEGORICA.length}`));
  });
});

describe("escalaCategorica", () => {
  it("asigna un color estable por categoría en orden de aparición", () => {
    const m = escalaCategorica(["norte", "sur", "norte", "centro"]);
    expect(m.size).toBe(3);
    expect(m.get("norte")).toBe(PALETA_CATEGORICA[0]);
    expect(m.get("sur")).toBe(PALETA_CATEGORICA[1]);
    expect(m.get("centro")).toBe(PALETA_CATEGORICA[2]);
  });
});
