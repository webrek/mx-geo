/**
 * Adaptador Vue de @webrek/mx-geo. Un componente `<MapaMexico>` para Vue 3
 * (render function, sin SFC), equivalente al de React para lo esencial:
 * choropleth por `data` o `categorias`, paletas, etiquetas y evento `select`.
 * El resto del paquete (catálogo, escalas, mx-cp) es framework-free y se usa
 * igual desde Vue.
 */
import { defineComponent, h, ref, computed, type PropType } from "vue";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";
import { estadosTopoJSON } from "./index";
import { ESTADOS } from "./estados.generated";
import { CENTROIDES_ESTADOS } from "./centroides";
import {
  PALETA_CATEGORICA,
  coloresCategorias,
  interpolaPaleta,
  resuelvePaleta,
  type Paleta,
  type PaletaInput,
} from "./colores";
import type { Estado } from "./types";

const WIDTH = 800;
const HEIGHT = 600;
const PORCVE = new Map<string, Estado>(ESTADOS.map((e) => [e.cve, e]));

type Etiquetas = boolean | "abr" | "nombre" | ((estado: Estado) => string);

export const MapaMexico = defineComponent({
  name: "MapaMexico",
  props: {
    data: { type: Object as PropType<Record<string, number>>, default: undefined },
    categorias: { type: Object as PropType<Record<string, string>>, default: undefined },
    paleta: { type: [String, Array] as PropType<PaletaInput>, default: undefined },
    colorRange: { type: Array as unknown as PropType<[string, string]>, default: undefined },
    paletaCategorica: { type: Array as PropType<Paleta>, default: () => PALETA_CATEGORICA },
    emptyColor: { type: String, default: "#e5e7eb" },
    stroke: { type: String, default: "#ffffff" },
    formatValue: {
      type: Function as PropType<(valor: number, estado: Estado) => string>,
      default: undefined,
    },
    etiquetas: { type: [Boolean, String, Function] as PropType<Etiquetas>, default: false },
    colorEtiqueta: { type: String, default: "#334155" },
    ariaLabel: { type: String, default: "Mapa de México por estados" },
  },
  emits: {
    select: (estado: Estado) => !!estado,
  },
  setup(props, { emit }) {
    const hover = ref<string | null>(null);

    const cols = computed<Paleta>(() => resuelvePaleta(props.paleta, props.colorRange));
    const colorCat = computed(() =>
      props.categorias ? coloresCategorias(props.categorias, props.paletaCategorica) : null,
    );

    const modelo = computed(() => {
      const fc = feature(
        estadosTopoJSON as never,
        (estadosTopoJSON as never as { objects: { estados: unknown } }).objects.estados as never,
      ) as unknown as { features: Array<Feature<Geometry, { cve: string }>> };

      const projection = geoMercator().fitExtent(
        [
          [12, 12],
          [WIDTH - 12, HEIGHT - 12],
        ],
        fc as never,
      );
      const path = geoPath(projection);
      const vals = props.data ? Object.values(props.data).filter((v) => Number.isFinite(v)) : [];
      const min = vals.length ? Math.min(...vals) : 0;
      const max = vals.length ? Math.max(...vals) : 0;
      const paths = fc.features.map((f) => ({ cve: f.properties.cve, d: path(f) ?? "" }));
      const centros: Record<string, [number, number]> = {};
      for (const [cve, ll] of Object.entries(CENTROIDES_ESTADOS)) {
        const p = projection(ll);
        if (p) centros[cve] = p;
      }
      return { paths, centros, min, max };
    });

    function fillFor(cve: string): string {
      const cc = colorCat.value;
      if (cc) {
        const cat = props.categorias?.[cve];
        return (cat != null ? cc.get(cat) : undefined) ?? props.emptyColor;
      }
      const v = props.data?.[cve];
      if (v == null || !Number.isFinite(v)) return props.emptyColor;
      const { min, max } = modelo.value;
      const t = max > min ? (v - min) / (max - min) : 1;
      return interpolaPaleta(cols.value, t);
    }

    function textoEtiqueta(e: Estado): string {
      const et = props.etiquetas;
      if (typeof et === "function") return et(e);
      if (et === "nombre") return e.nombreCorto;
      return e.abreviatura;
    }

    return () => {
      const { paths, centros } = modelo.value;

      const trazos = paths.map(({ cve, d }) => {
        const e = PORCVE.get(cve);
        const v = props.data?.[cve];
        const etiqueta =
          v != null && Number.isFinite(v)
            ? `${e?.nombreCorto}: ${props.formatValue ? props.formatValue(v, e!) : v}`
            : props.categorias?.[cve] != null
              ? `${e?.nombreCorto}: ${props.categorias[cve]}`
              : (e?.nombreCorto ?? cve);
        return h(
          "path",
          {
            key: cve,
            d,
            fill: fillFor(cve),
            stroke: hover.value === cve ? "#111827" : props.stroke,
            "stroke-width": hover.value === cve ? 1.6 : 0.6,
            "vector-effect": "non-scaling-stroke",
            tabindex: 0,
            role: "button",
            "aria-label": etiqueta,
            style: { cursor: "pointer", outline: "none" },
            "data-cve": cve,
            onMouseenter: () => (hover.value = cve),
            onMouseleave: () => hover.value === cve && (hover.value = null),
            onClick: () => e && emit("select", e),
            onKeydown: (ev: KeyboardEvent) => {
              if ((ev.key === "Enter" || ev.key === " ") && e) {
                ev.preventDefault();
                emit("select", e);
              }
            },
          },
          [h("title", etiqueta)],
        );
      });

      const textos = props.etiquetas
        ? paths.map(({ cve }) => {
            const e = PORCVE.get(cve);
            const p = centros[cve];
            if (!e || !p) return null;
            return h(
              "text",
              {
                key: `t-${cve}`,
                x: p[0],
                y: p[1],
                "text-anchor": "middle",
                "dominant-baseline": "central",
                "font-size": 9,
                fill: props.colorEtiqueta,
                style: { pointerEvents: "none", userSelect: "none" },
              },
              textoEtiqueta(e),
            );
          })
        : [];

      return h(
        "svg",
        {
          viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
          role: "group",
          "aria-label": props.ariaLabel,
          style: { width: "100%", height: "auto", display: "block" },
        },
        [h("title", props.ariaLabel), ...trazos, ...textos],
      );
    };
  },
});
