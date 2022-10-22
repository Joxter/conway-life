import { createEvent, createStore, Event, sample, Store } from 'effector';
import { delay } from 'patronum';
import { Fauna } from '../types';

export function createProgress(
  $fauna: Store<Fauna>,
  calculationResult: Event<{ fauna: Fauna; time: number; size: number; }>,
) {
  const gameTick = createEvent<any>();

  const start = createEvent<any>();
  const stop = createEvent<any>();
  const pause = createEvent<any>();
  const oneStep = createEvent<any>();

  const reset = createEvent<any>();

  const $isRunning = createStore(false);
  const $currentStep = createStore(0);
  const $stepDelay = createStore(10);
  const changeSpeed = createEvent<number>();

  const $startFauna = createStore<Fauna | null>(null);

  const delayAfterCalc = delay({ source: calculationResult, timeout: $stepDelay });

  sample({
    clock: [delayAfterCalc, start, oneStep],
    filter: $isRunning,
    target: gameTick,
  });

  sample({ clock: oneStep, target: gameTick });

  sample({
    source: $fauna,
    clock: start,
    fn: (f) => new Map(f),
    target: $startFauna,
  });

  $isRunning
    .on(start, () => true)
    .on([stop, pause], () => false)
    .reset(reset);

  $stepDelay
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
    $currentSpeed: $stepDelay,
    $isRunning,
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
