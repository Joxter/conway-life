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
import { CatalogueModal, CatalogueButton } from "./feature/Catalogue/Catalogue";
import { WhiteBox } from "./components/WhiteBox/WhiteBox";

function App() {
  let [exported] = useUnit([$exported]);
  return (
    <div>
      <Field />
      <History />
      <Perf />
      <WhiteBox style={{ bottom: "100px", right: "10px" }}>
        <CatalogueButton />
      </WhiteBox>

      <WhiteBox style={{ bottom: "30px", left: "10px" }}>
        <Progress />
      </WhiteBox>
      <WhiteBox style={{ bottom: "160px", left: "10px" }}>
        <Navigation />
      </WhiteBox>

      <WhiteBox style={{ top: "100px", left: "10px" }}>
        <button onClick={exportClicked}>Export</button>
        <button onClick={importClicked}>Import</button>
        <br />
        <textarea
          onChange={(ev) => exportFieldChanged(ev.target.value)}
          style={{ "font-size": "8px", width: "100%", height: "50px", "line-height": 1 }}
          value={exported()}
        ></textarea>
      </WhiteBox>
      <div
        style={{
          position: "absolute",
          width: "100%",
          bottom: "0px",
          "background-color": "rgba(255,255,255, 0.9)",
          "border-top": "1px solid #ccc",
          display: "flex",
          gap: "8px",
          "justify-content": "center",
        }}
      >
        <h1 style={{ "font-size": "12px", margin: "0" }}>Game of Life</h1>{" "}
        <a style={{ "font-size": "12px" }} href="https://github.com/Joxter">
          joxter
        </a>
      </div>

      <CatalogueModal />
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
