import { createRoot } from "react-dom/client";
import { useMemo, useState } from "react";
import { MapaMexico, Leyenda } from "../src/react";
import {
  REGIONES,
  REGION_POR_ESTADO,
  coloresCategorias,
  type Estado,
  type NombrePaleta,
} from "../src/index";
import { MapaMunicipios, municipios, type Municipio } from "../src/municipios";

const TIENDAS: Record<string, number> = {
  "01": 38,
  "02": 95,
  "03": 18,
  "04": 22,
  "05": 75,
  "06": 20,
  "07": 80,
  "08": 88,
  "09": 320,
  "10": 36,
  "11": 110,
  "12": 55,
  "13": 65,
  "14": 210,
  "15": 280,
  "16": 90,
  "17": 45,
  "18": 30,
  "19": 180,
  "20": 60,
  "21": 130,
  "22": 70,
  "23": 48,
  "24": 60,
  "25": 70,
  "26": 72,
  "27": 40,
  "28": 78,
  "29": 18,
  "30": 140,
  "31": 55,
  "32": 35,
};

const fmt = (n: number) => n.toLocaleString("es-MX");
const rand = () => Math.floor(20 + Math.random() * Math.random() * 480);

// Paletas que ofrece el selector de la demo.
const PALETAS_DEMO: { valor: NombrePaleta; etiqueta: string }[] = [
  { valor: "azul", etiqueta: "Azul" },
  { valor: "walmart", etiqueta: "Walmart" },
  { valor: "verde", etiqueta: "Verde" },
  { valor: "naranja", etiqueta: "Naranja" },
  { valor: "morado", etiqueta: "Morado" },
  { valor: "teal", etiqueta: "Teal" },
];

// Colores de las regiones, idénticos a los que pinta <MapaMexico> (mismo helper
// determinista), para que la leyenda concuerde con el mapa.
const COLOR_REGION = coloresCategorias(REGION_POR_ESTADO);
const LEYENDA_REGIONES = REGIONES.map(
  (r) => [r.nombre, COLOR_REGION.get(r.reg) ?? "#ccc"] as [string, string],
);

type Modo = "base" | "tiendas" | "rand" | "regiones";

