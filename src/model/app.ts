import { sample } from "effector";
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

sample({
  clock: [historySelected, importClicked],
  target: focusToTheMiddle,
});
