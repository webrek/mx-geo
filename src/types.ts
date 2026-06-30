/** Un estado de México con su clave oficial de INEGI. */
export interface Estado {
  /** CVE_ENT de INEGI, dos dígitos con cero a la izquierda (p. ej. "09"). */
  cve: string;
  /** Nombre oficial largo (p. ej. "Veracruz de Ignacio de la Llave"). */
  nombre: string;
  /** Nombre de uso común (p. ej. "Veracruz", "Estado de México"). */
  nombreCorto: string;
  /** Abreviatura usual (p. ej. "Ver.", "CDMX", "NL"). */
  abreviatura: string;
  /** ISO 3166-2 vigente (p. ej. "MX-VER", "MX-CMX"). */
  iso: string;
  /** Capital del estado. */
  capital: string;
  /** Clave de la región (Banxico) a la que pertenece; ver `REGIONES`. */
  region: string;
  /** Población total (Censo de Población y Vivienda 2020, INEGI). */
  poblacion: number;
  /** Superficie en km² (INEGI, territorio continental e insular). */
  superficie: number;
  /** Zona horaria IANA principal del estado (p. ej. "America/Mexico_City"). */
  huso: string;
  /** Otras formas de escribirlo que acepta la búsqueda. */
  alias: string[];
}
