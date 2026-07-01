/**
 * Distribución de los 32 estados en una **rejilla** (cartograma de mosaicos):
 * cada estado ocupa una celda `[columna, fila]` que aproxima su posición
 * geográfica. Todos los estados quedan del mismo tamaño, así los chicos del
 * centro (CDMX, Morelos, Tlaxcala) se ven igual que los grandes.
 */
export type Celda = [columna: number, fila: number];

/** Celda `[col, fila]` de cada estado por CVE_ENT (col 0..7 O→E, fila 0..5 N→S). */
export const MOSAICO_ESTADOS: Readonly<Record<string, Celda>> = {
  // Norte
  "02": [0, 0], // Baja California
  "26": [1, 0], // Sonora
  "08": [2, 0], // Chihuahua
  "05": [3, 0], // Coahuila
  "19": [4, 0], // Nuevo León
  "28": [5, 0], // Tamaulipas
  // Norte-centro
  "03": [0, 1], // Baja California Sur
  "25": [1, 1], // Sinaloa
  "10": [2, 1], // Durango
  "32": [3, 1], // Zacatecas
  "24": [4, 1], // San Luis Potosí
  // Centro-norte
  "18": [1, 2], // Nayarit
  "01": [2, 2], // Aguascalientes
  "11": [3, 2], // Guanajuato
  "22": [4, 2], // Querétaro
  "13": [5, 2], // Hidalgo
  "31": [7, 2], // Yucatán
  // Centro
  "06": [1, 3], // Colima
  "14": [2, 3], // Jalisco
  "16": [3, 3], // Michoacán
  "15": [4, 3], // Estado de México
  "09": [5, 3], // Ciudad de México
  "29": [6, 3], // Tlaxcala
  "23": [7, 3], // Quintana Roo
  // Sur-centro
  "12": [3, 4], // Guerrero
  "17": [4, 4], // Morelos
  "21": [5, 4], // Puebla
  "30": [6, 4], // Veracruz
  "04": [7, 4], // Campeche
  // Sur
  "20": [4, 5], // Oaxaca
  "07": [5, 5], // Chiapas
  "27": [6, 5], // Tabasco
};

/** Número de columnas de la rejilla. */
export const MOSAICO_COLUMNAS = 8;
/** Número de filas de la rejilla. */
export const MOSAICO_FILAS = 6;
