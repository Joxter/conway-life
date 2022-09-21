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

export function createMoveCoords(
  $hoveredCell: Store<{ col: number; row: number; shift: boolean; }>,
  $focus: Store<{ col: number; row: number; }>,
) {
  const $moveCoords = createStore<
    {
      initFocus: { col: number; row: number; } | null;
      initHovered: { col: number; row: number; } | null;
      currentHovered: { col: number; row: number; } | null;
    }
  >({ initFocus: null, initHovered: null, currentHovered: null });

  const onMDown = createEvent<any>();
  const onMMove = createEvent<any>();
  const onMUp = createEvent<any>();

  document.addEventListener('mousedown', onMDown);
  document.addEventListener('mousemove', onMMove);
  document.addEventListener('mouseup', onMUp);

  $moveCoords.reset(onMUp);

  sample({
    source: { focus: $focus, hovered: $hoveredCell, coords: $moveCoords },
    clock: onMDown,
    fn: ({ focus, coords, hovered }) => {
      return { ...coords, initFocus: focus, initHovered: hovered };
    },
    target: $moveCoords,
  });

  sample({
    source: { hovered: $hoveredCell, coords: $moveCoords },
    clock: onMMove,
    filter: $moveCoords.map((it) => !!it.initFocus),
    fn: ({ hovered, coords }) => {
      return { ...coords, currentHovered: { ...hovered } };
    },
    target: $moveCoords,
  });

  // $moveCoords.watch(data => console.log(JSON.stringify(data)))

  return { $moveCoords };
}
