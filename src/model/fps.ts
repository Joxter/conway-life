import { createEvent, createStore } from 'effector';
import { throttle } from 'patronum';

export const $fps = createStore('');
const setRawFps = createEvent<number>();

export const setFps = throttle({ source: setRawFps, timeout: 100 });

$fps.on(setFps, (_, fps) => String(fps));

const times: any = [];
let fps;

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

refreshLoop();
