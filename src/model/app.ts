import { sample } from 'effector';
import { Fauna } from '../types';
import { exportToSting, makeFaunaFromLexicon, rleToFauna } from '../utils';
import { $exported, exportClicked, importClicked } from './export';
import { $faunaData, $field, focusToTheMiddle, progress, resetFieldPressed } from './field';
import { $history, addToHistory, historySelected, saveClicked } from './history';

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

sample({ // todo temp hack
  clock: historySelected,
  target: focusToTheMiddle,
});

sample({
  source: $field,
  clock: exportClicked,
  fn: exportToSting,
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
