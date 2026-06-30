import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/react.tsx", "src/municipios.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  // dependencias y peers quedan fuera del bundle; el TopoJSON sí se incrusta.
  external: ["react", "react-dom", "d3-geo", "topojson-client"],
});
