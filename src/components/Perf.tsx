import { $centerScreenColRow, $hoveredCellColRow, $stats, perf } from "../model/field";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";

export function Perf() {
  const [stepsPerSec, time, fps] = useUnit([perf.$stepsPerSec, perf.$time, perf.$fps]);
  const [stats, hovered, centerScreenColRow] = useUnit([
    $stats,
    $hoveredCellColRow,
    $centerScreenColRow,
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

  return (
    <>
      <p class={css.perf}>
        <span>FPS: {fps()}</span>
        <span>gen/sec: {stepsPerSec()}</span>
        <span>calc time {time()} msec</span>
        <span>population: {stats().population}</span>
        <span>cells on screen: {stats().fieldCellsAmount}</span>
        <span>cursor: {hoveredCoords()}</span>
        <span>screen center: {screenCenterCoords()}</span>
      </p>
    </>
  );
}
