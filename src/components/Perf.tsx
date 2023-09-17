import { $stats, perf, progress } from "../model/field";
import { PlusMinus } from "./stateless/PlusMinus";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";

export function Perf() {
  const [stepsPerSec, time, fps] = useUnit([perf.$stepsPerSec, perf.$time, perf.$fps]);
  const [stats, expectedStepsPerSec] = useUnit([$stats, progress.$expectedStepsPerSec]);

  return (
    <div
      class={css.whiteBox}
      style={{ position: "absolute", display: "grid", top: "10px", right: "10px" }}
    >
      <span>FPS: {fps()}</span>
      <span>STEPS PER SEC: {stepsPerSec()}</span>
      <span>EXPECTED STEPS:</span>
      <PlusMinus
        value={expectedStepsPerSec()}
        onPlusClicked={progress.incExpectedStepsPerSec}
        onMinusClicked={progress.decExpectedStepsPerSec}
        range={progress.speedRange}
      />
      <span>CALC TIME: {time()} msec</span>
      <span>CELLS: {stats().faunaCellsAmount}</span>
      <span>CELLS ON SCREEN: {stats().fieldCellsAmount}</span>
    </div>
  );
}
