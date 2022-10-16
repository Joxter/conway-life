import { createEvent, createStore, merge, sample, Store } from 'effector';
import { interval } from 'patronum';
import { Fauna } from '../types';

export function createProgress($fauna: Store<Fauna>) {
  const gameTick = createEvent<any>();

  const start = createEvent<any>();
  const stop = createEvent<any>();
  const pause = createEvent<any>();
  const oneStep = createEvent<any>();
  const oneStepBack = createEvent<any>();

  const reset = createEvent<any>();

  const $currentStep = createStore(0);
  const $currentSpeed = createStore(50);
  const changeSpeed = createEvent<number>();

  const $startFauna = createStore<Fauna | null>(null);

  const timer = interval({
    timeout: $currentSpeed,
    start: start,
    stop: merge([pause, stop, reset]),
  });

  sample({
    clock: [timer.tick, start, oneStep],
    target: gameTick,
  });

  sample({
    source: $fauna,
    clock: start,
    fn: (f) => new Map(f),
    target: $startFauna,
  });

  $currentSpeed
    .on(changeSpeed, (_, speed) => speed)
    .reset(reset);

  $startFauna
    .on(reset, () => null);

  $currentStep
    .on(gameTick, (cnt) => cnt + 1)
    .on(stop, () => 0)
    .reset(reset);

  return {
    $currentStep,
    $isRunning: timer.isRunning,
    $startFauna,
    start,
    stop,
    pause,
    changeSpeed,
    gameTick,
    reset,
    oneStep,
  };
}
