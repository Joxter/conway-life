import { combine, createEvent, createStore, sample, Store } from "effector";
import { XY } from "../types";
import { getStrFromLS, getViewPortParams, setStrToLS } from "../utils";

const vp = getViewPortParams();

function parseCellSize(str: string): [number, number] {
  let fallback: [number, number] = [1, 10];
  if (str.includes(":")) {
    let [cellCnt, cellSize] = str.split(":").map((it) => +it);
    if (!cellCnt) cellCnt = 1;

    if (!cellSize) return fallback;
    return [cellCnt, cellSize];
  }

  let cellSize = +str;
  if (!cellSize) return fallback;

  return [1, cellSize];
}

export function createFieldSize() {
  const lsCellSizeName = "cellSize";
  const SCALE = 1.1;

  let initCellSize = parseCellSize(getStrFromLS(lsCellSizeName, "1:10")) || [1, 10];
  const $cellSize = createStore({ size: initCellSize, prevSize: initCellSize });

  const $viewPortSize = createStore({ width: vp.width, height: vp.height });

  const $screenOffsetXY = createStore<XY>({ x: 0, y: 0 });

  const plus = createEvent();
  const minus = createEvent();

  $cellSize
    .on(minus, ({ size }) => {
      let [cellCnt, cellSize] = size;

      if (cellSize === 1) {
        let newCellCnt = Math.ceil(cellCnt * SCALE);
        return { size: [newCellCnt, 1], prevSize: [newCellCnt, 1] };
      }

      let newSize = Math.max(1, Math.floor(cellSize / SCALE));
      return { size: [1, newSize], prevSize: [1, cellSize] };
    })
    .on(plus, ({ size }) => {
      let [cellCnt, cellSize] = size;

      if (cellCnt > 1) {
        let newCellCnt = Math.floor(cellCnt / SCALE);
        return { size: [newCellCnt, 1], prevSize: [newCellCnt, 1] };
      }

      let newSize = Math.min(50, Math.ceil(cellSize * SCALE));
      return { size: [1, newSize], prevSize: [1, cellSize] };
    });

  $cellSize.watch((val) => {
    setStrToLS(lsCellSizeName, val.size.join(","));
  });

  const $centerScreenColRow = combine($cellSize, $screenOffsetXY, ({ size }, screenOffsetXY) => {
    const cellCol = Math.floor((vp.width / 2 - screenOffsetXY.x) / size[1]);
    const cellRow = Math.floor((vp.height / 2 - screenOffsetXY.y) / size[1]);

    return { col: cellCol, row: cellRow };
  });

  return { $cellSize, plus, minus, $viewPortSize, $screenOffsetXY, $centerScreenColRow };
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
