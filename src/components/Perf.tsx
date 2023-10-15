import { fieldSize, $faunaData, $field, perf, $viewHoveredCell } from "../model/field";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";
import { throttle } from "patronum";
import { restore } from "effector";

let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

let $slowPop = restore(
  throttle({
    source: $faunaData.map((f) => {
      return {
        pop: f.ref.getPopulation(),
        size: f.ref.getSize(),
        generation: f.ref.getGeneration(),
      };
    }),
    timeout: 1000 / 10, // 10fps
  }),
  { pop: 0, size: [0, 0], generation: 0 },
);

let $cellsOnScreen = restore(
  throttle({
    source: $field.map((f) => f.length),
    timeout: 1000 / 10, // 10fps
  }),
  0,
);

export function Perf() {
  const [time, fps] = useUnit([perf.$time, perf.$fps]);
  const [genPerSec, cellsOnScreen, hovered, centerScreenColRow, faunaStat] = useUnit([
    perf.$stepsPerSec,
    $cellsOnScreen,
    $viewHoveredCell,
    fieldSize.$centerScreenColRow,
    $slowPop,
  ]);

  function hoveredCoords() {
    let coords = hovered();
    if (coords) {
      return `[${coords.col},${coords.row}]`;
    }
    return `[no hovered]`;
  }

  function screenCenterCoords() {
    let { col, row } = centerScreenColRow();
    return `[${col},${row}]`;
  }

  function getSize() {
    let [width, height] = faunaStat().size;
    return `w${width} h${height}`;
  }

  return (
    <div>
      <div
        style={{
          position: "absolute",
          top: "45px",
          left: "10px",
          display: "grid",
          "font-size": "12px",
          "line-height": "1",
        }}
      >
        <span>FPS: {fps()}</span>
        <span>calc time {time()} msec</span>
        <span>generaion/sec {genPerSec()}</span>
      </div>
      <p class={css.perf}>
        <span>generation: {faunaStat().generation}</span>
        <span>
          population: {faunaStat().pop} ({cellsOnScreen()})
        </span>
        <span>{getSize()}</span>
        {!isTouchDevice && <span>cursor: {hoveredCoords()}</span>}
        <span>center: {screenCenterCoords()}</span>
      </p>
    </div>
  );
}
