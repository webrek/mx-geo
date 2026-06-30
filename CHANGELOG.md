# Changelog

Todas las versiones notables de este paquete se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y el versionado es [SemVer](https://semver.org/lang/es/).

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
