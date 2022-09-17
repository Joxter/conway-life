import { combine, createEvent, createStore, sample } from 'effector';
import { interval } from 'patronum';
import { Fauna, Field, FieldCell } from '../types';
import {
  coordsStrToNumbers,
  getRowColFromEvent,
  getWindowParams,
  newMakeGo,
  numbersToCoords,
} from '../utils';

const vp = getWindowParams();
export const initCellSize = 10;

const initH = Math.ceil(vp.height / initCellSize);
const initW = Math.ceil(vp.width / initCellSize);

export const $cellSize = createStore(initCellSize);
export const $fieldSize = createStore({ height: initH, width: initW });

const initFauna: Fauna = new Map();
export const $fauna = createStore<Fauna>(initFauna);

export const $focus = createStore({ x: -Math.ceil(initW / 2), y: -Math.ceil(initH / 2) });
export const moveFocus = createEvent<{ x?: number; y?: number; }>();
export const resetFocus = createEvent<any>();

export const $selectedColor = createStore<FieldCell>(1);
export const colorSelected = createEvent<FieldCell>();
$selectedColor.on(colorSelected, (_, color) => color);

export const toggleCell = createEvent<{ row: number; col: number; shift: boolean; }>();

export const $stepCount = createStore(0);
export const gameTick = createEvent<any>();
export const saveClicked = createEvent<any>();
export const resetFieldPressed = createEvent<any>();
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

export const $hoveredCell = createStore({ row: 0, col: 0, shift: false });
export const fieldMouseMove = createEvent<any>();

export const $field = combine(
  $fieldSize,
  $fauna,
  $focus,
  ({ width, height }, fauna, focus): Field => {
    const field: Field = [];

    fauna.forEach((val, coords) => {
      const coordsXY = coordsStrToNumbers(coords);

      const fieldX = Math.ceil(coordsXY[0] + width / 2 + focus.x);
      const fieldY = Math.ceil(coordsXY[1] + height / 2 + focus.y);

      if (fieldX >= 0 && fieldX < width) {
        if (fieldY >= 0 && fieldY < height) {
          field.push({ x: fieldX, y: fieldY, val: val });
        }
      }
    });

    return field;
  },
);

$stepCount
  .on(gameTick, (cnt) => cnt + 1)
  .on(makeNSteps, (cnt, n) => cnt + n)
  .reset(resetFieldPressed);

$fauna
  .on(gameTick, (fauna) => {
    return newMakeGo(fauna);
  })
  .on(makeNSteps, (fauna, amount) => {
    let f = fauna;

    for (let i = 1; i <= amount; i++) {
      f = newMakeGo(f);
    }

    return f;
  })
  .on(resetFieldPressed, () => new Map());

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
  source: $hoveredCell,
  clock: fieldMouseMove.filterMap((ev) => {
    return getRowColFromEvent(ev);
  }),
  fn: (current, evData) => {
    if (
      current.col === evData.col && current.row === evData.row && current.shift === evData.shift
    ) {
      return current;
    }
    return evData;
  },
  target: $hoveredCell,
});

sample({
  source: {
    fauna: $fauna,
    color: $selectedColor,
    size: $fieldSize,
    focus: $focus,
  },
  clock: toggleCell,
  fn: ({ color, fauna, focus, size }, { col, row, shift }) => {
    const newFauna = new Map(fauna);

    const faunaX = col - size.width / 2 - focus.x;
    const faunaY = row - size.height / 2 - focus.y;

    const coords = numbersToCoords([faunaX, faunaY]);
    if (shift) {
      newFauna.set(coords, color);
    } else {
      if (newFauna.get(coords) === color) {
        newFauna.delete(coords);
      } else {
        newFauna.set(coords, color);
      }
    }

    return newFauna;
  },
  target: $fauna,
});
