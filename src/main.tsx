/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { render, ErrorBoundary } from "solid-js/web";
import "./model/app";
import "./style.css";
import { Field } from "./components/Field/Field";
import { Navigation } from "./components/Navigation";
import { Progress } from "./feature/Progress/Progress";
import { Perf } from "./components/Perf";
import { History } from "./components/History";
import { CatalogueModal, CatalogueButton, CurrentPattern } from "./feature/Catalogue/Catalogue";
import { WhiteBox } from "./components/WhiteBox/WhiteBox";
import { ImportExportButton, ImportExportModal } from "./feature/ImportExport/ImportExport";
import { createSignal } from "solid-js";
import { initWW } from "./model/app";

/*
function Counter() {
  const [text, setCount] = createSignal("");

  const lower = () => text().toLowerCase();

  return (
    <div style={{ "font-size": "24px", width: "400px" }}>
      <textarea
        value={text()}
        style={{ width: "100%", height: "100px" }}
        onInput={(ev) => setCount(ev.target.value)}
      />
      <br />
      <textarea style={{ width: "100%", height: "100px" }} value={lower()} />
    </div>
  );
}
*/

function App() {
  return (
    <ErrorBoundary
      fallback={<h2 style={{ color: "red", "text-align": "center" }}>JSX ERROR :(</h2>}
    >
      <div>
        <Field />
        <History />
        <WhiteBox
          style={{
            top: "0",
            left: "0",
            right: "0",
            "border-radius": "0",
            border: "0",
            padding: "5px",
            "border-bottom": "1px solid #aaa",
          }}
        >
          <Perf />
        </WhiteBox>

        <CurrentPattern
          style={{ position: "absolute", bottom: "150px", right: "10px", "font-size": "14px" }}
        />
        {/*
        <WhiteBox style={{ left: "200px", top: "100px" }}>
          <Counter />
        </WhiteBox>
*/}

        <WhiteBox style={{ bottom: "110px", right: "10px" }}>
          <CatalogueButton />
        </WhiteBox>

        <WhiteBox style={{ top: "100px", left: "10px" }}>
          <ImportExportButton />
        </WhiteBox>

        <div style={{ position: "absolute", bottom: "30px", left: "10px", right: "10px" }}>
          <Progress />
        </div>

        <WhiteBox style={{ bottom: "110px", left: "10px" }}>
          <Navigation />
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

        <ImportExportModal />
        <CatalogueModal />
      </div>
    </ErrorBoundary>
  );
}

initWW();

render(() => <App />, document.querySelector<HTMLDivElement>("#app")!);
