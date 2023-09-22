/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { render } from "solid-js/web";
import { calculated, resetFieldPressed, startCalc } from "./model/field";
import "./model/app";
import "./style.css";
import { Field } from "./components/Field/Field";
import { Navigation } from "./components/Navigation";
import { Progress } from "./components/Progress";
import { Perf } from "./components/Perf";
import { $exported, exportClicked, exportFieldChanged, importClicked } from "./model/export";
import { useUnit } from "effector-solid";
import { History } from "./components/History";
import { Catalogue } from "./feature/Catalogue/Catalogue";

function App() {
  let [exported] = useUnit([$exported]);
  return (
    <div>
      <Field />
      <div
        style={{
          position: "absolute",
          width: "100%",
          "background-color": "rgba(255,255,255, 0.9)",
          "border-bottom": "1px solid #ccc",
        }}
      >
        <h1 style={{ "font-size": "18px" }}>Game of Life</h1>
      </div>
      <History />
      <Perf />
      <Catalogue />
      <Progress />
      <Navigation />

      <button
        onClick={resetFieldPressed}
        style={{ position: "absolute", top: "200px", left: "10px" }}
      >
        Reset
      </button>

      <div style={{ position: "absolute", top: "100px", left: "10px" }}>
        <button onClick={exportClicked}>Export</button>
        <button onClick={importClicked}>Import</button>
        <br />
        <textarea
          onChange={(ev) => exportFieldChanged(ev.target.value)}
          style={{ "font-size": "8px", width: "100%", height: "50px", "line-height": 1 }}
          value={exported()}
        ></textarea>
      </div>
    </div>
  );
}

initWW();

function initWW() {
  const worker = new Worker("./webworkerGo.js");

  worker.addEventListener("message", (ev) => {
    // console.log(ev.data);
    calculated(ev.data);
  });
  worker.addEventListener("error", (err) => {
    console.log("main.error err", err);
  });

  startCalc.watch((fauna) => {
    worker.postMessage(fauna);
  });
}

render(() => <App />, document.querySelector<HTMLDivElement>("#app")!);
