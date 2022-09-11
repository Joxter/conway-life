import { sample } from 'effector';
import { $field, saveClicked } from './field';
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
    return history.find((it) => it.name === selected)!.field;
  },
  target: $field,
});
