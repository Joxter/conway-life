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

export const $focus = createStore({ col: 0, row: 0 });
export const moveFocus = createEvent<{ col?: number; row?: number; }>();
export const resetFocus = createEvent<any>();

export const $selectedColor = createStore<FieldCell>(1);
export const colorSelected = createEvent<FieldCell>();
$selectedColor.on(colorSelected, (_, color) => color);

export const toggleCell = createEvent<{ row: number; col: number; shift: boolean; }>();

export const saveClicked = createEvent<any>();
export const resetFieldPressed = createEvent<any>();

export const $hoveredCell = createStore({ row: 0, col: 0, shift: false }, {
  updateFilter: (newState, state) => {
    if (
      newState.row === state.row && newState.col === state.col && newState.shift === state.shift
    ) {
      return false;
    }
    return true;
  },
});
export const fieldMouseMove = createEvent<any>();

export const $field = combine(
  $fieldSize,
  $fauna,
  $focus,
  ({ width, height }, fauna, focus): Field => {
    const field: Field = [];

    fauna.forEach((val, coords) => {
      const [absCols, absRow] = coordsStrToNumbers(coords);

      const col = Math.ceil(absCols + focus.col);
      const row = Math.ceil(absRow + focus.row);

      if (col >= 0 && col < width) {
        if (row >= 0 && row < height) {
          field.push({ col, row, val });
        }
      }
    });

    return field;
  },
);

export const $viewField = combine($field, $cellSize, (field, size) => {
  return field.map(({ val, col, row }) => {
    return { val, y: row * size + 'px', x: col * size + 'px' };
  });
});

export const $viewHoveredCell = combine($hoveredCell, $cellSize, ({ col, row }, size) => {
  return { y: row * size + 'px', x: col * size + 'px' };
});

$cellSize.on(sizeChanged, (_, val) => val);

$fauna
  .on(resetFieldPressed, () => new Map());

$focus
  .on(moveFocus, (state, delta) => {
    return {
      col: state.col + (delta.col || 0),
      row: state.row + (delta.row || 0),
    };
  }).reset(resetFocus);

sample({
  source: $cellSize,
  clock: fieldMouseMove,
  fn: (size, evData) => {
    return getRowColFromEvent(evData, size);
  },
  target: $hoveredCell,
});

sample({
  source: {
    fauna: $fauna,
    color: $selectedColor,
    focus: $focus,
  },
  clock: toggleCell,
  fn: ({ color, fauna, focus }, { col, row, shift }) => {
    const newFauna = new Map(fauna);

    const faunaX = col - focus.col;
    const faunaY = row - focus.row;

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

export const $isElsaMode = createStore(true);
export const setElsaMode = createEvent<boolean>();

$isElsaMode.on(setElsaMode, (_, val) => val);
