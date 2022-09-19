import { createEvent, createStore } from 'effector';
import { cellSizes, initCellSize } from '../types';
import { getWindowParams } from '../utils';

const vp = getWindowParams();

export function createFieldSize() {
  const $options = createStore(cellSizes);
  const $cellSize = createStore(initCellSize);
  const $fieldSize = $cellSize.map((size) => {
    return { height: Math.ceil(vp.height / size), width: Math.ceil(vp.width / size) };
  });
  const cellSizeChanged = createEvent<number>();
  $cellSize.on(cellSizeChanged, (_, val) => val);

  const fieldSize = { $options, $cellSize, $fieldSize, cellSizeChanged };
  return fieldSize;
}
