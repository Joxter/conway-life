import { combine, createEvent, createStore, merge, sample, Store } from 'effector';
import { interval } from 'patronum';
import { Fauna } from '../types';

export function createProgress(
  $fauna: Store<Fauna>,
  $isCalculating: Store<boolean>,
) {
  const gameTick = createEvent<any>();

  const start = createEvent<any>();
  const stop = createEvent<any>();
  const pause = createEvent<any>();
  const oneStep = createEvent<any>();

  const reset = createEvent<any>();

  const $isRunning = createStore(false);
  const $currentStep = createStore(0);

  const speedRange = [1, 60] as const;
  const $expectedStepsPerSec = createStore(30);
  const $stepTimeout = $expectedStepsPerSec.map((it) => 1000 / it);
  const incExpectedStepsPerSec = createEvent();
  const decExpectedStepsPerSec = createEvent();

  const $startFauna = createStore<Fauna | null>(null);

  const timer = interval({
    timeout: $stepTimeout,
    start: start,
    stop: merge([pause, stop, reset]),
  });

  sample({
    clock: [timer.tick, start, oneStep],
    filter: combine($isRunning, $isCalculating, (running, calculating) => running && !calculating),
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

  $expectedStepsPerSec
    .on(incExpectedStepsPerSec, (speed) => {
      return Math.min(speed + 5, speedRange[1]);
    })
    .on(decExpectedStepsPerSec, (speed) => {
      return Math.max(speed - 5, speedRange[0]);
    })
    .reset(reset);

  $startFauna
    .on(reset, () => null);

  $currentStep
    .on(gameTick, (cnt) => cnt + 1)
    .on(stop, () => 0)
    .reset(reset);

  return {
    $currentStep,
    $expectedStepsPerSec,
    $isRunning,
    $startFauna,
    start,
    stop,
    pause,
    incExpectedStepsPerSec,
    decExpectedStepsPerSec,
    speedRange,
    gameTick,
    reset,
    oneStep,
  };
}
