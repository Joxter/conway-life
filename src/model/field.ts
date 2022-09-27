import { combine, createEvent, createStore, sample } from 'effector';
import { ColRow, Fauna, Field, FieldCell } from '../types';
import {
  coordsStrToNumbers,
  getMiddleOfFauna,
  getRowColFromEvent,
  numbersToCoords,
} from '../utils';
import { createDragTool, createELsaMode, createFieldSize } from './fieldParams';

export const fieldSize = createFieldSize();
export const elsaMode = createELsaMode();

export const $fauna = createStore<Fauna>(new Map());
export const $labels = createStore<{ col: number; row: number; label: string; }[]>(
  [{ col: 0, row: 0, label: '0,0' }],
);

export const $focus = createStore<ColRow>({ col: 0, row: 0 });
export const resetFocus = createEvent<any>();
export const focusToTheMiddle = createEvent<any>();

export const $selectedColor = createStore<FieldCell>(1);
export const colorSelected = createEvent<FieldCell>();
$selectedColor.on(colorSelected, (_, color) => color);

export const saveClicked = createEvent<any>();
export const resetFieldPressed = createEvent<any>();

export const $hoveredCell = createStore<ColRow | null>(null, {
  updateFilter: (newState, state) => {
    if (
      newState && state
      && newState.row === state.row && newState.col === state.col
    ) {
      return false;
    }
    return true;
  },
});

export const dragTool = createDragTool($hoveredCell, $focus);

export const fieldMouseMove = createEvent<any>();
export const fieldMouseLeave = createEvent<any>();

export const $fieldTilesStyle = combine(elsaMode.$isOn, fieldSize.$cellSize, (isElsa, cellSize) => {
  return isElsa ? 'elsa' as const : cellSize;
});

export const $field = combine(
  fieldSize.$fieldSize,
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

export const $labelsOnField = combine(
  fieldSize.$fieldSize,
  $labels,
  $focus,
  ({ width, height }, labels, focus): { col: number; row: number; label: string; }[] => {
    const labelsOnField: { col: number; row: number; label: string; }[] = [];

    labels.forEach(({ col, row, label }) => {
      const _col = Math.ceil(col + focus.col);
      const _row = Math.ceil(row + focus.row);

      if (col >= 0 && col < width) {
        if (row >= 0 && row < height) {
          labelsOnField.push({ col: _col, row: _row, label });
        }
      }
    });

    return labelsOnField;
  },
);

export const $viewField = combine($field, fieldSize.$cellSize, (field, size) => {
  return field.map(({ val, col, row }) => {
    return { val, y: row * size + 'px', x: col * size + 'px' };
  });
});

export const $viewHoveredCell = combine($hoveredCell, fieldSize.$cellSize, (hovered, size) => {
  if (hovered) {
    return { y: hovered.row * size + 'px', x: hovered.col * size + 'px' };
  }
  return null;
});

export const $viewLabels = combine($labelsOnField, fieldSize.$cellSize, (ls, size) => {
  return ls.map(({ row, col, label }) => {
    return { y: row * size + 'px', x: col * size + 'px', label };
  });
});

$fauna
  .on(resetFieldPressed, () => new Map());

$focus
  .on(dragTool.focusMoved, (state, newFocus) => {
    return newFocus;
  }).reset(resetFocus);

$hoveredCell.on(fieldMouseLeave, () => null);

sample({
  source: fieldSize.$cellSize,
  clock: fieldMouseMove,
  fn: (size, evData) => {
    return getRowColFromEvent(evData, size);
  },
  target: $hoveredCell,
});

sample({
  source: { fauna: $fauna, fieldSize: fieldSize.$fieldSize },
  clock: focusToTheMiddle,
  fn: ({ fauna, fieldSize }) => {
    const middle = getMiddleOfFauna(fauna);
    return {
      col: Math.round(fieldSize.width / 2 - middle.col),
      row: Math.round(fieldSize.height / 2 - middle.row),
    };
  },
  target: $focus,
});

sample({
  source: {
    fauna: $fauna,
    color: $selectedColor,
    focus: $focus,
  },
  clock: dragTool.clicked,
  fn: ({ color, fauna, focus }, { start: { col, row } }) => {
    const newFauna = new Map(fauna);

    const faunaX = col - focus.col;
    const faunaY = row - focus.row;

    const coords = numbersToCoords([faunaX, faunaY]);
    if (false) { // used to be "shift" to force color instead of toggle
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