function App() {
  const [mode, setMode] = useState<Modo>("tiendas");
  const [paleta, setPaleta] = useState<NombrePaleta>("azul");
  const [seed, setSeed] = useState(0);
  const [estadoSel, setEstadoSel] = useState<Estado | null>(null);
  const [muniSel, setMuniSel] = useState<Municipio | null>(null);
  const [drill, setDrill] = useState<Estado | null>(null);

  const data = useMemo<Record<string, number> | undefined>(() => {
    if (mode === "base" || mode === "regiones") return undefined;
    if (mode === "tiendas") return TIENDAS;
    const r: Record<string, number> = {};
    for (const cve of Object.keys(TIENDAS)) r[cve] = rand();
    return r;
  }, [mode, seed]);

  const dominio = useMemo<[number, number]>(() => {
    const vals = data ? Object.values(data) : [];
    return vals.length ? [Math.min(...vals), Math.max(...vals)] : [0, 0];
  }, [data]);

  // datos demo por municipio del estado en drill-down
  const muniData = useMemo<Record<string, number>>(() => {
    const r: Record<string, number> = {};
    if (drill) for (const m of municipios(drill.cve)) r[m.cvegeo] = rand();
    return r;
  }, [drill, seed]);

  const btn = (m: Modo, label: string) => (
    <button
      className={mode === m ? "on" : ""}
      onClick={() => {
        setMode(m);
        if (m === "rand") setSeed((s) => s + 1);
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="wrap">
      <header>
        <h1>@webrek/mx-geo</h1>
        <p>Mapa de México · estados y municipios · claves INEGI · choropleth sin API key</p>
      </header>

      {!drill ? (
        <>
          <div className="bar">
            {btn("base", "Mapa base")}
            {btn("tiendas", "Tiendas (demo)")}
            {btn("rand", "Aleatorio ⟳")}
            {btn("regiones", "Regiones")}
            {mode === "tiendas" || mode === "rand" ? (
              <label className="sel">
                Paleta:
                <select value={paleta} onChange={(e) => setPaleta(e.target.value as NombrePaleta)}>
                  {PALETAS_DEMO.map((p) => (
                    <option key={p.valor} value={p.valor}>
                      {p.etiqueta}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <span className="tipText">Haz clic en un estado para ver sus municipios →</span>
          </div>
          <div className="stage">
            <div className="map">
              <MapaMexico
                data={data}
                categorias={mode === "regiones" ? REGION_POR_ESTADO : undefined}
                paleta={paleta}
                zoom
                onSelect={(e) => {
                  setEstadoSel(e);
                  setDrill(e);
                  setMuniSel(null);
                  setSeed((s) => s + 1);
                }}
                formatValue={(v) => fmt(v)}
              />
              {mode === "regiones" ? (
                <Leyenda
                  tipo="categorias"
                  titulo="Región (Banxico)"
                  categorias={LEYENDA_REGIONES}
                  className="leyenda"
                />
              ) : data ? (
                <Leyenda
                  dominio={dominio}
                  paleta={paleta}
                  titulo={mode === "tiendas" ? "Tiendas" : "Valor"}
                  formato={(v) => fmt(v)}
                  className="leyenda"
                />
              ) : null}
            </div>
            <aside className="panel">
              {estadoSel ? (
                <>
                  <span className="cve">CVE_ENT {estadoSel.cve}</span>
                  <h3>{estadoSel.nombre}</h3>
                  <dl>
                    <dt>Capital</dt>
                    <dd>{estadoSel.capital}</dd>
                    <dt>Región</dt>
                    <dd>{estadoSel.region}</dd>
                    <dt>Población (2020)</dt>
                    <dd>{fmt(estadoSel.poblacion)}</dd>
                    <dt>Superficie</dt>
                    <dd>{fmt(estadoSel.superficie)} km²</dd>
                    <dt>Huso</dt>
                    <dd>{estadoSel.huso}</dd>
                    {data && (
                      <>
                        <dt>Tiendas (demo)</dt>
                        <dd className="big">{fmt(data[estadoSel.cve] ?? 0)}</dd>
                      </>
                    )}
                  </dl>
                </>
              ) : (
                <p className="hint">Pasa el mouse o haz clic en un estado.</p>
              )}
            </aside>
          </div>
        </>
      ) : (
        <>
          <div className="bar">
            <button
              onClick={() => {
                setDrill(null);
                setMuniSel(null);
              }}
            >
              ← Volver a estados
            </button>
            <button onClick={() => setSeed((s) => s + 1)}>Aleatorio ⟳</button>
            <span className="tipText">
              Municipios de <b>{drill.nombre}</b> ({municipios(drill.cve).length})
            </span>
          </div>
          <div className="stage">
            <div className="map">
              <MapaMunicipios
                estado={drill.cve}
                data={muniData}
                onSelect={setMuniSel}
                paleta="verde"
                zoom
                formatValue={(v) => fmt(v)}
              />
            </div>
            <aside className="panel">
              {muniSel ? (
                <>
                  <span className="cve muni">CVEGEO {muniSel.cvegeo}</span>
                  <h3>{muniSel.nombre}</h3>
                  <dl>
                    <dt>Estado</dt>
                    <dd>{drill.nombre}</dd>
                    <dt>CVE_MUN</dt>
                    <dd>{muniSel.cve_mun}</dd>
                    <dt>Valor (demo)</dt>
                    <dd className="big green">{fmt(muniData[muniSel.cvegeo] ?? 0)}</dd>
                  </dl>
                </>
              ) : (
                <p className="hint">Pasa el mouse o haz clic en un municipio.</p>
              )}
            </aside>
          </div>
        </>
      )}

      <footer>
        Rueda para acercar, arrastra para mover, doble clic reinicia. · Geometría: INEGI, Marco
        Geoestadístico (estados disueltos de municipios). Demo con los componentes reales{" "}
        <code>&lt;MapaMexico&gt;</code>, <code>&lt;MapaMunicipios&gt;</code> y{" "}
        <code>&lt;Leyenda&gt;</code>.
      </footer>
    </div>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
