import { createEvent, createStore, sample, split, Store } from "effector";
import { XY } from "../types";
import { getStrFromLS, getWindowParams, setStrToLS } from "../utils";

const vp = getWindowParams();

export function createFieldSize($isHovered: Store<boolean>) {
  const lsCellSizeName = "cellSize";
  const options = [1, 100] as const;

  let initCellSize = +getStrFromLS(lsCellSizeName, "10") || 10;
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

  $cellSize
    .on(minus, ({ size }) => {
      let newSize = Math.max(options[0], size - 1);
      return {
        size: newSize,
        prevSize: size,
      };
    })
    .on(plus, ({ size }) => {
      let newSize = Math.max(options[0], size + 1);
      return {
        size: newSize,
        prevSize: size,
      };
    });

  $cellSize.watch((val) => {
    setStrToLS(lsCellSizeName, String(val.size));
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
  const fieldMouseLeaved = createEvent();

  // todo add abs and relative ColRow here
  const $hoveredXY = createStore<XY | null>(null);

  $hoveredXY.on(fieldMouseLeaved, () => null).on(fieldMouseMoved, (_, evData) => evData);

  const hoveredCell = { $hoveredXY, fieldMouseLeaved, fieldMouseMoved };

  return hoveredCell;
}

export function createDragTool($hoveredXY: Store<XY | null>, $screenOffsetXY: Store<XY>) {
  const $initFocus = createStore<XY | null>(null);
  const $initHovered = createStore<XY | null>(null);
  const $startTime = createStore<number | null>(null);

  const onMDown = createEvent<XY>();
  const onMUp = createEvent();

  const mouseEnd = createEvent<{ start: XY; finish: XY }>();
  const clicked = createEvent<{ coords: XY }>();
  const clickedRaw = createEvent<{ start: XY; finish: XY }>(); // todo remove and simplify
  const dragEnd = createEvent<{ start: XY; finish: XY }>();

  const focusMoved = createEvent<XY>();

  function initEvents() {
    // todo why not field ????
    // document.addEventListener("mousedown", onMDown);
    // document.addEventListener("touchstart", onMDown);
    // document.addEventListener("mouseup", onMUp);
  }

  sample({
    source: $screenOffsetXY,
    clock: onMDown,
    fn: (s) => {
      return s;
    },
    target: $initFocus,
  });
  sample({ clock: onMDown, target: $initHovered });

  sample({
    source: {
      hoveredXY: $hoveredXY,
      initHovered: $initHovered,
    },
    clock: onMUp,
    fn: ({ hoveredXY, initHovered }) => {
      return {
        start: initHovered!,
        finish: hoveredXY || initHovered!,
      };
    },
    target: mouseEnd,
  });

  sample({
    source: {
      currentHovered: $hoveredXY,
      initFocus: $initFocus,
      initHovered: $initHovered,
    },
    clock: $hoveredXY,
    filter: (stores) => {
      console.log("222", !!stores.initHovered, !!stores.initFocus, !!stores.currentHovered);
      return !!stores.initHovered && !!stores.initFocus && !!stores.currentHovered;
    },
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

  $initFocus.reset(mouseEnd);
  $initHovered.reset(mouseEnd);
  $startTime.reset(mouseEnd);

  return { focusMoved, initEvents, clicked, onMUp, onMDown };
}
