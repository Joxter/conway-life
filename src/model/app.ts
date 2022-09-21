import { sample } from 'effector';
import { Fauna } from '../types';
import { exportToSting, makeFaunaFromLexicon, newMakeGo } from '../utils';
import { $exported, exportClicked, importClicked } from './export';
import { $fauna, $field, resetFieldPressed, saveClicked } from './field';
import { $history, addToHistory, historySelected } from './history';
import { $stepCount, gameTick, gameTimer, makeNSteps } from './progress';

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

sample({ clock: [historySelected, resetFieldPressed], target: gameTimer.stop });

sample({
  source: $field,
  clock: exportClicked,
  fn: exportToSting,
  target: $exported,
});

$fauna.on(gameTick, (fauna) => {
  return newMakeGo(fauna);
})
  .on(makeNSteps, (fauna, amount) => {
    let f = fauna;

    for (let i = 1; i <= amount; i++) {
      f = newMakeGo(f);
    }

    return f;
  });

$stepCount.reset(historySelected, resetFieldPressed);
