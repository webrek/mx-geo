# Changelog

Todas las versiones notables de este paquete se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y el versionado es [SemVer](https://semver.org/lang/es/).

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
