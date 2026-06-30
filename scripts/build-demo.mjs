import { build } from "esbuild";
await build({
  entryPoints: ["examples/demo.tsx"],
  bundle: true,
  format: "esm",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  outfile: "docs/demo.js",
  minify: true,
  logLevel: "info",
});
