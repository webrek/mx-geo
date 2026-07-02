/**
 * Geocodificación inversa: tienes puntos `[lon, lat]` (GPS de repartos, tiendas,
 * tickets) y quieres saber en qué estado —y municipio— cae cada uno, para
 * agregarlos y pintarlos. Point-in-polygon sobre las geometrías de INEGI,
 * sin API keys ni red.
 */
import { estadoDeCoordenada, estado } from "@webrek/mx-geo";
import { municipioDeCoordenada, municipio } from "@webrek/mx-geo/municipios";

const entregas: Array<{ id: number; punto: [number, number] }> = [
  { id: 1, punto: [-99.1332, 19.4326] }, // Zócalo, CDMX
  { id: 2, punto: [-103.3496, 20.6597] }, // Guadalajara
  { id: 3, punto: [-100.3161, 25.6866] }, // Monterrey
  { id: 4, punto: [-118.4, 33.9] }, // Los Ángeles → fuera de México
];

// 1) Nivel estado: síncrono, todo vive en el core.
const porEstado: Record<string, number> = {};
for (const e of entregas) {
  const cve = estadoDeCoordenada(e.punto);
  if (!cve) continue; // fuera de México
  porEstado[cve] = (porEstado[cve] ?? 0) + 1;
}
console.log(porEstado); // { "09": 1, "14": 1, "19": 1 } → <MapaMexico data={porEstado} />

// 2) Nivel municipio: asíncrono (carga solo la geometría del estado que toca).
const cvegeo = await municipioDeCoordenada([-99.1332, 19.4326]);
console.log(cvegeo); // "09015"
console.log(municipio(cvegeo!)?.nombre); // "Cuauhtémoc"
console.log(estado(cvegeo!.slice(0, 2))?.nombre); // "Ciudad de México"
