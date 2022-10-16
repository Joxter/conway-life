import { sample } from 'effector';
import { Fauna } from '../types';
import { exportToSting, makeFaunaFromLexicon } from '../utils';
import { $exported, exportClicked, importClicked } from './export';
import { $fauna, $field, focusToTheMiddle, progress, resetFieldPressed } from './field';
import { $history, addToHistory, historySelected, saveClicked } from './history';

sample({
  source: $fauna,
  clock: saveClicked,
  target: addToHistory,
});

sample({
  source: $history,
  clock: historySelected,
  fn: (history, selected) => {
    const saved = history.find((it) => it.name === selected)!.fauna;
    const fauna: Fauna = new Map(saved);
    return fauna;
  },
  target: $fauna,
});

sample({ source: $exported, clock: importClicked, fn: makeFaunaFromLexicon, target: $fauna });

sample({ clock: [historySelected, resetFieldPressed], target: progress.reset });

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
