# Ejemplos de @webrek/mx-geo

Recetas cortas y copiables. Cada archivo usa los _import paths_ públicos del
paquete (`@webrek/mx-geo`, `@webrek/mx-geo/react`, `@webrek/mx-geo/municipios`),
así que puedes pegarlos tal cual en tu proyecto.

| Archivo                                                    | Qué muestra                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| [`01-choropleth-basico.tsx`](./01-choropleth-basico.tsx)   | Mapa por estado con una paleta con nombre + `<Leyenda>`.           |
| [`02-regiones.tsx`](./02-regiones.tsx)                     | Pintar el país por región (Banxico) en modo categórico.            |
| [`03-zonas-de-venta.tsx`](./03-zonas-de-venta.tsx)         | Tus propias zonas (categorías a la medida) + leyenda.              |
| [`04-drill-down.tsx`](./04-drill-down.tsx)                 | Estados → municipios (drill-down con carga bajo demanda).          |
| [`05-normaliza-join.ts`](./05-normaliza-join.ts)           | Normalizar una columna de texto a `CVE_ENT` y cruzar datos.        |
| [`06-municipios-a-estado.ts`](./06-municipios-a-estado.ts) | Subir cifras municipales (CVEGEO) al mapa nacional.                |
| [`07-sin-react-escalas.ts`](./07-sin-react-escalas.ts)     | Paletas y escalas sin React (para D3 o tu propio SVG).             |
| [`08-cuantiles.tsx`](./08-cuantiles.tsx)                   | Escala por cuantiles para datos sesgados + leyenda escalonada.     |
| [`09-nextjs/`](./09-nextjs/)                               | Patrón Next.js App Router: Server Component pasa datos al cliente. |
| [`10-tasas-y-etiquetas.tsx`](./10-tasas-y-etiquetas.tsx)   | Tasa por cápita (normaliza) + etiquetas sobre cada estado.         |
| [`11-burbujas.tsx`](./11-burbujas.tsx)                     | Mapa de burbujas (símbolos proporcionales al valor).               |
| [`12-tooltip.tsx`](./12-tooltip.tsx)                       | Tooltip a la medida (tarjeta flotante con HTML propio).            |
| [`13-zoom.tsx`](./13-zoom.tsx)                             | Zoom con la rueda + pan arrastrando (doble clic reinicia).         |
| [`14-servidor-svg.ts`](./14-servidor-svg.ts)               | Render en el servidor: `mapaSVG` → cadena SVG para PDF/correo.     |
| [`15-mosaico.tsx`](./15-mosaico.tsx)                       | Cartograma de mosaicos (rejilla de estados, tamaño parejo).        |
| [`16-exportar.tsx`](./16-exportar.tsx)                     | Descargar el mapa como PNG o SVG (`descargaPNG`/`descargaSVG`).    |
| [`17-vecinos.tsx`](./17-vecinos.tsx)                       | Resaltar un estado y sus colindantes (adyacencia).                 |

> La demo interactiva (`demo.tsx`) se compila a `docs/` y se publica en
> <https://webrek.github.io/mx-geo/>.
