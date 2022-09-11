import { createEvent, createStore, sample } from 'effector';
import { interval } from 'patronum';
import { createEmpty, getRowColFromEvent, makeGo } from '../utils';

export const $field = createStore<boolean[][]>(createEmpty(50, 50));
export const $fieldSize = $field.map((field) => {
  return { height: field.length, width: field[0].length };
});

export const rawClicked = createEvent<any>();
const toggleCell = createEvent<{ row: number; col: number; }>();

export const gameTick = createEvent<any>();
export const saveClicked = createEvent<any>();
export const reset = createEvent<any>();

const startTimer = createEvent<any>();
const stopTimer = createEvent<any>();

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
  target: gameTick,
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
  .on(gameTick, (field) => makeGo(field))
  .on(reset, () => createEmpty(50, 50));
