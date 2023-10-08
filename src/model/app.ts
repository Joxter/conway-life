import { sample } from "effector";
import { importExport } from "../feature/ImportExport/importExport.model";
import { $faunaData, FaunaData, focusToTheMiddle, progress, resetFieldPressed } from "./field";
import { $history, addToHistory, historySelected, saveClicked } from "./history";
import { faunaToRle } from "../importExport/utils";
import { catalogue } from "../feature/Catalogue/Catalogue.model";
import { allTemplates } from "../blueprints/all-templates";
import { newFaunaDataFromRle } from "../utils";
import { Fauna } from "../types";

sample({
  source: $faunaData,
  clock: saveClicked,
  fn: (it) => it.fauna,
  target: addToHistory,
});

sample({
  source: $history,
  clock: historySelected,
  fn: (history, selected) => {
    const savedRle = history.find((it) => it.name === selected)!.rle;
    return newFaunaDataFromRle(savedRle);
  },
  target: $faunaData,
});

sample({
  clock: [
    historySelected,
    resetFieldPressed,
    importExport.exportClicked,
    importExport.importClicked,
  ],
  target: progress.reset,
});

sample({
  source: $faunaData,
  clock: importExport.exportClicked,
  fn: ({ fauna }) => faunaToRle(fauna),
  target: importExport.$textField,
});

sample({
  source: importExport.$textField,
  clock: importExport.importClicked,
  fn: (str) => {
    return newFaunaDataFromRle(str);
  },
  target: $faunaData,
});

setTimeout(() => {
  let patternFileName = window.location.hash.slice(1);
  if (allTemplates[patternFileName]) {
    catalogue.loadInitPattern(patternFileName);
  }
  if (!patternFileName) {
    let keys = Object.keys(allTemplates);
    let randomPatternName = keys[Math.floor(Math.random() * keys.length)];
    catalogue.loadInitPattern(allTemplates[randomPatternName].fileName);
  }
}, 10);

sample({
  clock: catalogue.patternFetched,
  fn: ({ faunaData }) => faunaData,
  target: $faunaData,
});

sample({
  clock: [historySelected, importExport.importClicked, catalogue.patternFetched],
  target: focusToTheMiddle,
});

sample({
  clock: catalogue.selectPattern,
  target: progress.stop,
});

progress.reset.watch(() => {
  window.location.hash = "";
});

export function initWW() {
  const worker = new Worker("./webworkerGo.js");

  worker.addEventListener("message", (ev) => {
    try {
      let data = validateWWRes(ev.data.res);
      if (data) {
        progress.calculated({ data, gen: ev.data.gen as any as number });
      }
    } catch (err) {
      console.error(err);
    } finally {
      progress.unlockWW();
    }
  });
  worker.addEventListener("error", (err) => {
    console.error(err);
  });

  sample({
    source: $faunaData,
    clock: [historySelected, importExport.importClicked, catalogue.patternFetched],
  }).watch(({ fauna }) => {
    worker.postMessage({ fauna });
  });

  progress.getGeneration.watch((n) => {
    progress.lockWW();
    worker.postMessage({ gen: n });
  });
}

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

  return { fauna, time, population, size };
}
