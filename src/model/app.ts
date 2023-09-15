import { sample } from "effector";
import { Fauna } from "../types";
import { $exported, exportClicked, importClicked } from "./export";
import { $faunaData, focusToTheMiddle, progress, resetFieldPressed } from "./field";
import { $history, addToHistory, historySelected, saveClicked } from "./history";
import { faunaToRle, rleToFauna } from "../importExport/utils";

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
    const saved = history.find((it) => it.name === selected)!.fauna;
    const fauna: Fauna = new Map(saved);
    return { fauna, time: 0, size: 0 };
  },
  target: $faunaData,
});

sample({
  clock: [historySelected, resetFieldPressed, exportClicked, importClicked],
  target: progress.reset,
});

sample({
  clock: historySelected,
  target: focusToTheMiddle,
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
    return { fauna: rleToFauna(str), time: 0, size: 0 };
  },
  target: $faunaData,
});
