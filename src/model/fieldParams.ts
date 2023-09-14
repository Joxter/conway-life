import { createEvent, createStore, sample, split, Store } from "effector";
import { cellSizes, initCellSize, XY } from "../types";
import { getWindowParams } from "../utils";

const vp = getWindowParams();

export function createFieldSize() {
  const options = cellSizes;
  const $cellSize = createStore({ size: initCellSize, prevSize: initCellSize });

  type FS = {
    height: number;
    width: number;
    prevHeight: number;
    prevWidth: number;
  };

  const $viewPortSize = createStore({ width: vp.width, height: vp.height });

  // @ts-ignore
  const $fieldSize: Store<FS> = $cellSize.map(
    ({ size }, _prev: { width: number; height: number } | undefined): FS => {
      return {
        height: Math.ceil(vp.height / size),
        width: Math.ceil(vp.width / size),
        prevHeight: (_prev && _prev.height) || Math.ceil(vp.height / size),
        prevWidth: (_prev && _prev.width) || Math.ceil(vp.width / size),
      };
    },
  );

  const plus = createEvent();
  const minus = createEvent();

  let threshold = 0;
  document.addEventListener("wheel", (ev) => {
    threshold += ev.deltaY;
    if (threshold > 20) {
      minus();
      threshold = 0;
    }
    if (threshold < -20) {
      plus();
      threshold = 0;
    }
  });

  $cellSize
    .on(minus, ({ size }) => {
      let newSize = Math.max(cellSizes[0], size - 1);
      return {
        size: newSize,
        prevSize: size,
      };
    })
    .on(plus, ({ size }) => {
      let newSize = Math.max(cellSizes[0], size + 1);
      return {
        size: newSize,
        prevSize: size,
      };
    });

  const fieldSize = { options, $cellSize, $fieldSize, plus, minus, $viewPortSize };
  return fieldSize;
}

export function createELsaMode() {
  const $isOn = createStore(false);
  const changed = createEvent<boolean>();

  $isOn.on(changed, (_, val) => val);
  const elsaMode = { $isOn, changed };
  return elsaMode;
}

export function createHoveredCell() {
  const fieldMouseMoved = createEvent<XY>();
  const fieldMouseLeaved = createEvent<any>();

  // todo add abs and relative ColRow here
  const $hoveredXY = createStore<XY | null>(null);

  $hoveredXY.on(fieldMouseLeaved, () => null).on(fieldMouseMoved, (_, evData) => evData);

  const hoveredCell = { $hoveredXY, fieldMouseLeaved, fieldMouseMoved };

  return hoveredCell;
}

export function createDragTool($hoveredCell: Store<XY | null>, $screenOffsetXY: Store<XY>) {
  const $initFocus = createStore<XY | null>(null);
  const $initHovered = createStore<XY | null>(null);
  const $startTime = createStore<number | null>(null);

  const onMDown = createEvent<any>();
  const onMUp = createEvent<any>();

  const mouseEnd = createEvent<{ start: XY; finish: XY }>();
  const clicked = createEvent<{ coords: XY }>();
  const clickedRaw = createEvent<{ start: XY; finish: XY }>(); // todo remove and simplify
  const dragEnd = createEvent<{ start: XY; finish: XY }>();

  const focusMoved = createEvent<XY>();

  function initEvents() {
    document.addEventListener("mousedown", onMDown);
    document.addEventListener("mouseup", onMUp);
  }

  const $isHovered = $hoveredCell.map((it) => it !== null);
  const $isNotHovered = $hoveredCell.map((it) => it == null);

  $startTime.on(onMDown, () => Date.now());

  sample({ source: $screenOffsetXY, clock: onMDown, filter: $isHovered, target: $initFocus });
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
        start: currentHovered!,
        finish: initHovered!,
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
        x: initFocus!.x + (currentHovered!.x - initHovered!.x),
        y: initFocus!.y + (currentHovered!.y - initHovered!.y),
      };
    },
    target: focusMoved,
  });

  split({
    source: mouseEnd,
    match: (ev) => {
      return ev.start.x === ev.finish.x && ev.start.y === ev.finish.y ? "click" : "dragEnd";
    },
    cases: {
      click: clickedRaw,
      dragEnd: dragEnd,
    },
  });

  sample({
    clock: clickedRaw,
    fn: (ev) => {
      return { coords: ev.start };
    },
    target: clicked,
  });

  $initFocus.reset(mouseEnd, $isNotHovered);
  $initHovered.reset(mouseEnd, $isNotHovered);
  $startTime.reset(mouseEnd, $isNotHovered);

  return { focusMoved, initEvents, clicked };
}
