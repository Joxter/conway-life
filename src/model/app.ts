import { sample } from "effector";
import { importExport } from "../feature/ImportExport/importExport.model";
import { $faunaData, focusToTheMiddle, progress, resetFieldPressed, screen } from "./field";
import { catalogue } from "../feature/Catalogue/Catalogue.model";
import { allTemplates } from "../all-templates";
import { faunaToRle, rleToFauna } from "../importExport/utils";
import { MyFauna } from "../lifes/myFauna";

sample({
  clock: [resetFieldPressed, importExport.exportClicked, importExport.importClicked],
  target: progress.reset,
});

sample({
  source: $faunaData,
  clock: importExport.exportClicked,
  fn: (faunaRef) => faunaToRle(faunaRef.ref),
  target: importExport.$textField,
});

sample({
  source: importExport.$textField,
  clock: importExport.importClicked,
  fn: (str) => {
    return { ref: rleToFauna(str).unwrapOr(new MyFauna()) };
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
  fn: ({ faunaData }) => {
    return { ref: faunaData };
  },
  target: $faunaData,
});

sample({
  clock: [importExport.importClicked, catalogue.patternFetched],
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
      if (ev.data.calculated) {
        let fauna = new MyFauna();
        fauna.deserialise(ev.data.calculated);
        progress.calculated(fauna);
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
    clock: [
      importExport.importClicked,
      catalogue.patternFetched,
      progress.reset,
      screen.onPointerClick,
    ],
  }).watch((fauna) => {
    worker.postMessage({ fauna: fauna.ref.serialise() });
  });

  progress.getGeneration.watch((n) => {
    progress.lockWW();
    worker.postMessage({ gen: n });
  });
}
/* TODO
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
*/
