# Changelog

Todas las versiones notables de este paquete se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y el versionado es [SemVer](https://semver.org/lang/es/).

## [0.6.0]

### Agregado

- **Render en servidor** (`@webrek/mx-geo/svg`): `mapaSVG(opts)` genera el
  choropleth de estados como una cadena SVG **sin React ni navegador**. Para
  incrustar en PDFs, correos o reportes. Soporta `data`/`categorias`, paletas,
  `etiquetas`, tamaño, fondo y título; el texto se escapa para XML.
- **Cartograma de mosaicos**: `<MapaMosaico>` (`@webrek/mx-geo/react`) dibuja los
  32 estados en una rejilla, cada uno del mismo tamaño (peso visual parejo; los
  chicos del centro se ven igual que los grandes). También `mosaicoSVG(opts)` en
  el subpath `/svg` para el servidor, y el layout `MOSAICO_ESTADOS`.

## [0.5.0]

### Agregado

- **Tasas y densidad** (usan el catálogo enriquecido): `porCapita(data, por)`,
  `porKm2(data)`, `tasa(data, entre, factor)` y `densidadPoblacion()`. Convierten
  valores absolutos en tasas por habitante/km² con la población (Censo 2020) y
  la superficie del catálogo.
- **Centroides por estado**: `CENTROIDES_ESTADOS` y `centroideEstado(cve)`
  (`[lon, lat]`, precalculados en build sobre la geometría de INEGI).
- **Etiquetas en `<MapaMexico>`**: prop `etiquetas` (`true`/`"abr"`, `"nombre"`
  o una función) que pinta el texto sobre el centroide de cada estado.
- **`<MapaBurbujas>`** (`@webrek/mx-geo/react`): mapa de símbolos proporcionales
  (área ∝ valor) sobre el centroide de cada estado; alternativa al choropleth
  para comparar magnitudes absolutas.
- **Tooltip a la medida**: prop `renderTooltip` en `<MapaMexico>` y
  `<MapaBurbujas>` para una tarjeta flotante que sigue al cursor (reemplaza el
  `<title>` nativo por HTML propio: formato, íconos, varias líneas).
- **Zoom & pan**: prop `zoom` en `<MapaMexico>` y `<MapaMunicipios>` (rueda para
  acercar centrado en el cursor, arrastrar para mover, doble clic reinicia).
  Implementación propia, sin dependencias nuevas; el borde no se engrosa al
  acercar (`non-scaling-stroke`).

## [0.4.0]

### Cambiado

- **Estados en alta resolución.** El TopoJSON de los 32 estados ahora se
  **disuelve de los municipios de INEGI** (en vez de Natural Earth simplificado
  al 6%, que se veía poligonal). Los bordes de estado coinciden exactamente con
  el drill-down de municipios y se ven con la misma nitidez. Pesa ~75 KB gzip
  (antes ~4 KB, mucho más burdo). Nuevo script `pnpm build:data:estados`.

### Agregado

- **Paletas de color con nombre.** Los mapas aceptan una prop `paleta` con un
  nombre integrado (`"azul"`, `"verde"`, `"rojo"`, `"naranja"`, `"morado"`,
  `"teal"`, `"rosa"`, `"ambar"`, `"gris"`, `"walmart"`), una paleta divergente
  (`"rojoVerde"`, `"azulRojo"`, `"moradoVerde"`) o tu propia lista de colores.
  Se exportan `PALETAS`, `PALETAS_DIVERGENTES` y `PALETA_CATEGORICA`, además de
  los helpers `resuelvePaleta`, `interpolaPaleta`, `escalaSecuencial`,
  `escalaCuantil` y `escalaCategorica`.
- **Modo categórico** en `<MapaMexico>`: con la prop `categorias`
  (`CVE_ENT -> categoría`) pinta el país por región o por tus propias zonas de
  venta, con colores discretos.
- **Regiones / zonas.** Nuevo catálogo `REGIONES` (regionalización de Banxico:
  Norte, Centro Norte, Centro y Sur) con `region()`, `estadosDeRegion()` y el
  mapa listo para usar `REGION_POR_ESTADO`.
- **Catálogo enriquecido.** Cada `Estado` trae ahora `region`, `poblacion`
  (Censo INEGI 2020), `superficie` (km²) y `huso` (zona horaria IANA).
- **Componente `<Leyenda>`** (`@webrek/mx-geo/react`): degradado continuo,
  escalones por cuantil o categorías discretas; HTML puro, sin dependencias.
- **Helper `agregaMunicipiosAEstado`**: sube datos a nivel municipio (CVEGEO) a
  nivel estado (CVE_ENT) para pintar `<MapaMexico>` con cifras municipales.

- **`coloresCategorias(categorias, paleta?)`**: mapa `categoría -> color`
  determinista (orden alfabético) — es el mismo que usa `<MapaMexico>` por
  dentro, así la `<Leyenda tipo="categorias">` siempre concuerda con el mapa.

### Robustez

- `interpolaPaleta` lanza un error claro con una paleta vacía (antes daba un
  crash con `undefined`).
- `lerpHex` acepta hex corto (`#rgb`) y **lanza** ante un color inválido
  (nombre CSS, longitud incorrecta) en vez de pintar un color con `NaN`.

### Compatibilidad

- `colorRange` sigue funcionando en ambos mapas; si pasas `paleta`, esta tiene
  prioridad. Sin cambios incompatibles respecto a 0.3.0.

## [0.3.0]

### Cambiado

- **Municipios en alta resolución** desde el Marco Geoestadístico de INEGI
  (servicio ArcGIS): **2,475 municipios** con contornos reales, en vez de la
  geometría simplificada anterior.
- **Carga por estado bajo demanda**: la geometría se parte en un chunk por
  estado (`data/municipios/<CVE_ENT>.json`) que se importa al vuelo. El subpath
  `@webrek/mx-geo/municipios` es **solo ESM** (el code-splitting lo requiere).

### Quitado

- Se elimina el export `municipiosTopoJSON` (un solo TopoJSON nacional). Ahora
  la geometría se obtiene con `await cargaMunicipios(cveEnt)`; `<MapaMunicipios>`
  la carga internamente. `municipios()` / `municipio()` siguen igual (índice
  ligero sin geometría).

## [0.2.0]

### Agregado

- Subpath `@webrek/mx-geo/municipios`: municipios llaveados por `CVEGEO`,
  helpers `municipios(cveEnt?)` / `municipio(cvegeo)` y componente
  `<MapaMunicipios>` para choropleth a nivel municipal por estado (drill-down).

## [0.1.0]

### Agregado

- Catálogo tipado de los 32 estados con `CVE_ENT` de INEGI, nombre oficial,
  nombre corto, abreviatura, ISO 3166-2 y capital.
- `normalizaEstado` / `buscaEstado`: resuelven clave, ISO, nombre, abreviatura
  y alias (CDMX/DF/Distrito Federal, Edomex, NL, etc.) ignorando acentos.
- TopoJSON de los 32 estados (~17 KB) llaveado por `CVE_ENT`, derivado de
  Natural Earth (dominio público).
- Componente React `<MapaMexico>`: choropleth SVG sin librería de mapas ni API
  key, con `onSelect`, escala de color y tooltips accesibles.
