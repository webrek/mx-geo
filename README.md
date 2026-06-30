# @webrek/mx-geo

[![npm](https://img.shields.io/npm/v/@webrek/mx-geo.svg?style=flat-square)](https://www.npmjs.com/package/@webrek/mx-geo)
[![Pruebas](https://img.shields.io/github/actions/workflow/status/webrek/mx-geo/ci.yml?branch=main&label=tests&style=flat-square)](https://github.com/webrek/mx-geo/actions)
[![Licencia](https://img.shields.io/npm/l/@webrek/mx-geo.svg?style=flat-square)](LICENSE)

Mapa de **México por estados** para dashboards, con la división política llaveada por
**claves de INEGI** (`CVE_ENT`). Trae tres cosas que normalmente tendrías que armar a mano:

1. Un **catálogo tipado** de los 32 estados (clave INEGI, nombre oficial, nombre corto,
   abreviatura, ISO 3166-2, capital).
2. Un **TopoJSON** ligero (~17 KB) de las 32 geometrías, ya llaveado por `CVE_ENT`.
3. Un componente **React choropleth** (`<MapaMexico>`) que se pinta solo con tus datos —
   SVG puro, **sin librería de mapas ni API key**.

El núcleo de datos (catálogo + TopoJSON + helpers) no depende de React; el componente
vive en el subpath `@webrek/mx-geo/react`.

## Instalación

```bash
pnpm add @webrek/mx-geo
# para el componente, además:
pnpm add react
```

## Catálogo y normalización (sin React)

```ts
import { ESTADOS, estado, normalizaEstado, buscaEstado } from "@webrek/mx-geo";

ESTADOS.length; // 32
estado("09")?.nombre; // "Ciudad de México"

// Normaliza casi cualquier forma de escribir un estado a su CVE_ENT.
normalizaEstado("CDMX"); // "09"
normalizaEstado("Distrito Federal"); // "09"
normalizaEstado("nuevo leon"); // "19"
normalizaEstado("MX-JAL"); // "14"
normalizaEstado("Edomex"); // "15"
normalizaEstado("Narnia"); // null

buscaEstado("yucatán"); // { cve: "31", nombre: "Yucatán", capital: "Mérida", … }
```

Esto es justo lo que necesitas para **normalizar una columna de texto a clave** antes
de cruzarla (_join_) con tus datos de ventas, tiendas, usuarios, etc.

## Componente choropleth

```tsx
"use client";
import { MapaMexico } from "@webrek/mx-geo/react";

const ventasPorEstado = { "09": 1200, "14": 980, "19": 760, "15": 1500 };

export function Tablero() {
  return (
    <MapaMexico
      data={ventasPorEstado} // { CVE_ENT: número }
      colorRange={["#dbeafe", "#1e3a8a"]}
      onSelect={(e) => console.log("clic en", e.nombre, e.cve)}
      formatValue={(v) => `$${v.toLocaleString("es-MX")}`}
    />
  );
}
```

El SVG es responsivo (ocupa el ancho del contenedor). Los estados sin valor en `data`
se pintan con `emptyColor`, así que también sirve como mapa base estático.

### Props

| Prop          | Tipo                       | Por defecto                    | Descripción                                 |
| ------------- | -------------------------- | ------------------------------ | ------------------------------------------- |
| `data`        | `Record<string, number>`   | —                              | Valores por `CVE_ENT`. Sin esto, mapa base. |
| `colorRange`  | `[string, string]`         | `["#dbeafe","#1e3a8a"]`        | Color [mínimo, máximo] del choropleth.      |
| `emptyColor`  | `string`                   | `"#e5e7eb"`                    | Color de un estado sin dato.                |
| `stroke`      | `string`                   | `"#ffffff"`                    | Color del borde.                            |
| `onSelect`    | `(estado: Estado) => void` | —                              | Clic en un estado.                          |
| `formatValue` | `(v, estado) => string`    | —                              | Formato del valor en el tooltip.            |
| `ariaLabel`   | `string`                   | `"Mapa de México por estados"` | Etiqueta accesible.                         |
| `className`   | `string`                   | —                              | Clase del `<svg>`.                          |

## El TopoJSON directo

Si quieres dibujarlo con tu propia herramienta (D3, etc.):

```ts
import { estadosTopoJSON } from "@webrek/mx-geo";
// estadosTopoJSON.objects.estados.geometries[i].properties = { cve, nombre, abr }
```

## Datos, fuentes y precisión

- **Geometría:** [Natural Earth](https://www.naturalearthdata.com/) (admin-1, 1:10m),
  de **dominio público**, simplificada para web.
- **Claves y nombres:** `CVE_ENT` y nomenclatura oficial de **INEGI**.
- **Alcance:** solo **estados** (división política de 1er nivel). Los **municipios**
  llegan en una versión futura (`level="municipios"` + drill-down), a partir del
  Marco Geoestadístico de INEGI.
- **Vigencia:** la geometría es de referencia/visualización, no catastral. CDMX usa el
  ISO vigente `MX-CMX` (Natural Earth todavía la etiqueta como `DIF` internamente; aquí
  ya queda normalizada).

## Desarrollo

```bash
pnpm install
pnpm build:data   # regenera catálogo + TopoJSON desde Natural Earth
pnpm check        # format + typecheck + test + build
```

## Licencia

MIT © webrek. Incluye datos de Natural Earth (dominio público).
