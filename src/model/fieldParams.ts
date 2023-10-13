import { combine, createEvent, createStore, sample, Store } from "effector";
import { XY } from "../types";
import { getStrFromLS, getViewPortParams, setStrToLS } from "../utils";

const vp = getViewPortParams();

export function createFieldSize() {
  const lsCellSizeName = "cellSize";
  const options = [1, 50] as const;
  const SCALE = 1.1;

  let initCellSize = +getStrFromLS(lsCellSizeName, "10") || 10;
  const $cellSize = createStore({ size: initCellSize, prevSize: initCellSize });

  const $viewPortSize = createStore({ width: vp.width, height: vp.height });

  const $screenOffsetXY = createStore<XY>({ x: 0, y: 0 });

  const plus = createEvent();
  const minus = createEvent();

  $cellSize
    .on(minus, ({ size }) => {
      let newSize = Math.max(options[0], Math.floor(size / SCALE));

      return { size: newSize, prevSize: size };
    })
    .on(plus, ({ size }) => {
      let newSize = Math.min(options[1], Math.ceil(size * SCALE));

      return { size: newSize, prevSize: size };
    });

  $cellSize.watch((val) => {
    setStrToLS(lsCellSizeName, String(val.size));
  });

  const $centerScreenColRow = combine($cellSize, $screenOffsetXY, ({ size }, screenOffsetXY) => {
    const cellCol = Math.floor((vp.width / 2 - screenOffsetXY.x) / size);
    const cellRow = Math.floor((vp.height / 2 - screenOffsetXY.y) / size);

    return { col: cellCol, row: cellRow };
  });

  return { options, $cellSize, plus, minus, $viewPortSize, $screenOffsetXY, $centerScreenColRow };
}

export function createScreen($screenOffset: Store<XY>) {
  const onHover = createEvent<XY>(); // on MOUSE moved without button pressed
  const onPointerDown = createEvent<XY>(); // on MOUSE or FINGER down
  const onPointerUp = createEvent(); // on MOUSE or FINGER up
  const onPointerLeave = createEvent(); // on MOUSE leaves the field
  const onPointerClick = createEvent<XY>(); // on MOUSE or FINGER makes a click without move
  const onDrag = createEvent<{ from: XY; to: XY }>(); // on MOUSE moves with PRESSED button or FINGER moves with TOUCH
  //                           from: where mouse/finger was pressed, to: where mouse/finger is now
  const screenOffsetMoved = createEvent<XY>();

  const $hovered = createStore<XY | null>(null);
  $hovered.on(onHover, (_, xy) => xy).on(onPointerLeave, () => null);

  const $dragDelta = createStore<{ from: XY; to: XY } | null>(null);

  $dragDelta
    //
    .on(onDrag, (_, val) => val)
    .on([onPointerLeave /*, onPointerUp*/], () => null);

  const $initScreenOffsetXY = createStore<XY>({ x: 0, y: 0 });

  sample({
    source: $screenOffset,
    clock: onPointerDown,
    target: $initScreenOffsetXY,
  });

  sample({
    source: $initScreenOffsetXY,
    clock: onDrag,
    fn: (initFocus, { from, to }) => {
      return {
        x: initFocus.x + to.x - from.x,
        y: initFocus.y + to.y - from.y,
      };
    },
    target: screenOffsetMoved,
  });

  return {
    $hovered,
    $dragDelta,
    onHover,
    onPointerDown,
    // onPointerUp,
    onPointerLeave,
    onDrag,
    onPointerClick,
    screenOffsetMoved,
  };
}
