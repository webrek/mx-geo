import { build } from "esbuild";
import { rmSync } from "node:fs";

// Limpia el bundle viejo (index.html se conserva).
rmSync("docs/demo.js", { force: true });
rmSync("docs/chunks", { recursive: true, force: true });

await build({
  entryPoints: ["examples/demo.tsx"],
  bundle: true,
  format: "esm",
  splitting: true, // un chunk por estado: la geometría municipal carga bajo demanda
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  outdir: "docs",
  entryNames: "demo",
  chunkNames: "chunks/[name]-[hash]",
  minify: true,
  logLevel: "info",
});
