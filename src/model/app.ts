import { sample } from "effector";
import { importExport } from "../feature/ImportExport/importExport.model";
import { $faunaData, focusToTheMiddle, progress, resetFieldPressed } from "./field";
import { $history, addToHistory, historySelected, saveClicked } from "./history";
import { faunaToRle } from "../importExport/utils";
import { catalogue } from "../feature/Catalogue/Catalogue.model";
import { allTemplates } from "../blueprints/all-templates";
import { newFaunaDataFromRle } from "../utils";

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

progress.reset.watch(() => {
  window.location.hash = "";
});
