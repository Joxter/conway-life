import { combine, createEvent, createStore, merge, sample, Store } from "effector";
import { interval } from "patronum";
import { Fauna } from "../types";
import { getStrFromLS, setStrToLS } from "../utils";

export function createProgress($fauna: Store<Fauna>, $isCalculating: Store<boolean>) {
  const lsStepsPerSecName = "expectedStepsPerSec";
  let initSteps = +getStrFromLS(lsStepsPerSecName, "10") || 10;

  const gameTick = createEvent<any>();

  const start = createEvent<any>();
  const stop = createEvent<any>();
  const pause = createEvent<any>();
  const oneStep = createEvent<any>();

  const reset = createEvent<any>();

  const $isRunning = createStore(false);
  const $currentStep = createStore(0);

  const speedRange = [1, 200] as const;

  const $expectedStepsPerSec = createStore(initSteps);

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
      if (speed === 1) {
        return 5;
      }
      let newSpeed = speed + 5;
      if (newSpeed > speedRange[1]) {
        return speedRange[1];
      }
      return newSpeed;
    })
    .on(decExpectedStepsPerSec, (speed) => {
      let newSpeed = speed - 5;
      if (newSpeed < 1) {
        return 1;
      }
      return newSpeed;
    });

  $startFauna.on(reset, () => null);

  $currentStep
    .on(gameTick, (cnt) => cnt + 1)
    .on(stop, () => 0)
    .reset(reset);

  $expectedStepsPerSec.watch((val) => {
    setStrToLS(lsStepsPerSecName, String(val));
  });

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
