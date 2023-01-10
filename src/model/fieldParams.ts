import { createEvent, createStore, sample, split, Store } from 'effector';
import { throttle } from 'patronum';
import { cellSizes, ColRow, initCellSize } from '../types';
import { getRowColFromEvent, getWindowParams } from '../utils';

const vp = getWindowParams();

export function createFieldSize() {
  const options = cellSizes;
  const $cellSize = createStore(initCellSize);
  const $fieldSize = $cellSize.map((size, _prev: any) => {
    return {
      height: Math.ceil(vp.height / size),
      width: Math.ceil(vp.width / size),
      prevHeight: _prev && _prev.height as number,
      prevWidth: _prev && _prev.width as number,
    };
  });

  const scrolled = createEvent<number>();
  const plus = createEvent();
  const minus = createEvent();

  let throttledScroll = throttle({ source: scrolled, timeout: 100 });

  let [min, max] = cellSizes;
  document.addEventListener('scroll', () => {
    let ratio = window.scrollY / (4000 - window.innerHeight);
    let newScale = Math.floor(min + (max - min) * ratio);
    scrolled(newScale);
  });

  $cellSize
    .on(throttledScroll, (size, newSize) => {
      return newSize;
    })
    .on(minus, (size) => {
      let newSize = size - 1;
      return Math.max(cellSizes[0], newSize);
    })
    .on(plus, (size) => size + 1);

  const fieldSize = { options, $cellSize, $fieldSize, plus, minus };
  return fieldSize;
}

export function createELsaMode() {
  const $isOn = createStore(false);
  const changed = createEvent<boolean>();

  $isOn.on(changed, (_, val) => val);
  const elsaMode = { $isOn, changed };
  return elsaMode;
}

export function createHoveredCell($cellSize: Store<number>) {
  const fieldMouseMoved = createEvent<any>();
  const fieldMouseLeaved = createEvent<any>();

  // todo add abs and relative ColRow here
  const $cell = createStore<ColRow | null>(null, {
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

  $cell.on(fieldMouseLeaved, () => null);

  sample({
    source: $cellSize,
    clock: fieldMouseMoved,
    fn: (size, evData) => {
      return getRowColFromEvent(evData, size);
    },
    target: $cell,
  });

  const hoveredCell = { $cell, fieldMouseLeaved, fieldMouseMoved };

  return hoveredCell;
}

export function createDragTool(
  $hoveredCell: Store<ColRow | null>,
  $focus: Store<ColRow>,
) {
  type ColRow = { col: number; row: number; };

  const $initFocus = createStore<ColRow | null>(null);
  const $initHovered = createStore<ColRow | null>(null);
  const $startTime = createStore<number | null>(null);

  const onMDown = createEvent<any>();
  const onMUp = createEvent<any>();

  const mouseEnd = createEvent<{ start: ColRow; finish: ColRow; duration: number; }>();
  const clicked = createEvent<{ start: ColRow; finish: ColRow; duration: number; }>();
  const dragEnd = createEvent<{ start: ColRow; finish: ColRow; duration: number; }>();

  const focusMoved = createEvent<{ col: number; row: number; }>();

  function initEvents() {
    document.addEventListener('mousedown', onMDown);
    document.addEventListener('mouseup', onMUp);
  }

  const $isHovered = $hoveredCell.map((it) => it !== null);
  const $isNotHovered = $hoveredCell.map((it) => it == null);

  $startTime.on(onMDown, () => Date.now());

  sample({ source: $focus, clock: onMDown, filter: $isHovered, target: $initFocus });
  sample({ source: $hoveredCell, clock: onMDown, filter: $isHovered, target: $initHovered });

  sample({
    source: {
      currentHovered: $hoveredCell,
      initHovered: $initHovered,
      startTime: $startTime,
    },
    clock: onMUp,
    filter: (stores) => !!stores.initHovered && !!stores.currentHovered && !!stores.startTime,
    fn: ({ currentHovered, initHovered, startTime }) => {
      return {
        start: { col: currentHovered!.col, row: currentHovered!.row },
        finish: initHovered!,
        duration: Date.now() - startTime!,
      };
    },
    target: mouseEnd,
  });

  sample({
    source: {
      currentHovered: $hoveredCell,
      initFocus: $initFocus,
      initHovered: $initHovered,
    },
    clock: $hoveredCell,
    filter: (stores) => !!stores.initHovered && !!stores.initFocus && !!stores.currentHovered,
    fn: ({ currentHovered, initHovered, initFocus }) => {
      return {
        col: initFocus!.col + (currentHovered!.col - initHovered!.col),
        row: initFocus!.row + (currentHovered!.row - initHovered!.row),
      };
    },
    target: focusMoved,
  });

  split({
    source: mouseEnd,
    match: (ev) => {
      return ev.start.col === ev.finish.col && ev.start.row === ev.finish.row ? 'click' : 'dragEnd';
    },
    cases: {
      click: clicked,
      dragEnd: dragEnd,
    },
  });

  $initFocus.reset(mouseEnd, $isNotHovered);
  $initHovered.reset(mouseEnd, $isNotHovered);
  $startTime.reset(mouseEnd, $isNotHovered);

  return { focusMoved, initEvents, clicked };
}

export function createCursor() {
  // todo Every events for mouse/touch should be here (not in the dragTool or hoverCell)
  //   move without pressed
  //   move with pressed
  //   clicked
  //   left cursor
}
