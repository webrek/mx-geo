# Changelog

Todas las versiones notables de este paquete se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y el versionado es [SemVer](https://semver.org/lang/es/).

## [0.2.0]

### Agregado

- Subpath `@webrek/mx-geo/municipios`: TopoJSON de los **2,436 municipios**
  (derivado de INEGI vía diegovalle/mxmaps) llaveado por `CVEGEO`, helpers
  `municipios(cveEnt?)` y `municipio(cvegeo)`, y componente `<MapaMunicipios>`
  para choropleth a nivel municipal por estado (drill-down).
- El dato municipal (~556 KB) vive en su propio entry, así que quien solo use
  estados no carga ese peso.

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
