import { sample } from 'effector';
import { Fauna } from '../types';
import { exportToSting } from '../utils';
import { $exported, exportClicked } from './export';
import { $fauna, $field, $stepCount, gameTimer, resetFieldPressed, saveClicked } from './field';
import { $history, addToHistory, historySelected } from './history';

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

sample({ clock: [historySelected, resetFieldPressed], target: gameTimer.stop });

sample({
  source: $field,
  clock: exportClicked,
  fn: exportToSting,
  target: $exported,
});

$stepCount.reset(historySelected);
