import { combine, createEvent, createStore, sample } from "effector";
import { Fauna, Field, XY } from "../types";
import { adjustOffset, getMiddleOfFauna, getWindowParams, newFauna, newMakeGo } from "../utils";
import { createBlueprints } from "./blueprints";
import { createDragTool, createFieldSize, createHoveredCell } from "./fieldParams";
import { createPerf } from "./fps";
import { createProgress } from "./progress";
import { rleToFauna } from "../importExport/utils";

export const hoveredCell = createHoveredCell();
export const fieldSize = createFieldSize(hoveredCell.$hoveredXY.map((it) => !!it));
const blueprints = createBlueprints();

export const $faunaData = createStore<{ fauna: Fauna; time: number; size: number }>({
  fauna: rleToFauna(
    `8bo$7b3o$5b3ob2o$4bo2b2ob2o$4b2o4bo$4b4o2bo$7b3o$8bobo$b2o7b2o$ob2o5b2o$o3bo$b2obo$2b2o!`,
  ).unwrap(),
  time: 0,
  size: 0,
});
// $faunaData.watch(console.log);

export const $labels = createStore<{ col: number; row: number; label: string }[]>([
  // { col: 0, row: 0, label: "0,0" },
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
export const focusToTheMiddle = createEvent<any>();

export const resetFieldPressed = createEvent<any>();

export const dragTool = createDragTool(hoveredCell.$hoveredXY, $screenOffsetXY);

sample({
  source: [$screenOffsetXY, hoveredCell.$hoveredXY] as const,
  clock: fieldSize.$cellSize,
  fn: ([currentOffset, hovered], { size, prevSize }) => {
    if (hovered) {
      let pivotCell = {
        col: (hovered.x - currentOffset.x) / prevSize,
        row: (hovered.y - currentOffset.y) / prevSize,
      };

      return adjustOffset(pivotCell, hovered, size);
    } else {
      let windowParams = getWindowParams();
      let center = { x: windowParams.width / 2, y: windowParams.height / 2 };

      let pivotCell = {
        col: (center.x - currentOffset.x) / prevSize,
        row: (center.y - currentOffset.y) / prevSize,
      };
      return adjustOffset(pivotCell, center, size);
    }
  },
  target: $screenOffsetXY,
});

export const $field = combine(
  $faunaData,
  $screenOffsetXY,
  fieldSize.$cellSize,
  fieldSize.$viewPortSize,
  ({ fauna }, screenOffsetXY, { size: cellSize }, viewPortSize): Field => {
    const field: Field = [];

    fauna.forEach((colMap, cellCol) => {
      colMap.forEach((val, cellRow) => {
        const finX = cellCol * cellSize + screenOffsetXY.x;
        const finY = cellRow * cellSize + screenOffsetXY.y;

        if (finX >= 0 && finX < viewPortSize.width) {
          if (finY >= 0 && finY < viewPortSize.height) {
            field.push([finX, finY]);
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
  $labels,
  fieldSize.$fieldSize,
  fieldSize.$cellSize,
  $screenOffsetXY,
  (labels, { width, height }, { size }, focus): { col: number; row: number; label: string }[] => {
    const labelsOnField: { col: number; row: number; label: string }[] = [];

    labels.forEach(({ col, row, label }) => {
      const _col = col + focus.x / size;
      const _row = row + focus.y / size;

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
  $screenOffsetXY,
  (hovered, { size }, screenOffsetXY) => {
    if (hovered) {
      const cellCol = Math.floor((hovered.x - screenOffsetXY.x) / size);
      const cellRow = Math.floor((hovered.y - screenOffsetXY.y) / size);
      const finX = (cellCol * size + screenOffsetXY.x).toFixed(0);
      const finY = (cellRow * size + screenOffsetXY.y).toFixed(0);

      return [{ x: finX, y: finY }];
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
// sample({
//   source: $faunaData,
//   clock: progress.gameTick,
//   fn: (it) => newMakeGo(it.fauna),
//   target: calculated,
// });

$faunaData.on(calculated, (_, it) => it).reset(resetFieldPressed);

$screenOffsetXY
  .on(dragTool.focusMoved, (state, newFocus) => {
    return newFocus;
  })
  .reset(resetFocus);

sample({
  source: { faunaData: $faunaData, fieldSize: fieldSize.$fieldSize, cellSize: fieldSize.$cellSize },
  clock: focusToTheMiddle,
  fn: ({ faunaData, fieldSize, cellSize }) => {
    const middle = getMiddleOfFauna(faunaData.fauna);
    return {
      x: (fieldSize.width / 2 - middle.col) * cellSize.size,
      y: (fieldSize.height / 2 - middle.row) * cellSize.size,
    };
  },
  target: $screenOffsetXY,
});

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
