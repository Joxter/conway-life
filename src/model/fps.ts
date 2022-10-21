import { createEvent, createStore, Event, restore, sample, Store, Unit } from 'effector';
import { interval, throttle } from 'patronum';

export function createPerf(
  $steps: Store<number>,
  reset: Unit<any>,
  calculationResult: Event<{ time: number; fauna: any; }>,
) {
  const $fps = createStore(0);
  const $_stepsPerSec = createStore({ prev: 0, delta: 0 }).reset(reset);
  const setRawFps = createEvent<number>();
  const run = createEvent();

  const setFps = throttle({ source: setRawFps, timeout: 100 });
  const throttledCalculation = throttle({ source: calculationResult, timeout: 1000 });
  const timer = interval({ timeout: 1000, start: run });

  $fps.on(setFps, (_, fps) => fps);

  sample({
    source: { stepsPerSec: $_stepsPerSec, steps: $steps },
    clock: timer.tick,
    fn: ({ stepsPerSec, steps }) => {
      return {
        prev: steps,
        delta: steps - stepsPerSec.prev,
      };
    },
    target: $_stepsPerSec,
  });

  const times: any = [];
  let fps;

  run();

  refreshLoop();
  function refreshLoop() {
    window.requestAnimationFrame(() => {
      const now = performance.now();
      while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
      }
      times.push(now);
      fps = times.length;
      refreshLoop();
    });
    setRawFps(times.length);
  }

  return {
    $fps,
    $stepsPerSec: $_stepsPerSec.map((it) => it.delta),
    $time: restore(throttledCalculation.map((it) => it.time), 0),
  };
}
