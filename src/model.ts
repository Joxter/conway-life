import { createEvent, createStore, sample } from 'effector';
import { interval } from 'patronum';
import { checkNeighbors, getRowColFromEvent, makeGo } from './utils';

export const FIELD_SIZE = 40;

const initField: boolean[][] = Array(FIELD_SIZE).fill(false).map(() => {
  return Array(FIELD_SIZE).fill(false);
});
export const $field = createStore<boolean[][]>(initField);

export const rawClicked = createEvent<any>();
const toggleCell = createEvent<{ row: number; col: number; }>();

export const tick = createEvent<any>();
export const reset = createEvent<any>();

const startTimer = createEvent<any>();
const stopTimer = createEvent<any>();

const timer = interval({
  timeout: 500,
  start: startTimer,
  stop: stopTimer,
});

export const gameTimer = {
  start: startTimer,
  stop: stopTimer,
  isRunning: timer.isRunning,
};

const $isMouseDown = createStore(false);

export const cellHovered = createEvent<any>();
const mouseDownEv = createEvent<any>();
const mouseUpEv = createEvent<any>();

$isMouseDown.on(mouseDownEv, () => true).on(mouseUpEv, () => false);

sample({
  clock: timer.tick,
  target: tick,
});

sample({
  clock: cellHovered.filterMap((ev) => {
    if (ev.shiftKey) return getRowColFromEvent(ev)
  }),
  target: toggleCell,
});

sample({
  clock: rawClicked.filterMap(getRowColFromEvent),
  target: toggleCell,
});

$field
  .on(toggleCell, (field, { row, col }) => {
    const newField = [...field];
    const newRow = [...field[row]];

    newRow[col] = !newRow[col];
    newField[row] = newRow;

    return newField;
  })
  .on(tick, (field) => makeGo(field)).reset(reset);

document.addEventListener('mousedown', () => {
  mouseDownEv();
});
document.addEventListener('mouseup', () => {
  mouseUpEv();
});
