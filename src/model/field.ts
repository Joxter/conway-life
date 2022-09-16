import { combine, createEvent, createStore, sample } from 'effector';
import { interval } from 'patronum';
import { Fauna, Field, FieldCell } from '../types';
import {
  coordsStrToNumbers,
  createEmpty,
  getRowColFromEvent,
  newMakeGo,
  numbersToCoords,
} from '../utils';

const initH = 50;
const initW = 80;

export const $fieldSize = createStore({ height: 50, width: 80 });

const initFauna: Fauna = new Map();
export const $fauna = createStore<Fauna>(initFauna);

export const $focus = createStore({ x: -Math.ceil(initW / 2), y: -Math.ceil(initH / 2) });
export const moveFocus = createEvent<{ x?: number; y?: number; }>();
export const resetFocus = createEvent<any>();

export const $selectedColor = createStore<FieldCell>(1);
export const colorSelected = createEvent<FieldCell>();
$selectedColor.on(colorSelected, (_, color) => color);

export const toggleCell = createEvent<{ row: number; col: number; }>();

export const gameTick = createEvent<any>();
export const saveClicked = createEvent<any>();
export const reset = createEvent<any>();
export const makeNSteps = createEvent<number>();

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

export const $field = combine(
  $fieldSize,
  $fauna,
  $focus,
  ({ width, height }, fauna, focus): Field => {
    const field = createEmpty(width, height);

    fauna.forEach((val, coords) => {
      const coordsXY = coordsStrToNumbers(coords);

      const fieldX = coordsXY[0] + width / 2 + focus.x;
      const fieldY = coordsXY[1] + height / 2 + focus.y;

      if (fieldX >= 0 && fieldX < width) {
        if (fieldY >= 0 && fieldY < height) {
          field[fieldY][fieldX] = val;
        }
      }
    });

    return field;
  },
);

$fauna
  .on(gameTick, (fauna) => {
    return newMakeGo(fauna);
  })
  .on(makeNSteps, (fauna, amount) => {
    let f = fauna;
    let start = Date.now();

    for (let i = 1; i <= amount; i++) {
      f = newMakeGo(f);
    }

    return f;
  })
  .on(reset, () => new Map());

$focus
  .on(moveFocus, (state, delta) => {
    return {
      x: state.x + (delta.x || 0),
      y: state.y + (delta.y || 0),
    };
  }).reset(resetFocus);

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
  source: { fauna: $fauna, color: $selectedColor, size: $fieldSize, focus: $focus },
  clock: toggleCell,
  fn: ({ color, fauna, focus, size }, { col, row }) => {
    const newFauna = new Map(fauna);

    const faunaX = col - size.width / 2 - focus.x;
    const faunaY = row - size.height / 2 - focus.y;

    newFauna.set(numbersToCoords([faunaX, faunaY]), color);

    return newFauna;
  },
  target: $fauna,
});
