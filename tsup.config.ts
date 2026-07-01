import { defineConfig } from "tsup";

const external = ["react", "react-dom", "vue", "d3-geo", "topojson-client"];

export default defineConfig([
  // Núcleo + estados: ligeros, ESM + CJS.
  {
    entry: ["src/index.ts", "src/react.tsx", "src/svg.ts", "src/vue.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    treeshake: true,
    sourcemap: false,
    external,
  },
  // Municipios: ESM-only con code-splitting (un chunk por estado, carga
  // bajo demanda). En CJS los 32 estados se inlinearían en un solo archivo
  // de varios MB, así que este entry es solo ESM.
  {
    entry: ["src/municipios.tsx"],
    format: ["esm"],
    dts: true,
    clean: false,
    treeshake: true,
    splitting: true,
    sourcemap: false,
    external,
  },
]);
