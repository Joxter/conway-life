/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { render, ErrorBoundary } from "solid-js/web";
import { $faunaData, calculated, FaunaData, getGeneration, progress } from "./model/field";
import "./model/app";
import "./style.css";
import { Field } from "./components/Field/Field";
import { Navigation } from "./components/Navigation";
import { Progress } from "./components/Progress";
import { Perf } from "./components/Perf";
import { History } from "./components/History";
import { CatalogueModal, CatalogueButton, CurrentPattern } from "./feature/Catalogue/Catalogue";
import { WhiteBox } from "./components/WhiteBox/WhiteBox";
import { ImportExportButton, ImportExportModal } from "./feature/ImportExport/ImportExport";
import { Some } from "@sniptt/monads";
import { Fauna } from "./types";
import { sample } from "effector";

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
        <WhiteBox style={{ bottom: "110px", right: "10px" }}>
          <CatalogueButton />
        </WhiteBox>

        <WhiteBox style={{ top: "100px", left: "10px" }}>
          <ImportExportButton />
        </WhiteBox>

        <WhiteBox style={{ bottom: "30px", left: "10px", right: "10px" }}>
          <Progress />
        </WhiteBox>

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

function initWW() {
  const worker = new Worker("./webworkerGo.js");

  worker.addEventListener("message", (ev) => {
    try {
      let data = validateWWRes(ev.data.res);
      if (data) {
        calculated({ data, gen: ev.data.gen as any as number });
      }
    } catch (err) {
      console.error(err);
    }
  });
  worker.addEventListener("error", (err) => {
    console.error(err);
  });

  sample({
    source: $faunaData,
    clock: progress.start,
  }).watch(({ fauna }) => {
    worker.postMessage({ fauna });
  });
  getGeneration.watch((n) => {
    worker.postMessage({ gen: n });
  });
}

render(() => <App />, document.querySelector<HTMLDivElement>("#app")!);

function validateWWRes(data: any): FaunaData | undefined {
  let fauna: Fauna = data.fauna;
  if (!(fauna instanceof Map)) {
    console.log(fauna);
    console.error(`Fauna is not a Map. Check webworkerGo.js`);
    return;
  }

  let time = data.time;
  if (typeof time !== "number") {
    console.error(`Time is not a number. Check webworkerGo.js`);
    return;
  }

  let population = data.population;
  if (typeof population !== "number") {
    console.error(`Population is not a number. Check webworkerGo.js`);
    return;
  }

  let size = data.size; // should be { left: number; right: number; top: number; bottom: number }
  if (
    typeof size !== "object" ||
    typeof size.left !== "number" ||
    typeof size.right !== "number" ||
    typeof size.top !== "number" ||
    typeof size.bottom !== "number"
  ) {
    console.error(`Size is an object with params. Check webworkerGo.js`);
    return;
  }

  return { fauna, time, population, size: Some(size as any) };
}
