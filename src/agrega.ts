/**
 * Sube datos a nivel municipio (llaveados por CVEGEO de 5 dígitos) al nivel
 * estado (CVE_ENT), sumando por defecto. Útil para pintar `<MapaMexico>` a
 * partir de cifras municipales.
 *
 * @param datos  Mapa `CVEGEO -> número` (p. ej. `{ "20067": 1200 }`).
 * @param combina Cómo combinar valores del mismo estado; por defecto, suma.
 * @returns Mapa `CVE_ENT -> número` listo para la prop `data` de `<MapaMexico>`.
 */
export function agregaMunicipiosAEstado(
  datos: Record<string, number>,
  combina: (acumulado: number, valor: number) => number = (a, b) => a + b,
): Record<string, number> {
  const salida: Record<string, number> = {};
  for (const [cvegeo, valor] of Object.entries(datos)) {
    if (!Number.isFinite(valor)) continue;
    const cveEnt = cvegeo.slice(0, 2);
    salida[cveEnt] = cveEnt in salida ? combina(salida[cveEnt]!, valor) : valor;
  }
  return salida;
}
