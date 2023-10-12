import { combine, createEvent, createStore, sample } from "effector";
import { Field, XY } from "../types";
import { adjustOffset, getMiddleOfFauna, getViewPortParams } from "../utils";
import { createFieldSize, createScreen } from "./fieldParams";
import { createPerf } from "./fps";
import { createProgress } from "../feature/Progress/progress.model";
import { MyFauna } from "../lifes/myFauna";
import { IFauna } from "../lifes/interface";
import { createLabels } from "../feature/Labels/labels.model";

const ViewPort = getViewPortParams();

export const screen = createScreen();
export const fieldSize = createFieldSize();

export const $faunaData = createStore<{ ref: IFauna }>({ ref: new MyFauna() });

export const labels = createLabels();

export const setNewFauna = createEvent<IFauna>();

export const progress = createProgress();

export const perf = createPerf(
  progress.$currentStep,
  progress.reset,
  progress.calculated.map((it) => it.getTime()),
);

const $screenOffsetXY = createStore<XY>({ x: 0, y: 0 });
export const focusToTheMiddle = createEvent<any>();

export const resetFieldPressed = createEvent<any>();

$faunaData
  .on(setNewFauna, (_, data) => {
    return { ref: data };
  })
  .on(progress.calculated, (_, data) => {
    return { ref: data };
  })
  .reset(resetFieldPressed);

sample({
  source: [$screenOffsetXY, screen.$hovered] as const,
  clock: fieldSize.$cellSize,
  fn: ([currentOffset, hovered], { size, prevSize }) => {
    if (hovered) {
      let pivotCell = {
        col: (hovered.x - currentOffset.x) / prevSize,
        row: (hovered.y - currentOffset.y) / prevSize,
      };

      return adjustOffset(pivotCell, hovered, size);
    } else {
      let center = { x: ViewPort.width / 2, y: ViewPort.height / 2 };

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
  (fauna, screenOffsetXY, { size: cellSize }, viewPortSize): Field => {
    const field: Field = [];

    fauna.ref.getCells().forEach(([cellCol, cellRow]) => {
      const finX = cellCol * cellSize + screenOffsetXY.x;
      const finY = cellRow * cellSize + screenOffsetXY.y;
      // const finX = (cellCol * cellSize + screenOffsetXY.x) >> 1;
      // const finY = (cellRow * cellSize + screenOffsetXY.y) >> 1;

      if (finX >= 0 && finX < viewPortSize.width) {
        if (finY >= 0 && finY < viewPortSize.height) {
          field.push([finX, finY]);
        }
      }
    });

    return field;
  },
);

export const $stats = combine($field, $faunaData, (field, fauna) => {
  return { fieldCellsAmount: field.length, population: fauna.ref.getPopulation() };
});

export const $labelsOnField = combine(
  labels.$labels,
  fieldSize.$fieldSize,
  fieldSize.$cellSize,
  $screenOffsetXY,
  (labels, { width, height }, { size }, focus): { col: number; row: number; label: string }[] => {
    const labelsOnField: { col: number; row: number; label: string }[] = [];
    let deltaCol = focus.x / size;
    let deltaRow = focus.y / size;

    labels.forEach(({ col, row, label }) => {
      const _col = col + deltaCol;
      const _row = row + deltaRow;

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
  screen.$hovered,
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

export const $hoveredCellColRow = combine(
  screen.$hovered,
  fieldSize.$cellSize,
  $screenOffsetXY,
  (hovered, { size }, screenOffsetXY) => {
    if (hovered) {
      const cellCol = Math.floor((hovered.x - screenOffsetXY.x) / size);
      const cellRow = Math.floor((hovered.y - screenOffsetXY.y) / size);

      return { col: cellCol, row: cellRow };
    }
    return null;
  },
);

export const $centerScreenColRow = combine(
  fieldSize.$cellSize,
  $screenOffsetXY,
  ({ size }, screenOffsetXY) => {
    const cellCol = Math.floor((ViewPort.width / 2 - screenOffsetXY.x) / size);
    const cellRow = Math.floor((ViewPort.height / 2 - screenOffsetXY.y) / size);

    return { col: cellCol, row: cellRow };
  },
);

export const $viewLabels = combine($labelsOnField, fieldSize.$cellSize, (ls, { size }) => {
  return ls.map(({ row, col, label }) => {
    return { y: row * size, x: col * size, label };
  });
});

const $initScreenOffsetXY = createStore<XY>({ x: 0, y: 0 });

sample({
  source: $screenOffsetXY,
  clock: screen.onPointerDown,
  target: $initScreenOffsetXY,
});

sample({
  source: $initScreenOffsetXY,
  clock: screen.onDrag,
  fn: (initFocus, { from, to }) => {
    return {
      x: initFocus.x + to.x - from.x,
      y: initFocus.y + to.y - from.y,
    };
  },
  target: $screenOffsetXY,
});

sample({
  source: { faunaData: $faunaData, cellSize: fieldSize.$cellSize },
  clock: focusToTheMiddle,
  fn: ({ faunaData, cellSize }) => {
    const size = faunaData.ref.getBounds();
    if (!size) {
      return cellSize;
    }

    let { right, top, bottom, left } = size;
    let width = right - left + 1;
    let height = bottom - top + 1;

    let maxVisualWidth = ViewPort.width * 0.6;
    let maxVisualHeight = ViewPort.height * 0.6;

    let pixelSize = Math.floor(Math.min(maxVisualWidth / width, maxVisualHeight / height));

    if (pixelSize < 1) pixelSize = 1;
    if (pixelSize > 30) pixelSize = 30;

    return { size: pixelSize, prevSize: cellSize.size };
  },
  target: fieldSize.$cellSize,
});

sample({
  source: { faunaData: $faunaData, fieldSize: fieldSize.$fieldSize, cellSize: fieldSize.$cellSize },
  clock: focusToTheMiddle,
  fn: ({ faunaData, fieldSize, cellSize }) => {
    const middle = getMiddleOfFauna(faunaData.ref);
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
  clock: screen.onPointerClick,
  fn: ({ faunaData, screenOffsetXY, cellSize: { size } }, coords) => {
    const faunaX = Math.floor((coords.x - screenOffsetXY.x) / size);
    const faunaY = Math.floor((coords.y - screenOffsetXY.y) / size);

    faunaData.ref.toggleCell(faunaX, faunaY);

    return { ref: faunaData.ref };
  },
  target: $faunaData,
});
