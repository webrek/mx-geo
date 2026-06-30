/**
 * Tienes cifras por municipio (llaveadas por CVEGEO de 5 dígitos) pero quieres
 * el mapa nacional. `agregaMunicipiosAEstado` las sube a CVE_ENT sumando por
 * defecto; puedes pasar otro combinador (máximo, promedio ponderado, etc.).
 */
import { agregaMunicipiosAEstado, estado } from "@webrek/mx-geo";

const porMunicipio: Record<string, number> = {
  "20067": 1200, // Oaxaca de Juárez
  "20001": 300, // Abejones (Oaxaca)
  "09010": 800, // Álvaro Obregón (CDMX)
  "09014": 450, // Benito Juárez (CDMX)
};

// Suma (default) → listo para <MapaMexico data={porEstado} />.
const porEstado = agregaMunicipiosAEstado(porMunicipio);
console.log(porEstado); // { "20": 1500, "09": 1250 }
console.log("20 =", estado("20")?.nombre); // "Oaxaca"

// Combinador a la medida: quédate con el municipio de mayor valor por estado.
const maxPorEstado = agregaMunicipiosAEstado(porMunicipio, (a, b) => Math.max(a, b));
console.log(maxPorEstado); // { "20": 1200, "09": 800 }
