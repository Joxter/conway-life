import { createEvent, createStore, sample, Store } from 'effector';
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

export function createELsaMode() {
  const $isOn = createStore(false);
  const changed = createEvent<boolean>();

  $isOn.on(changed, (_, val) => val);
  const elsaMode = { $isOn, changed };
  return elsaMode;
}

export function createDragTool(
  $hoveredCell: Store<{ col: number; row: number; shift: boolean; }>,
  $focus: Store<{ col: number; row: number; }>,
) {
  const $initFocus = createStore<{ col: number; row: number; } | null>(null);
  const $initHovered = createStore<{ col: number; row: number; } | null>(null);

  const onMDown = createEvent<any>();
  const onMMove = createEvent<any>();
  const onMUp = createEvent<any>();
  const focusMoved = createEvent<{ col: number; row: number; }>();

  function initEvents() {
    document.addEventListener('mousedown', onMDown);
    document.addEventListener('mousemove', onMMove);
    document.addEventListener('mouseup', onMUp);
  }

  sample({ source: $focus, clock: onMDown, target: $initFocus });
  sample({ source: $hoveredCell, clock: onMDown, target: $initHovered });

  sample({
    source: {
      currentHovered: $hoveredCell,
      initFocus: $initFocus,
      initHovered: $initHovered,
    },
    clock: onMMove,
    filter: (stores) => !!stores.initHovered && !!stores.initFocus && !!stores.currentHovered,
    fn: ({ currentHovered, initHovered, initFocus }) => {
      return {
        col: initFocus!.col + (currentHovered!.col - initHovered!.col),
        row: initFocus!.row + (currentHovered!.row - initHovered!.row),
      };
    },
    target: focusMoved,
  });

  $initFocus.reset(onMUp);
  $initHovered.reset(onMUp);

  return { focusMoved, initEvents };
}
