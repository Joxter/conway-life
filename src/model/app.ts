import { sample } from 'effector';
import { Fauna } from '../types';
import { exportToSting, numbersToCoords } from '../utils';
import { $exported, exportClicked } from './export';
import { $fauna, $field, gameTimer, saveClicked } from './field';
import { $history, addToHistory, historySelected } from './history';

sample({
  source: $field,
  clock: saveClicked,
  target: addToHistory,
});

sample({
  source: $history,
  clock: historySelected,
  fn: (history, selected) => {
    const saved = history.find((it) => it.name === selected)!.field;
    const fauna: Fauna = new Map();

    saved.forEach((row, y) => {
      row.forEach((col, x) => {
        if (col) {
          fauna.set(numbersToCoords([x, y]), col);
        }
      });
    });

    return fauna;
  },
  target: $fauna,
});

sample({ clock: historySelected, target: gameTimer.stop });

sample({
  source: $field,
  clock: exportClicked,
  fn: exportToSting,
  target: $exported,
});
