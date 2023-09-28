import { $centerScreenColRow, $faunaData, $hoveredCellColRow, $stats, perf } from "../model/field";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";
import { getParamsFromSize } from "../utils";

export function Perf() {
  const [time, fps] = useUnit([perf.$time, perf.$fps]);
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
    if (!size) return "unknown";

    let [width, height] = getParamsFromSize(size);
    return `w${width} h${height}`;
  }

  return (
    <>
      <p class={css.perf}>
        <span>FPS: {fps()}</span>
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
