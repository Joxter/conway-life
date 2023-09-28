import { combine, createEvent, createStore, Event, merge, sample, Store } from "effector";
import { interval } from "patronum";
import { FaunaData } from "../../model/field";
import { getStrFromLS, setStrToLS } from "../../utils";

export function createProgress() {
  const lsStepsPerSecName = "expectedStepsPerSec";
  let initSteps = +getStrFromLS(lsStepsPerSecName, "10") || 10;

  const gameTick = createEvent<any>();

  const start = createEvent<any>();
  const stop = createEvent<any>();
  const pause = createEvent<any>();
  const oneStep = createEvent<any>();
  const calculated = createEvent<{ data: FaunaData; gen: number }>();
  const getGeneration = createEvent<number>();

  const reset = createEvent<any>();

  const $isRunning = createStore(false); // start pressed
  const $isCalculating = createStore(false); // new generation is calculation
  const $currentStep = createStore(0);

  const speedRange = [1, 200] as const;

  const $expectedStepsPerSec = createStore(initSteps);

  const $stepTimeout = $expectedStepsPerSec.map((it) => 1000 / it);
  const incExpectedStepsPerSec = createEvent();
  const setSteps = createEvent<number>();
  const decExpectedStepsPerSec = createEvent();

  $isCalculating.on([start, getGeneration], () => true).on(calculated, () => false);

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
    source: $currentStep,
    clock: gameTick,
    fn: (step) => step + 1,
    target: getGeneration,
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
    })
    .on(setSteps, (_, val) => val);

  $currentStep
    .on(calculated, (_, res) => res.gen)
    .on(stop, () => 0)
    .reset(reset);

  $expectedStepsPerSec.watch((val) => {
    setStrToLS(lsStepsPerSecName, String(val));
  });

  return {
    $currentStep,
    $expectedStepsPerSec,
    $isRunning,
    $isCalculating,
    start,
    stop,
    pause,
    incExpectedStepsPerSec,
    decExpectedStepsPerSec,
    setSteps,
    speedRange,
    gameTick,
    reset,
    oneStep,
    calculated,
    getGeneration,
  };
}
