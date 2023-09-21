import { $stats, perf, progress } from "../model/field";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";

export function Perf() {
  const [stepsPerSec, time, fps] = useUnit([perf.$stepsPerSec, perf.$time, perf.$fps]);
  const [stats] = useUnit([$stats, progress.$expectedStepsPerSec]);

  return (
    <div
      class={css.whiteBox}
      style={{ position: "absolute", display: "grid", top: "10px", right: "10px" }}
    >
      <span>FPS: {fps()}</span>
      <span>STEPS PER SEC: {stepsPerSec()}</span>
      <span>CALC TIME: {time()} msec</span>
      <span>CELLS: {stats().faunaCellsAmount}</span>
      <span>CELLS ON SCREEN: {stats().fieldCellsAmount}</span>
    </div>
  );
}
