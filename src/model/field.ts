import { combine, createEvent, createStore, sample } from "effector";
import { Field } from "../types";
import { adjustOffset, getMiddleOfFauna, getViewPortParams } from "../utils";
import { createFieldSize, createScreen } from "./fieldParams";
import { createPerf } from "./fps";
import { createProgress } from "../feature/Progress/progress.model";
import { MyFauna } from "../lifes/myFauna";
import { IFauna } from "../lifes/interface";
import { createLabels } from "../feature/Labels/labels.model";
import { createPalette } from "../feature/Palette/palette.model";
import { amountOfIslands } from "../microscope/tools";

const ViewPort = getViewPortParams();

export const $faunaData = createStore<{ ref: IFauna }>({ ref: new MyFauna() });
export const $islands = $faunaData.map((it) => amountOfIslands(it.ref));

export const fieldSize = createFieldSize();
export const screen = createScreen(fieldSize.$screenOffsetXY);
export const labels = createLabels();
export const progress = createProgress();
export const palette = createPalette();

export const perf = createPerf(
  progress.$currentStep,
  progress.reset,
  progress.calculated.map((it) => it.getTime()),
);

export const focusToTheMiddle = createEvent<any>();
export const resetFieldPressed = createEvent<any>();

$faunaData
  .on(progress.calculated, (_, data) => {
    return { ref: data };
  })
  .reset(resetFieldPressed);

sample({
  source: [fieldSize.$screenOffsetXY, screen.$hovered] as const,
  clock: fieldSize.$cellSize,
  fn: ([screenOffset, hovered], { size, prevSize }) => {
    let cursor = hovered || { x: ViewPort.width / 2, y: ViewPort.height / 2 };

    return adjustOffset(cursor, screenOffset, size, prevSize);
  },
  target: fieldSize.$screenOffsetXY,
});

export const $field = combine(
  $faunaData,
  fieldSize.$screenOffsetXY,
  fieldSize.$viewPortSize,
  fieldSize.$cellSize,
  (fauna, focus, { width, height }, { size }): Field => {
    const field: Field = [];
    let screenWidth = width - focus.x;
    let screenHeight = height - focus.y;

    fauna.ref.getCells().forEach(([cellCol, cellRow]) => {
      let cellX = cellCol * size;
      let cellY = cellRow * size;

      if (cellX >= -focus.x && cellX < screenWidth) {
        if (cellY >= -focus.y && cellY < screenHeight) {
          field.push([cellX + focus.x, cellY + focus.y]);
        }
      }
    });

    return field;
  },
);

export const $viewLabels = combine(
  labels.$labels,
  fieldSize.$screenOffsetXY,
  fieldSize.$viewPortSize,
  fieldSize.$cellSize,
  (labels, focus, { width, height }, { size }) => {
    const labelsOnField: { x: number; y: number; label: string }[] = [];
    let screenWidth = width - focus.x;
    let screenHeight = height - focus.y;

    labels.forEach(({ col, row, label }) => {
      let cellX = col * size;
      let cellY = row * size;

      if (cellX >= -focus.x && cellX < screenWidth) {
        if (cellY >= -focus.y && cellY < screenHeight) {
          labelsOnField.push({ x: cellX + focus.x, y: cellY + focus.y, label });
        }
      }
    });

    return labelsOnField;
  },
);

export const $viewField = combine($field, fieldSize.$cellSize, (field, { size }) => {
  return { size, field };
});

export const $viewHoveredCell = combine(
  screen.$hovered,
  fieldSize.$cellSize,
  fieldSize.$screenOffsetXY,
  palette.$currentPalette,
  (hovered, { size }, screenOffsetXY, currentPalette) => {
    if (hovered) {
      const cellCol = Math.floor((hovered.x - screenOffsetXY.x) / size);
      const cellRow = Math.floor((hovered.y - screenOffsetXY.y) / size);
      const finX = (cellCol * size + screenOffsetXY.x).toFixed(0);
      const finY = (cellRow * size + screenOffsetXY.y).toFixed(0);

      return {
        x: finX,
        y: finY,
        col: cellCol,
        row: cellRow,
        size: currentPalette
          ? {
              width: currentPalette.width * size || size,
              height: currentPalette.height * size || size,
            }
          : { width: size, height: size },
      };
    }
    return null;
  },
);

sample({ clock: screen.screenOffsetMoved, target: fieldSize.$screenOffsetXY });

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
    if (pixelSize > 25) pixelSize = 25;

    return { size: pixelSize, prevSize: cellSize.size };
  },
  target: fieldSize.$cellSize,
});

sample({
  source: {
    fauna: $faunaData,
    viewPort: fieldSize.$viewPortSize,
    cellSize: fieldSize.$cellSize,
  },
  clock: focusToTheMiddle,
  fn: ({ fauna, viewPort, cellSize }) => {
    const middle = getMiddleOfFauna(fauna.ref);
    return {
      x: viewPort.width / 2 - middle.x * cellSize.size,
      y: viewPort.height / 2 - middle.y * cellSize.size,
    };
  },
  target: fieldSize.$screenOffsetXY,
});

sample({
  source: {
    faunaData: $faunaData,
    screenOffsetXY: fieldSize.$screenOffsetXY,
    cellSize: fieldSize.$cellSize,
    currentPalette: palette.$currentPalette,
  },
  clock: screen.onPointerClick,
  fn: ({ faunaData, screenOffsetXY, cellSize: { size }, currentPalette }, coords) => {
    if (currentPalette) {
      currentPalette.cells.forEach(([x, y]) => {
        const faunaX = Math.floor((coords.x - screenOffsetXY.x) / size) + x;
        const faunaY = Math.floor((coords.y - screenOffsetXY.y) / size) + y;

        faunaData.ref.toggleCell(faunaX, faunaY);
      });
    } else {
      const faunaX = Math.floor((coords.x - screenOffsetXY.x) / size);
      const faunaY = Math.floor((coords.y - screenOffsetXY.y) / size);

      faunaData.ref.toggleCell(faunaX, faunaY);
    }

    return { ref: faunaData.ref };
  },
  target: $faunaData,
});

sample({
  source: $faunaData,
  clock: progress.getGeneration,
  filter: progress.$isWW.map((it) => !it),
  fn: (faunaData) => {
    faunaData.ref.nextGen();
    return faunaData.ref;
  },
  target: progress.calculated,
});
