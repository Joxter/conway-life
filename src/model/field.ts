import { combine, createEvent, createStore, sample } from "effector";
import { Fauna, Field, XY } from "../types";
import { adjustOffset, getWindowParams } from "../utils";
import { createBlueprints } from "./blueprints";
import { createDragTool, createFieldSize, createHoveredCell } from "./fieldParams";
import { createPerf } from "./fps";
import { createProgress } from "./progress";

export const fieldSize = createFieldSize();
export const hoveredCell = createHoveredCell();
const blueprints = createBlueprints();

let initFauna: Fauna = new Map();
initFauna.set(0, new Map([[0, 1]]));
// initFauna.set(58, new Map([[38, 1]]));

// prettier-ignore
initFauna.set(65, new Map([[29, 1], [18, 1],]));
initFauna.set(61, new Map([[29, 1]]));
// prettier-ignore
initFauna.set(71, new Map([[29, 1], [18, 1],]));
initFauna.set(76, new Map([[29, 1]]));

export const $faunaData = createStore<{ fauna: Fauna; time: number; size: number }>({
  fauna: initFauna,
  time: 0,
  size: 0,
});

// $faunaData.watch(console.log);
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

export const $screenOffsetXY = createStore<XY>({ x: 0, y: 0 });
export const resetFocus = createEvent<any>();
// export const setOffsetDBG = createEvent<XY>();
export const focusToTheMiddle = createEvent<any>();

// $screenOffsetXY.on(setOffsetDBG, (_, newOffset) => newOffset);

export const resetFieldPressed = createEvent<any>();

export const dragTool = createDragTool(hoveredCell.$hoveredXY, $screenOffsetXY);

// $screenOffsetXY.watch((a) => console.log("screenOffsetXY", a));
// fieldSize.$cellSize.watch((a) => console.log("cellSize", a));
// hoveredCell.$hoveredXY.watch(console.log);

sample({
  source: [$screenOffsetXY, hoveredCell.$hoveredXY] as const,
  clock: fieldSize.$cellSize,
  fn: ([currentOffset, hovered], { size, prevSize }) => {
    // return currentOffset;
    // todo fix :(
    if (hovered) {
      let pivotCell = {
        col: Math.floor((hovered.x - currentOffset.x) / prevSize),
        row: Math.floor((hovered.y - currentOffset.y) / prevSize),
      };

      return adjustOffset(pivotCell, hovered, size);
    } else {
      let _center = getWindowParams();
      let center = { x: _center.width / 2, y: _center.height / 2 };
      // let center = { x: 200, y: 150 };

      let pivotCell = {
        col: Math.floor((center.x - currentOffset.x) / prevSize),
        row: Math.floor((center.y - currentOffset.y) / prevSize),
      };
      return adjustOffset(pivotCell, center, size);
    }
  },
  target: $screenOffsetXY,
});

export const $field = combine(
  fieldSize.$fieldSize,
  $faunaData,
  $screenOffsetXY,
  fieldSize.$cellSize,
  fieldSize.$viewPortSize,
  (fieldSize, { fauna }, screenOffsetXY, { size: cellSize }, viewPortSize): Field => {
    // console.log(focus, cellSize, viewPortSize);
    const field: Field = [];

    fauna.forEach((colMap, cellCol) => {
      colMap.forEach((val, cellRow) => {
        const col = cellCol * cellSize + screenOffsetXY.x;
        const row = cellRow * cellSize + screenOffsetXY.y;
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
  $screenOffsetXY,
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
  (hovered, { size }) => {
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

export const $viewLabels = combine($labelsOnField, fieldSize.$cellSize, (ls, { size }) => {
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

$screenOffsetXY
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
  target: $screenOffsetXY,
});
*/

sample({
  source: {
    faunaData: $faunaData,
    screenOffsetXY: $screenOffsetXY,
    cellSize: fieldSize.$cellSize,
  },
  clock: dragTool.clicked,
  fn: ({ faunaData, screenOffsetXY, cellSize: { size } }, { coords }) => {
    const newFauna = new Map(faunaData.fauna);

    const faunaX = Math.floor((coords.x - screenOffsetXY.x) / size);
    const faunaY = Math.floor((coords.y - screenOffsetXY.y) / size);

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
