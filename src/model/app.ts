import { createEffect, sample } from "effector";
import { $exported, exportClicked, importClicked } from "./export";
import { $faunaData, focusToTheMiddle, progress, resetFieldPressed } from "./field";
import { $history, addToHistory, historySelected, saveClicked } from "./history";
import { faunaToRle, rleToFauna } from "../importExport/utils";
import { selectPattern } from "../feature/Catalogue/Catalogue.model";
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
      fauna: rleToFauna(savedRle).unwrapOr(new Map()),
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
    return { fauna: rleToFauna(str).unwrapOr(new Map()), time: 0, size: 0 };
  },
  target: $faunaData,
});

const fetchPatternFx = createEffect((name: string) => {
  return fetch("patterns/" + name + ".rle")
    .then((res) => {
      return res.text();
    })
    .then((rleFile): Fauna => {
      let rle = rleFile
        .split("\n")
        .filter((line) => !line.startsWith("#") && !line.startsWith("x ="))
        .join("\n");

      let fauna = rleToFauna(rle);
      if (fauna.isOk()) {
        return fauna.unwrap();
      }

      throw `Failed to parse ${name}\n${fauna.unwrapErr()}`;
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
  let patternName = window.location.hash.slice(1);
  if (allTemplates.includes(patternName)) {
    selectPattern(patternName);
    // todo add auto scale
  }
  if (!patternName) {
    selectPattern(allTemplates[Math.floor(Math.random() * allTemplates.length)]);
  }
}, 10);

sample({ clock: selectPattern, target: fetchPatternFx });

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
