import { combine, createEvent, createStore, Event, merge, sample, Store } from "effector";
import { interval } from "patronum";
import { getStrFromLS, setStrToLS } from "../../utils";
import { IFauna } from "../../lifes/interface";

export function createProgress() {
  const lsStepsPerSecName = "expectedStepsPerSec";
  let initSteps = +getStrFromLS(lsStepsPerSecName, "10") || 10;

  const gameTick = createEvent<any>();

  const start = createEvent<any>();
  const stop = createEvent<any>();
  const pause = createEvent<any>();
  const oneStep = createEvent<any>();
  const calculated = createEvent<IFauna>();
  const getGeneration = createEvent<number>();

  const reset = createEvent<any>();
  const $isWW = createStore(true);

  const $isRunning = createStore(false); // start pressed
  const $isCalculating = createStore(false); // new generation is calculating
  const $currentStep = createStore(0);

  const speedRange = [1, 200] as const;

  const $expectedStepsPerSec = createStore(initSteps);

  const $stepTimeout = $expectedStepsPerSec.map((it) => 1000 / it);
  const incExpectedStepsPerSec = createEvent();
  const decExpectedStepsPerSec = createEvent();
  const lockWW = createEvent();
  const unlockWW = createEvent();

  $isCalculating.on(lockWW, () => true).on(unlockWW, () => false);

  const timer = interval({
    timeout: $stepTimeout,
    start: start,
    stop: merge([pause, stop, reset]),
  });

  sample({
    clock: [timer.tick, start],
    filter: combine($isRunning, $isCalculating, (running, calculating) => {
      return running && !calculating;
    }),
    target: gameTick,
  });

  sample({
    clock: oneStep,
    filter: $isRunning.map((it) => !it),
    target: gameTick,
  });

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
    });

  $currentStep.on(calculated, (_, res) => res.getGeneration()).reset(reset);

  $expectedStepsPerSec.watch((val) => {
    setStrToLS(lsStepsPerSecName, String(val));
  });

  return {
    $currentStep,
    $expectedStepsPerSec,
    $isRunning,
    $isWW,
    start,
    stop,
    pause,
    incExpectedStepsPerSec,
    decExpectedStepsPerSec,
    speedRange,
    reset,
    oneStep,
    calculated,
    getGeneration,
    lockWW,
    unlockWW,
  };
}
