import { combine, createEffect, createEvent, createStore, sample } from 'effector';
import { ColRow, Fauna, Field, FieldCell, RENDER_MODE } from '../types';
import { getMiddleOfFauna, newMakeGo } from '../utils';
import { createBlueprints } from './blueprints';
import { createDragTool, createELsaMode, createFieldSize, createHoveredCell } from './fieldParams';
import { createPerf } from './fps';
import { createProgress } from './progress';

export const fieldSize = createFieldSize();
export const elsaMode = createELsaMode();
export const hoveredCell = createHoveredCell(fieldSize.$cellSize);
const blueprints = createBlueprints();

export const $faunaData = createStore<{ fauna: Fauna; time: number; size: number; }>({
  fauna: new Map(),
  time: 0,
  size: 0,
});
export const $labels = createStore<{ col: number; row: number; label: string; }[]>(
  [
    // { col: 0, row: 0, label: '0,0' },
    // { col: 10, row: 10, label: '10,10' },
    // { col: 10, row: -10, label: '10,-10' },
    // { col: -10, row: 10, label: '-10,10' },
    // { col: -10, row: -10, label: '-10,-10' },
    // { col: 10, row: 0, label: '10,0' },
    // { col: 0, row: 10, label: '0,10' },
    // { col: -10, row: 0, label: '-10,0' },
    // { col: 0, row: -10, label: '0,-10' },
  ],
);

const calculateStepFx = createEffect((fauna: Fauna) => {
  return newMakeGo(fauna);
});
export const startCalc = createEvent<Fauna>();
export const calculated = createEvent<{ fauna: Fauna; time: number; size: number; }>();

export const progress = createProgress($faunaData.map((it) => it.fauna), calculated);
export const perf = createPerf(
  progress.$currentStep,
  progress.reset,
  calculated.map((it) => it.time),
);

export const $focus = createStore<ColRow>({ col: 0, row: 0 });
export const resetFocus = createEvent<any>();
export const focusToTheMiddle = createEvent<any>();

export const $selectedColor = createStore<FieldCell>(1);
export const colorSelected = createEvent<FieldCell>();
$selectedColor.on(colorSelected, (_, color) => color);

export const resetFieldPressed = createEvent<any>();

export const dragTool = createDragTool(hoveredCell.$cell, $focus);

export const $fieldTilesStyle = combine(elsaMode.$isOn, fieldSize.$cellSize, (isElsa, cellSize) => {
  return isElsa ? 'elsa' as const : cellSize;
});

export const $field = combine(
  fieldSize.$fieldSize,
  $faunaData,
  $focus,
  ({ width, height }, { fauna }, focus): Field => {
    const field: Field = [];

    fauna.forEach((colMap, absCols) => {
      colMap.forEach((val, absRow) => {
        const col = absCols + focus.col;
        const row = absRow + focus.row;

        if (col >= 0 && col < width) {
          if (row >= 0 && row < height) {
            field.push({ col, row, val });
          }
        }
      });
    });

    return field;
  },
);

export const $stats = combine($field, $faunaData, (field, fauna) => {
  // todo fauna.length is wrong
  return { fieldCellsAmount: field.length, faunaCellsAmount: fauna.size };
});

export const $labelsOnField = combine(
  fieldSize.$fieldSize,
  $labels,
  $focus,
  ({ width, height }, labels, focus): { col: number; row: number; label: string; }[] => {
    const labelsOnField: { col: number; row: number; label: string; }[] = [];

    labels.forEach(({ col, row, label }) => {
      const _col = col + focus.col;
      const _row = row + focus.row;

      if (_col >= 0 && _col < width) {
        if (_row >= 0 && _row < height) {
          labelsOnField.push({ col: _col, row: _row, label });
        }
      }
    });

    return labelsOnField;
  },
);

export const $viewField = combine($field, fieldSize.$cellSize, (field, size) => {
  return field.map(({ val, col, row }) => {
    if (RENDER_MODE === 'svg') {
      return { val, y: row * size, x: col * size };
    }
    return { val, y: row * size + 'px', x: col * size + 'px' };
  });
});

export const $viewHoveredCells = combine(
  hoveredCell.$cell,
  fieldSize.$cellSize,
  blueprints.currentBp, // todo FIX
  (hovered, size, bp) => {
    // if (hovered && bp) {
    //   return [...bp].map(([coordsStr]) => {
    //     const [bpCol, bpRow] = coordsStrToNumbers(coordsStr);
    //     return {
    //       y: (hovered.row + bpRow) * size + 'px',
    //       x: (hovered.col + bpCol) * size + 'px',
    //       // x: bpRow * size + 'px'
    //     };
    //   });
    // }

    if (hovered) {
      return [{ y: hovered.row * size + 'px', x: hovered.col * size + 'px' }];
    }
    return [];
  },
);

export const $viewLabels = combine($labelsOnField, fieldSize.$cellSize, (ls, size) => {
  return ls.map(({ row, col, label }) => {
    return { y: row * size + 'px', x: col * size + 'px', label };
  });
});

sample({
  source: $faunaData,
  clock: progress.gameTick,
  fn: (it) => it.fauna,
  target: startCalc,
});

$faunaData
  .on(calculated, (_, it) => it)
  .reset(resetFieldPressed);

$focus
  .on(dragTool.focusMoved, (state, newFocus) => {
    return newFocus;
  }).reset(resetFocus);

sample({
  source: { faunaData: $faunaData, fieldSize: fieldSize.$fieldSize },
  clock: focusToTheMiddle,
  fn: ({ faunaData, fieldSize }) => {
    const middle = getMiddleOfFauna(faunaData.fauna);
    return {
      col: Math.round(fieldSize.width / 2 - middle.col),
      row: Math.round(fieldSize.height / 2 - middle.row),
    };
  },
  target: $focus,
});

sample({
  source: {
    faunaData: $faunaData,
    color: $selectedColor,
    focus: $focus,
    currentBp: blueprints.currentBp,
  },
  clock: dragTool.clicked,
  fn: ({ color, faunaData, focus, currentBp }, { start: { col, row } }) => {
    const newFauna = new Map(faunaData.fauna);

    if (currentBp) {
      // todo fix
      // currentBp.forEach((color, coordsStr) => {
      //   const [bpCol, bpRow] = coordsStrToNumbers(coordsStr);
      //   const faunaX = col - focus.col + bpCol;
      //   const faunaY = row - focus.row + bpRow;
      //
      //   newFauna.set(numbersToCoords(faunaX, faunaY), color);
      // });
    } else {
      const faunaX = col - focus.col;
      const faunaY = row - focus.row;

      if (false) { // used to be "shift" to force color instead of toggle
        // newFauna.set(coords, color); // todo FIX
      } else {
        if (!newFauna.has(faunaX)) {
          newFauna.set(faunaX, new Map());
        }
        if (newFauna.get(faunaX)!.get(faunaY)! === color) {
          newFauna.get(faunaX)!.delete(faunaY);
        } else {
          newFauna.get(faunaX)!.set(faunaY, color);
        }
      }
    }

    return { ...faunaData, fauna: newFauna };
  },
  target: $faunaData,
});
