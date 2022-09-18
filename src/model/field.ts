import { combine, createEvent, createStore, sample } from 'effector';
import { cellSizes, Fauna, Field, FieldCell, initCellSize } from '../types';
import { coordsStrToNumbers, getRowColFromEvent, getWindowParams, numbersToCoords } from '../utils';

const vp = getWindowParams();

export const $cellSize = createStore(initCellSize);
export const $cellSizeOptions = createStore(cellSizes);
export const $fieldSize = $cellSize.map((size) => {
  return { height: Math.ceil(vp.height / size), width: Math.ceil(vp.width / size) };
});

export const sizeChanged = createEvent<number>();

export const $fauna = createStore<Fauna>(new Map());

export const $focus = createStore({ x: 0, y: 0 });
export const moveFocus = createEvent<{ x?: number; y?: number; }>();
export const resetFocus = createEvent<any>();

export const $selectedColor = createStore<FieldCell>(1);
export const colorSelected = createEvent<FieldCell>();
$selectedColor.on(colorSelected, (_, color) => color);

export const toggleCell = createEvent<
  { x: number; y: number; row: number; col: number; shift: boolean; }
>();

export const saveClicked = createEvent<any>();
export const resetFieldPressed = createEvent<any>();

export const $hoveredCell = createStore({ row: 0, col: 0, x: 0, y: 0, shift: false });
export const fieldMouseMove = createEvent<any>();

export const $field = combine(
  $fieldSize,
  $fauna,
  $focus,
  $cellSize,
  ({ width, height }, fauna, focus, cellSize): Field => {
    const field: Field = [];

    fauna.forEach((val, coords) => {
      const coordsXY = coordsStrToNumbers(coords);

      const fieldX = Math.ceil(coordsXY[0] + width / 2 + focus.x);
      const fieldY = Math.ceil(coordsXY[1] + height / 2 + focus.y);

      if (fieldX >= 0 && fieldX < width) {
        if (fieldY >= 0 && fieldY < height) {
          field.push({ x: fieldX * cellSize, y: fieldY * cellSize, val: val });
        }
      }
    });

    return field;
  },
);

$cellSize.on(sizeChanged, (_, val) => val);

$fauna
  .on(resetFieldPressed, () => new Map());

$focus
  .on(moveFocus, (state, delta) => {
    return {
      x: state.x + (delta.x || 0),
      y: state.y + (delta.y || 0),
    };
  }).reset(resetFocus);

sample({
  source: { current: $hoveredCell, size: $cellSize },
  clock: fieldMouseMove,
  fn: ({ current, size }, evData) => {
    evData = getRowColFromEvent(evData, size);
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
    hoveredCell: $hoveredCell,
  },
  clock: toggleCell,
  fn: ({ color, fauna, focus, size, hoveredCell }, { col, row, shift }) => {
    const newFauna = new Map(fauna);

    const faunaX = col - Math.ceil(size.width / 2) - focus.x;
    const faunaY = row - Math.ceil(size.height / 2) - focus.y;

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
