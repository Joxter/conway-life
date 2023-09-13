import { combine, createEvent, createStore, sample } from "effector";
import { ColRow, Fauna, Field, FieldCell, XY } from "../types";
import { getMiddleOfFauna } from "../utils";
import { createBlueprints } from "./blueprints";
import { createDragTool, createELsaMode, createFieldSize, createHoveredCell } from "./fieldParams";
import { createPerf } from "./fps";
import { createProgress } from "./progress";

export const fieldSize = createFieldSize();
export const elsaMode = createELsaMode();
export const hoveredCell = createHoveredCell(fieldSize.$cellSize);
const blueprints = createBlueprints();

let initFauna: Fauna = new Map();
initFauna.set(0, new Map([[0, 1]]));

export const $faunaData = createStore<{ fauna: Fauna; time: number; size: number }>({
  fauna: initFauna,
  time: 0,
  size: 0,
});
export const $labels = createStore<{ col: number; row: number; label: string }[]>([
  { col: 0, row: 0, label: "0,0" },
  // { col: 10, row: 10, label: "10,10" },
  // { col: 10, row: -10, label: "10,-10" },
  // { col: -10, row: 10, label: "-10,10" },
  // { col: -10, row: -10, label: "-10,-10" },
  // { col: 10, row: 0, label: "10,0" },
  // { col: 0, row: 10, label: "0,10" },
  // { col: -10, row: 0, label: "-10,0" },
  // { col: 0, row: -10, label: "0,-10" },
]);

export const $isCalculating = createStore(false);
export const startCalc = createEvent<Fauna>();
export const calculated = createEvent<{ fauna: Fauna; time: number; size: number }>();
$isCalculating.on(startCalc, () => true).on(calculated, () => false);

export const progress = createProgress(
  $faunaData.map((it) => it.fauna),
  $isCalculating,
);
export const perf = createPerf(
  progress.$currentStep,
  progress.reset,
  calculated.map((it) => it.time),
);

export const $focus = createStore<XY>({ x: 0, y: 0 });
export const resetFocus = createEvent<any>();
export const focusToTheMiddle = createEvent<any>();

export const resetFieldPressed = createEvent<any>();

export const dragTool = createDragTool(hoveredCell.$hoveredXY, $focus);

export const $fieldTilesStyle = combine(elsaMode.$isOn, fieldSize.$cellSize, (isElsa, cellSize) => {
  return isElsa ? ("elsa" as const) : cellSize;
});

/*
$focus.on(fieldSize.$fieldSize, (current, field) => {
  if (field.prevHeight && field.prevWidth) {
    return {
      col: current.x + Math.round((field.width - field.prevWidth) / 2),
      row: current.y + Math.round((field.height - field.prevHeight) / 2),
    };
  }
});
*/

export const $field = combine(
  fieldSize.$fieldSize,
  $faunaData,
  $focus,
  fieldSize.$cellSize,
  fieldSize.$viewPortSize,
  (fieldSize, { fauna }, focus, cellSize, viewPortSize): Field => {
    // console.log(focus, cellSize, viewPortSize);
    const field: Field = [];

    fauna.forEach((colMap, absCols) => {
      colMap.forEach((val, absRow) => {
        const col = absCols + focus.x / cellSize;
        const row = absRow + focus.y / cellSize;
        // console.log("cell", [absCols, absRow], [col, row]);

        // if (col >= 0 && col < fieldSize.width) {
        //   if (row >= 0 && row < fieldSize.height) {
        field.push({ col, row, val });
        //   }
        // }
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
  ({ width, height }, labels, focus): { col: number; row: number; label: string }[] => {
    const labelsOnField: { col: number; row: number; label: string }[] = [];

    labels.forEach(({ col, row, label }) => {
      const _col = col + focus.x;
      const _row = row + focus.y;

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
  return { size, field };
});

export const $viewHoveredCells = combine(
  hoveredCell.$hoveredXY,
  fieldSize.$cellSize,
  (hovered, size) => {
    if (hovered) {
      return [
        {
          y: Math.floor(hovered.y / size) * size + "px", // todo fix
          x: Math.floor(hovered.x / size) * size + "px",
        },
      ];
    }
    return [];
  },
);

export const $viewLabels = combine($labelsOnField, fieldSize.$cellSize, (ls, size) => {
  return ls.map(({ row, col, label }) => {
    return { y: row * size + "px", x: col * size + "px", label };
  });
});

sample({
  source: $faunaData,
  clock: progress.gameTick,
  fn: (it) => it.fauna,
  target: startCalc,
});

$faunaData.on(calculated, (_, it) => it).reset(resetFieldPressed);

$focus
  .on(dragTool.focusMoved, (state, newFocus) => {
    return newFocus;
  })
  .reset(resetFocus);

/*
sample({
  source: { faunaData: $faunaData, fieldSize: fieldSize.$fieldSize },
  clock: focusToTheMiddle,
  fn: ({ faunaData, fieldSize }) => {
    const middle = getMiddleOfFauna(faunaData.fauna);
    return {
      x: Math.round(fieldSize.width / 2 - middle.col),
      y: Math.round(fieldSize.height / 2 - middle.row),
    };
  },
  target: $focus,
});
*/

sample({
  source: {
    faunaData: $faunaData,
    focus: $focus,
    cellSize: fieldSize.$cellSize,
  },
  clock: dragTool.clicked,
  fn: ({ faunaData, focus, cellSize }, { start }) => {
    const newFauna = new Map(faunaData.fauna);

    const faunaX = Math.floor((start.x - focus.x) / cellSize);
    const faunaY = Math.floor((start.y - focus.y) / cellSize);

    if (!newFauna.has(faunaX)) {
      newFauna.set(faunaX, new Map());
    }
    if (newFauna.get(faunaX)!.has(faunaY)) {
      newFauna.get(faunaX)!.delete(faunaY);
    } else {
      newFauna.get(faunaX)!.set(faunaY, 1);
    }

    return { ...faunaData, fauna: newFauna };
  },
  target: $faunaData,
});
