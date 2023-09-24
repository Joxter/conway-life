import { $centerScreenColRow, $faunaData, $hoveredCellColRow, $stats, perf } from "../model/field";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";

export function Perf() {
  const [stepsPerSec, time, fps] = useUnit([perf.$stepsPerSec, perf.$time, perf.$fps]);
  const [stats, hovered, centerScreenColRow, faunaData] = useUnit([
    $stats,
    $hoveredCellColRow,
    $centerScreenColRow,
    $faunaData,
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
    let { size } = faunaData();

    return size
      .map(({ right, top, left, bottom }) => {
        let width = right - left + 1;
        let height = bottom - top + 1;
        return `w${width} h${height}`;
      })
      .unwrapOr("unknown");
  }

  return (
    <>
      <p class={css.perf}>
        <span>FPS: {fps()}</span>
        <span>gen/sec: {stepsPerSec()}</span>
        <span>calc time {time()} msec</span>
        {/* --- */}
        <span>population: {stats().population}</span>
        <span>size: {getSize()}</span>
        <span>cells on screen: {stats().fieldCellsAmount}</span>
        <span>cursor: {hoveredCoords()}</span>
        <span>screen center: {screenCenterCoords()}</span>
      </p>
    </>
  );
}
