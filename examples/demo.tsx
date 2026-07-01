import { createRoot } from "react-dom/client";
import { useMemo, useState } from "react";
import { MapaMexico, MapaBurbujas, Leyenda } from "../src/react";
import {
  REGIONES,
  REGION_POR_ESTADO,
  coloresCategorias,
  porCapita,
  estado as estadoDe,
  type Estado,
  type NombrePaleta,
} from "../src/index";
import {
  MapaMunicipios,
  municipios,
  municipio as municipioDe,
  type Municipio,
} from "../src/municipios";
import { buscaCP, type ResultadoCP } from "../../mx-cp/src/index";

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

const PALETAS_DEMO: { valor: NombrePaleta; etiqueta: string }[] = [
  { valor: "azul", etiqueta: "Azul" },
  { valor: "walmart", etiqueta: "Walmart" },
  { valor: "verde", etiqueta: "Verde" },
  { valor: "naranja", etiqueta: "Naranja" },
  { valor: "morado", etiqueta: "Morado" },
  { valor: "teal", etiqueta: "Teal" },
];

const COLOR_REGION = coloresCategorias(REGION_POR_ESTADO);
const LEYENDA_REGIONES = REGIONES.map(
  (r) => [r.nombre, COLOR_REGION.get(r.reg) ?? "#ccc"] as [string, string],
);

type Modo = "base" | "tiendas" | "rand" | "regiones";
type Tipo = "choropleth" | "burbujas";

