import { createRoot } from "react-dom/client";
import { useMemo, useState } from "react";
import { MapaMexico } from "../src/react";
import type { Estado } from "../src/index";

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

function App() {
  const [mode, setMode] = useState<"base" | "tiendas" | "rand">("tiendas");
  const [seed, setSeed] = useState(0);
  const [sel, setSel] = useState<Estado | null>(null);

  const data = useMemo<Record<string, number> | undefined>(() => {
    if (mode === "base") return undefined;
    if (mode === "tiendas") return TIENDAS;
    const r: Record<string, number> = {};
    for (const cve of Object.keys(TIENDAS))
      r[cve] = Math.floor(20 + Math.random() * Math.random() * 480);
    return r;
  }, [mode, seed]);

  const btn = (m: typeof mode, label: string) => (
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
        <p>Mapa de México por estados · claves INEGI · choropleth sin API key</p>
      </header>
      <div className="bar">
        {btn("base", "Mapa base")}
        {btn("tiendas", "Tiendas (demo)")}
        {btn("rand", "Aleatorio ⟳")}
      </div>
      <div className="stage">
        <div className="map">
          <MapaMexico
            data={data}
            onSelect={setSel}
            colorRange={["#dbeafe", "#1e3a8a"]}
            formatValue={(v) => fmt(v)}
          />
        </div>
        <aside className="panel">
          {sel ? (
            <>
              <span className="cve">CVE_ENT {sel.cve}</span>
              <h3>{sel.nombre}</h3>
              <dl>
                <dt>Capital</dt>
                <dd>{sel.capital}</dd>
                <dt>ISO</dt>
                <dd>{sel.iso}</dd>
                {data && (
                  <>
                    <dt>Tiendas (demo)</dt>
                    <dd className="big">{fmt(data[sel.cve] ?? 0)}</dd>
                  </>
                )}
              </dl>
            </>
          ) : (
            <p className="hint">Pasa el mouse o haz clic en un estado.</p>
          )}
        </aside>
      </div>
      <footer>
        Geometría: Natural Earth (dominio público). Demo construida con el componente real
        <code>&lt;MapaMexico&gt;</code>.
      </footer>
    </div>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
