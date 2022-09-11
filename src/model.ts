import { createEffect, createEvent, createStore, sample } from 'effector';
import { interval } from 'patronum';
import { getRowColFromEvent, getSavedFromLS, makeGo, saveToLS } from './utils';

export const FIELD_SIZE = 50;

const emptyField: boolean[][] = Array(FIELD_SIZE).fill(false).map(() => {
  return Array(FIELD_SIZE).fill(false);
});
export const $field = createStore<boolean[][]>(getSavedFromLS() || emptyField);

export const rawClicked = createEvent<any>();
const toggleCell = createEvent<{ row: number; col: number; }>();

export const tick = createEvent<any>();
export const reset = createEvent<any>();

const startTimer = createEvent<any>();
const stopTimer = createEvent<any>();
export const saveClicked = createEvent<any>();
export const restoreClicked = createEvent<any>();

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

export const cellHovered = createEvent<any>();

sample({
  clock: [timer.tick, startTimer],
  target: tick,
});

sample({
  clock: cellHovered.filterMap((ev) => {
    if (ev.shiftKey) return getRowColFromEvent(ev);
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
  .on(restoreClicked, () => getSavedFromLS() || emptyField)
  .on(tick, (field) => makeGo(field))
  .on(reset, () => emptyField);

sample({
  source: $field,
  clock: saveClicked,
  target: createEffect<boolean[][], any, any>((field) => {
    saveToLS(field);
  }),
});
