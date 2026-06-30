/**
 * Next.js App Router — Server Component (sin "use client").
 * Ruta sugerida: app/ventas/page.tsx
 *
 * El servidor obtiene los datos y se los pasa al Client Component que dibuja el
 * mapa. Así el SVG se hidrata en el cliente (necesita estado/interacción) pero
 * los datos se resuelven en el servidor.
 */
import { MapaCliente } from "./mapa-cliente";

async function obtenVentasPorEstado(): Promise<Record<string, number>> {
  // En tu app: consulta tu BD/API y devuelve { CVE_ENT: número }.
  // Si la columna viene como texto, usa normalizaEstado (ver 05-normaliza-join).
  return { "09": 1200, "14": 980, "15": 1500, "19": 760 };
}

export default async function Page() {
  const ventas = await obtenVentasPorEstado();
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
      <h1>Ventas por estado</h1>
      <MapaCliente data={ventas} />
    </main>
  );
}
