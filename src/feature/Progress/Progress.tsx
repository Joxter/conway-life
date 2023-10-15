import { progress, resetFieldPressed } from "../../model/field";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";
import { PlusMinus } from "../../components/PlusMinus";

export function Progress() {
  let [isRunning, expectedStepsPerSec] = useUnit([
    progress.$isRunning,
    progress.$expectedStepsPerSec,
  ]);

  return (
    <div class={css.root}>
      <div class={css.row}>
        <div class={css.plusMinus}>
          <PlusMinus
            value={expectedStepsPerSec()}
            onPlusClicked={progress.incExpectedStepsPerSec}
            onMinusClicked={progress.decExpectedStepsPerSec}
            range={progress.speedRange}
          >
            speed
          </PlusMinus>
        </div>
      </div>
      <div class={css.row}>
        <button
          classList={{
            [css.actionBtn]: true,
            [css.disabled]: isRunning(),
          }}
          style={{ color: "#f8f8f8", "background-color": "#50c40e" }}
          onClick={progress.start}
        >
          START
        </button>
        <button
          classList={{
            [css.actionBtn]: true,
            [css.disabled]: !isRunning(),
          }}
          onClick={progress.pause}
        >
          PAUSE
        </button>
        <button
          classList={{
            [css.actionBtn]: true,
            [css.disabled]: !isRunning(),
          }}
          style={{ color: "#f8f8f8", "background-color": "#de4040" }}
          onClick={progress.stop}
        >
          STOP
        </button>
        <button class={css.actionBtn} style={{ "min-width": "auto" }} onClick={progress.oneStep}>
          + 1
        </button>

        <div class={css.sep}></div>
        <button class={css.actionBtn} onClick={resetFieldPressed}>
          Reset
        </button>
      </div>
    </div>
  );
}
