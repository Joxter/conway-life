import { createEvent, createStore, sample } from 'effector';
import { interval } from 'patronum';

export const $stepCount = createStore(0);
export const gameTick = createEvent<any>();
export const makeNSteps = createEvent<number>();

const startTimer = createEvent<any>();
const stopTimer = createEvent<any>();

const timer = interval({
  timeout: 50,
  start: startTimer,
  stop: stopTimer,
});

export const gameTimer = {
  start: startTimer,
  stop: stopTimer,
  isRunning: timer.isRunning,
};

sample({
  clock: [timer.tick, startTimer],
  target: gameTick,
});

$stepCount
  .on(gameTick, (cnt) => cnt + 1)
  .on(makeNSteps, (cnt, n) => cnt + n);
