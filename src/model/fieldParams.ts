import { createEvent, createStore, Store } from "effector";
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

  // amount of fauna's cols and rows on the screen
  const $fieldSize = $cellSize.map(({ size }) => {
    return {
      height: Math.ceil(vp.height / size),
      width: Math.ceil(vp.width / size),
    };
  });

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

  const fieldSize = { options, $cellSize, $fieldSize, plus, minus, $viewPortSize };
  return fieldSize;
}

export function createScreen() {
  const onHover = createEvent<XY>(); // on MOUSE moved without button pressed
  const onPointerDown = createEvent<XY>(); // on MOUSE or FINGER down
  const onPointerUp = createEvent(); // on MOUSE or FINGER up
  const onPointerLeave = createEvent(); // on MOUSE leaves the field
  const onPointerClick = createEvent<XY>(); // on MOUSE or FINGER makes a click without move
  const onDrag = createEvent<{ from: XY; to: XY }>(); // on MOUSE moves with PRESSED button or FINGER moves with TOUCH
  //                           from: where mouse/finger was pressed, to: where mouse/finger is now

  const $hovered = createStore<XY | null>(null);
  $hovered.on(onHover, (_, xy) => xy).on(onPointerLeave, () => null);

  const $dragDelta = createStore<{ from: XY; to: XY } | null>(null);

  $dragDelta
    //
    .on(onDrag, (_, val) => val)
    .on([onPointerLeave /*, onPointerUp*/], () => null);

  return {
    $hovered,
    $dragDelta,
    onHover,
    onPointerDown,
    // onPointerUp,
    onPointerLeave,
    onDrag,
    onPointerClick,
  };
}
