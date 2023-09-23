import { createEffect, sample } from "effector";
import { $exported, exportClicked, importClicked } from "./export";
import { $faunaData, focusToTheMiddle, progress, resetFieldPressed } from "./field";
import { $history, addToHistory, historySelected, saveClicked } from "./history";
import { faunaToRle, rleToFauna } from "../importExport/utils";
import { catalogue } from "../feature/Catalogue/Catalogue.model";
import { Fauna } from "../types";
import { allTemplates } from "../blueprints/all-templates";

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
    return {
      fauna: rleToFauna(savedRle, "no-name").unwrapOr(new Map()),
      time: 0,
      size: 0,
    };
  },
  target: $faunaData,
});

sample({
  clock: [historySelected, resetFieldPressed, exportClicked, importClicked],
  target: progress.reset,
});

sample({
  source: $faunaData,
  clock: exportClicked,
  fn: ({ fauna }) => faunaToRle(fauna),
  target: $exported,
});

sample({
  source: $exported,
  clock: importClicked,
  fn: (str) => {
    return { fauna: rleToFauna(str, "no-name").unwrapOr(new Map()), time: 0, size: 0 };
  },
  target: $faunaData,
});

const fetchPatternFx = createEffect((fileName: string) => {
  return fetch("patterns/" + fileName)
    .then((res) => {
      return res.text();
    })
    .then((rleFile): Fauna => {
      let fauna = rleToFauna(rleFile, fileName);
      if (fauna.isOk()) {
        return fauna.unwrap();
      }

      throw `Failed to parse ${fileName}\n${fauna.unwrapErr()}`;
    });
});

fetchPatternFx.done.watch(({ params }) => {
  // add hash to URL
  window.location.hash = params;
});

fetchPatternFx.fail.watch(({ params, error }) => {
  if (typeof error === "string") {
    alert(error);
  } else {
    console.error(error);
    alert("Failed to fetch pattern: " + params);
  }
});

setTimeout(() => {
  let patternFileName = window.location.hash.slice(1);
  if (allTemplates[patternFileName]) {
    catalogue.selectPattern(patternFileName);
    // todo add auto scale
  }
  if (!patternFileName) {
    let keys = Object.keys(allTemplates);
    let randomPatternName = keys[Math.floor(Math.random() * keys.length)];
    catalogue.selectPattern(allTemplates[randomPatternName].fileName);
  }
}, 10);

sample({ clock: catalogue.selectPattern, target: fetchPatternFx });

sample({
  clock: fetchPatternFx.doneData,
  fn: (fauna) => {
    return { fauna, time: 0, size: 0 };
  },
  target: $faunaData,
});

sample({
  clock: [historySelected, importClicked, fetchPatternFx.doneData],
  target: focusToTheMiddle,
});
