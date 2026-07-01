# @webrek/mx-geo

[![npm](https://img.shields.io/npm/v/@webrek/mx-geo.svg?style=flat-square)](https://www.npmjs.com/package/@webrek/mx-geo)
[![Pruebas](https://img.shields.io/github/actions/workflow/status/webrek/mx-geo/ci.yml?branch=main&label=tests&style=flat-square)](https://github.com/webrek/mx-geo/actions)
[![Licencia](https://img.shields.io/npm/l/@webrek/mx-geo.svg?style=flat-square)](LICENSE)

Mapa de **México por estados** para dashboards, con la división política llaveada por
**claves de INEGI** (`CVE_ENT`). Trae tres cosas que normalmente tendrías que armar a mano:

1. Un **catálogo tipado** de los 32 estados (clave INEGI, nombre, ISO 3166-2, capital,
   **región, población del Censo 2020, superficie y huso horario**).
2. Un **TopoJSON** de las 32 geometrías en alta resolución (disueltas de los
   municipios de INEGI, ~75 KB gzip), ya llaveado por `CVE_ENT`.
3. Un componente **React choropleth** (`<MapaMexico>`) que se pinta solo con tus datos —
   SVG puro, **sin librería de mapas ni API key**— con **paletas con nombre**, **modo
   categórico** (por región o tus zonas) y un componente **`<Leyenda>`**.

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

| Prop               | Tipo                       | Por defecto                    | Descripción                                     |
| ------------------ | -------------------------- | ------------------------------ | ----------------------------------------------- |
| `data`             | `Record<string, number>`   | —                              | Valores por `CVE_ENT`. Sin esto, mapa base.     |
| `paleta`           | `nombre \| string[]`       | `"azul"`                       | Paleta del choropleth (ver abajo).              |
| `colorRange`       | `[string, string]`         | —                              | Atajo de dos colores; `paleta` tiene prioridad. |
| `categorias`       | `Record<string, string>`   | —                              | Modo categórico: `CVE_ENT -> categoría`.        |
| `paletaCategorica` | `string[]`                 | `PALETA_CATEGORICA`            | Colores del modo categórico.                    |
| `emptyColor`       | `string`                   | `"#e5e7eb"`                    | Color de un estado sin dato.                    |
| `stroke`           | `string`                   | `"#ffffff"`                    | Color del borde.                                |
| `onSelect`         | `(estado: Estado) => void` | —                              | Clic en un estado.                              |
| `formatValue`      | `(v, estado) => string`    | —                              | Formato del valor en el tooltip.                |
| `ariaLabel`        | `string`                   | `"Mapa de México por estados"` | Etiqueta accesible.                             |
| `className`        | `string`                   | —                              | Clase del `<svg>`.                              |

## Paletas y temas

En vez de pasar dos colores a mano, elige una **paleta con nombre**. Hay
secuenciales (`azul`, `verde`, `rojo`, `naranja`, `morado`, `teal`, `rosa`,
`ambar`, `gris`, `walmart`), divergentes (`rojoVerde`, `azulRojo`,
`moradoVerde`) o puedes pasar tu propia lista de colores.

```tsx
<MapaMexico data={ventas} paleta="walmart" />
<MapaMexico data={crecimiento} paleta="rojoVerde" /> // divergente, con centro
<MapaMexico data={ventas} paleta={["#f1f5f9", "#0ea5e9", "#0c4a6e"]} /> // a la medida
```

Las paletas y las escalas también viven sueltas (sin React), por si dibujas la
leyenda o el mapa con otra herramienta:

```ts
import { escalaSecuencial, escalaCuantil, PALETAS } from "@webrek/mx-geo";

const color = escalaSecuencial([0, 1000], "azul");
color(750); // "#3b82f6"

// Cuando los datos están sesgados, agrupa por cuantil:
const { color: c, tramos } = escalaCuantil(Object.values(ventas), "verde", 5);
```

## Regiones / zonas

El paquete trae la **regionalización de Banxico** (Norte, Centro Norte, Centro y
Sur) y helpers para agrupar. Combínala con el modo categórico para pintar el
país por región:

```tsx
import { MapaMexico } from "@webrek/mx-geo/react";
import { REGION_POR_ESTADO, REGIONES, estadosDeRegion } from "@webrek/mx-geo";

<MapaMexico categorias={REGION_POR_ESTADO} />; // cada región, un color

estadosDeRegion("norte").map((e) => e.nombreCorto); // ["Baja California", …]
```

Para que la **leyenda** use exactamente los mismos colores que el mapa, calcula
el mapa `categoría -> color` con `coloresCategorias` (es el que usa `<MapaMexico>`
por dentro; determinista, no depende del orden del objeto):

```tsx
import { coloresCategorias, REGIONES } from "@webrek/mx-geo";

const colores = coloresCategorias(REGION_POR_ESTADO);
const leyenda = REGIONES.map((r) => [r.nombre, colores.get(r.reg)!] as [string, string]);

<Leyenda tipo="categorias" titulo="Región" categorias={leyenda} />;
```

¿Tus propias zonas de venta? Pasa tu mapa `CVE_ENT -> zona` a `categorias`:

```tsx
<MapaMexico categorias={{ "19": "Bajío", "14": "Bajío", "09": "Metro" }} />
```

## Catálogo enriquecido

Cada estado trae datos listos para tableros: **región**, **población**
(Censo INEGI 2020), **superficie** (km²) y **huso horario** (IANA).

```ts
import { estado } from "@webrek/mx-geo";

const e = estado("15");
e?.poblacion; // 16992418  (Estado de México)
e?.region; // "centro"
e?.superficie; // 22357
e?.huso; // "America/Mexico_City"
```

## Leyenda

El componente `<Leyenda>` (en `@webrek/mx-geo/react`) acompaña al mapa en sus
tres modos:

```tsx
import { Leyenda } from "@webrek/mx-geo/react";
import { escalaCuantil } from "@webrek/mx-geo";

<Leyenda dominio={[0, 1000]} paleta="azul" titulo="Ventas" />; // degradado
<Leyenda tipo="cuantil" tramos={escalaCuantil(vals, "verde", 5).tramos} />; // escalones
<Leyenda tipo="categorias" categorias={{ Norte: "#2563eb", Sur: "#16a34a" }} />;
```

## De municipios a estados

¿Tienes cifras por municipio pero quieres el mapa nacional? Súbelas con
`agregaMunicipiosAEstado` (suma por defecto):

```ts
import { agregaMunicipiosAEstado } from "@webrek/mx-geo";

const porEstado = agregaMunicipiosAEstado({ "20067": 1200, "20001": 300 });
// → { "20": 1500 }   listo para <MapaMexico data={porEstado} />
```

## Tasas y densidad

Los valores absolutos engañan (los estados grandes siempre “ganan”). Con la
población (Censo 2020) y la superficie del catálogo puedes normalizar:

```ts
import { porCapita, porKm2, tasa, densidadPoblacion } from "@webrek/mx-geo";

porCapita(casos, 100_000); // casos por 100 mil habitantes
porKm2(ventas); // ventas por km²
tasa(datos, "poblacion"); // genérico; "poblacion" | "superficie" | tu propio mapa
densidadPoblacion()["09"]; // hab/km² de la CDMX (la más densa)
```

## Etiquetas

`<MapaMexico etiquetas />` pinta el texto sobre el centroide de cada estado:

```tsx
<MapaMexico etiquetas />                    {/* abreviatura: "Jal.", "CDMX"… */}
<MapaMexico etiquetas="nombre" />           {/* nombre corto */}
<MapaMexico etiquetas={(e) => e.cve} />     {/* lo que tú devuelvas */}
```

¿Necesitas la coordenada para colocar tus propios marcadores?
`centroideEstado("14")` → `[lon, lat]` (o `CENTROIDES_ESTADOS`).

## Tooltip a la medida

Por defecto el tooltip es el `<title>` nativo del SVG. Con `renderTooltip`
pintas una tarjeta flotante con tu propio HTML (formato, varias líneas, íconos):

```tsx
<MapaMexico
  data={ventas}
  renderTooltip={(estado, valor) => (
    <div>
      <strong>{estado.nombre}</strong>
      <div>{valor === null ? "Sin dato" : `$${valor.toLocaleString("es-MX")}`}</div>
    </div>
  )}
/>
```

Funciona igual en `<MapaBurbujas>`.

## Zoom y pan

`zoom` activa acercar con la rueda (centrado en el cursor), mover arrastrando y
reiniciar con doble clic. Ideal para los estados chicos del centro. Disponible
en `<MapaMexico>` y `<MapaMunicipios>`:

```tsx
<MapaMexico data={ventas} zoom />
<MapaMexico data={ventas} zoom={{ min: 1, max: 12 }} /> {/* límites de escala */}
<MapaMunicipios estado="09" zoom />
```

## Mapa de burbujas

Cuando quieres comparar **magnitudes absolutas**, `<MapaBurbujas>` dibuja un
círculo por estado con **área proporcional** al valor, sobre su centroide:

```tsx
import { MapaBurbujas } from "@webrek/mx-geo/react";

<MapaBurbujas
  data={{ "09": 9209944, "15": 16992418, "14": 8348151 }}
  radioMax={28}
  color="#2563eb"
  formatValue={(v) => v.toLocaleString("es-MX")}
/>;
```

## El TopoJSON directo

Si quieres dibujarlo con tu propia herramienta (D3, etc.):

```ts
import { estadosTopoJSON } from "@webrek/mx-geo";
// estadosTopoJSON.objects.estados.geometries[i].properties = { cve, nombre, abr }
```

## Municipios (drill-down)

El subpath `@webrek/mx-geo/municipios` (solo ESM) trae los **2,475 municipios** en
alta resolución (Marco Geoestadístico de INEGI), llaveados por `CVEGEO`. La
geometría se **carga por estado bajo demanda** (un chunk por estado): solo bajas
el estado que abres.

```tsx
"use client";
import { MapaMunicipios, municipios, municipio } from "@webrek/mx-geo/municipios";

municipios("09").length; // 16 alcaldías de la CDMX (índice ligero, sin geometría)
municipio("09012")?.nombre; // "Tlalpan"

// choropleth de los municipios de un estado (CVE_ENT); carga su geometría sola
<MapaMunicipios
  estado="20"
  data={{ "20067": 1200 }}
  onSelect={(m) => console.log(m.cvegeo, m.nombre)}
/>;
```

¿Necesitas el TopoJSON crudo de un estado? `await cargaMunicipios("20")`.

Para un **drill-down** completo: en el `onSelect` de `<MapaMexico>` guardas el
estado y renderizas `<MapaMunicipios estado={cve} />` (ver `examples/demo.tsx`).

## Ejemplos

En [`examples/`](./examples/) hay recetas cortas y copiables: choropleth con
paleta, mapa por región, zonas a la medida, drill-down, normalizar una columna
de texto, subir cifras municipales al mapa nacional, escalas sin React,
cuantiles y el patrón de Next.js App Router.

## Datos, fuentes y precisión

- **Geometría de estados:** disuelta del **Marco Geoestadístico de INEGI**
  (los mismos municipios, fundidos por `CVE_ENT`), así los bordes de estado
  coinciden exactamente con el drill-down y se ven con la misma resolución.
  Simplificada para web (~75 KB gzip).
- **Claves y nombres:** `CVE_ENT` y nomenclatura oficial de **INEGI**.
- **Municipios:** **Marco Geoestadístico de INEGI** (servicio ArcGIS), **2,475**
  municipios en alta resolución, simplificados para web y partidos por estado.
- **Vigencia:** la geometría es de referencia/visualización, no catastral. CDMX usa el
  ISO vigente `MX-CMX`.

## Desarrollo

```bash
pnpm install
pnpm build:data            # regenera el catálogo tipado (src/estados.generated.ts)
pnpm build:data:municipios # baja y arma los municipios (INEGI ArcGIS)
pnpm build:data:estados    # disuelve los municipios -> TopoJSON de estados
pnpm check                 # format + typecheck + test + build
```

## Licencia

MIT © webrek. Geometría derivada del Marco Geoestadístico de **INEGI**.