function App() {
  const [mode, setMode] = useState<Modo>("tiendas");
  const [tipo, setTipo] = useState<Tipo>("choropleth");
  const [paleta, setPaleta] = useState<NombrePaleta>("azul");
  const [etiquetas, setEtiquetas] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [porCap, setPorCap] = useState(false);
  const [seed, setSeed] = useState(0);
  const [estadoSel, setEstadoSel] = useState<Estado | null>(null);
  const [muniSel, setMuniSel] = useState<Municipio | null>(null);
  const [drill, setDrill] = useState<Estado | null>(null);

  // Buscador de código postal (@webrek/mx-cp)
  const [cp, setCp] = useState("");
  const [cpRes, setCpRes] = useState<ResultadoCP | null>(null);
  const [cpErr, setCpErr] = useState<string | null>(null);
  const [cpDestacado, setCpDestacado] = useState<string | null>(null);

  const base = useMemo<Record<string, number> | undefined>(() => {
    if (mode === "base" || mode === "regiones") return undefined;
    if (mode === "tiendas") return TIENDAS;
    const r: Record<string, number> = {};
    for (const cve of Object.keys(TIENDAS)) r[cve] = rand();
    return r;
  }, [mode, seed]);

  // Por cápita: tiendas por cada 100 mil habitantes (usa el catálogo enriquecido).
  const data = useMemo(() => (base && porCap ? porCapita(base, 100_000) : base), [base, porCap]);

  const unidad = porCap ? "por 100 mil hab." : mode === "tiendas" ? "Tiendas" : "Valor";
  const fmtVal = (v: number) => (porCap ? v.toFixed(1) : fmt(v));

  const dominio = useMemo<[number, number]>(() => {
    const vals = data ? Object.values(data) : [];
    return vals.length ? [Math.min(...vals), Math.max(...vals)] : [0, 0];
  }, [data]);

  const muniData = useMemo<Record<string, number>>(() => {
    if (cpDestacado) return { [cpDestacado]: 1 };
    const r: Record<string, number> = {};
    if (drill) for (const m of municipios(drill.cve)) r[m.cvegeo] = rand();
    return r;
  }, [drill, seed, cpDestacado]);

  async function buscar() {
    setCpErr(null);
    const r = await buscaCP(cp);
    if (!r) {
      setCpRes(null);
      setCpErr("Código postal no encontrado.");
      return;
    }
    const e = estadoDe(r.cveEnt);
    setCpRes(r);
    setCpDestacado(r.cvegeo);
    setEstadoSel(e);
    setDrill(e);
    setMuniSel(municipioDe(r.cvegeo));
  }

  function abrirEstado(e: Estado) {
    setEstadoSel(e);
    setDrill(e);
    setMuniSel(null);
    setCpRes(null);
    setCpDestacado(null);
    setSeed((s) => s + 1);
  }

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

  const tip = (e: Estado, v: number | null) => (
    <div>
      <strong>{e.nombre}</strong>
      <div style={{ color: "#6b7280" }}>{e.capital}</div>
      <div>{v === null ? "Sin dato" : `${fmtVal(v)} ${unidad}`}</div>
    </div>
  );

  const catRegiones = mode === "regiones" ? REGION_POR_ESTADO : undefined;

  return (
    <div className="wrap">
      <header>
        <h1>@webrek/mx-geo</h1>
        <p>Mapas de México · INEGI · choropleth, burbujas, regiones, tasas, zoom · sin API key</p>
      </header>

      {!drill ? (
        <>
          <div className="bar">
            {btn("base", "Mapa base")}
            {btn("tiendas", "Tiendas")}
            {btn("rand", "Aleatorio ⟳")}
            {btn("regiones", "Regiones")}
            {mode !== "regiones" ? (
              <label className="sel">
                Tipo:
                <select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)}>
                  <option value="choropleth">Choropleth</option>
                  <option value="burbujas">Burbujas</option>
                </select>
              </label>
            ) : null}
            {mode !== "regiones" && tipo === "choropleth" ? (
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
          </div>

          <div className="bar toggles">
            <label>
              <input
                type="checkbox"
                checked={etiquetas}
                onChange={(e) => setEtiquetas(e.target.checked)}
              />{" "}
              Etiquetas
            </label>
            <label>
              <input
                type="checkbox"
                checked={tooltip}
                onChange={(e) => setTooltip(e.target.checked)}
              />{" "}
              Tooltip a la medida
            </label>
            {mode !== "regiones" ? (
              <label>
                <input
                  type="checkbox"
                  checked={porCap}
                  onChange={(e) => setPorCap(e.target.checked)}
                />{" "}
                Por cápita
              </label>
            ) : null}
            <form
              className="cp"
              onSubmit={(e) => {
                e.preventDefault();
                buscar();
              }}
            >
              <input
                inputMode="numeric"
                placeholder="Código postal (ej. 06000)"
                value={cp}
                onChange={(e) => setCp(e.target.value)}
              />
              <button type="submit">Buscar CP</button>
            </form>
            <span className="tipText">Clic en un estado para ver municipios →</span>
          </div>

          {cpErr ? <p className="err">{cpErr}</p> : null}

          <div className="stage">
            <div className="map">
              {tipo === "burbujas" && mode !== "regiones" && data ? (
                <MapaBurbujas
                  data={data}
                  color="#2563eb"
                  onSelect={abrirEstado}
                  renderTooltip={tooltip ? tip : undefined}
                  formatValue={(v) => fmtVal(v)}
                />
              ) : (
                <MapaMexico
                  data={data}
                  categorias={catRegiones}
                  paleta={paleta}
                  zoom
                  etiquetas={etiquetas}
                  renderTooltip={tooltip ? tip : undefined}
                  onSelect={abrirEstado}
                  formatValue={(v) => fmtVal(v)}
                />
              )}
              {mode === "regiones" ? (
                <Leyenda
                  tipo="categorias"
                  titulo="Región (Banxico)"
                  categorias={LEYENDA_REGIONES}
                  className="leyenda"
                />
              ) : data && tipo === "choropleth" ? (
                <Leyenda
                  dominio={dominio}
                  paleta={paleta}
                  titulo={unidad}
                  formato={fmtVal}
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
                        <dt>{unidad}</dt>
                        <dd className="big">{fmtVal(data[estadoSel.cve] ?? 0)}</dd>
                      </>
                    )}
                  </dl>
                </>
              ) : (
                <p className="hint">
                  Pasa el mouse o haz clic en un estado. O busca un código postal.
                </p>
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
                setCpRes(null);
                setCpDestacado(null);
              }}
            >
              ← Volver a estados
            </button>
            {!cpDestacado ? (
              <button onClick={() => setSeed((s) => s + 1)}>Aleatorio ⟳</button>
            ) : null}
            <span className="tipText">
              {cpDestacado ? (
                <>
                  CP <b>{cpRes?.cp}</b> · {municipios(drill.cve).length} municipios en{" "}
                  {drill.nombre}
                </>
              ) : (
                <>
                  Municipios de <b>{drill.nombre}</b> ({municipios(drill.cve).length})
                </>
              )}
            </span>
          </div>
          <div className="stage">
            <div className="map">
              <MapaMunicipios
                estado={drill.cve}
                data={muniData}
                onSelect={setMuniSel}
                paleta={cpDestacado ? "rojo" : "verde"}
                zoom
                formatValue={(v) => fmt(v)}
              />
            </div>
            <aside className="panel">
              {cpRes ? (
                <>
                  <span className="cve muni">CP {cpRes.cp}</span>
                  <h3>{cpRes.municipio}</h3>
                  <dl>
                    <dt>Estado</dt>
                    <dd>{cpRes.estado}</dd>
                    <dt>CVEGEO</dt>
                    <dd>{cpRes.cvegeo}</dd>
                    <dt>Zona</dt>
                    <dd>{cpRes.zona}</dd>
                    <dt>Asentamientos ({cpRes.asentamientos.length})</dt>
                    <dd className="asent">
                      {cpRes.asentamientos.map((a) => (
                        <div key={a.nombre}>
                          {a.nombre} <em>· {a.tipo}</em>
                        </div>
                      ))}
                    </dd>
                  </dl>
                </>
              ) : muniSel ? (
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
        Geoestadístico. CP: SEPOMEX vía <code>@webrek/mx-cp</code>. Demo con{" "}
        <code>&lt;MapaMexico&gt;</code>, <code>&lt;MapaBurbujas&gt;</code>,{" "}
        <code>&lt;MapaMunicipios&gt;</code> y <code>&lt;Leyenda&gt;</code>.
      </footer>
    </div>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
