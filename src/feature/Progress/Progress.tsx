import { perf, progress, resetFieldPressed } from "../../model/field";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";
import { Show } from "solid-js";
import { PlusMinus } from "../../components/PlusMinus";

export function Progress() {
  let [stepsPerSec, isRunning, currentStep, expectedStepsPerSec] = useUnit([
    perf.$stepsPerSec,
    progress.$isRunning,
    progress.$currentStep,
    progress.$expectedStepsPerSec,
  ]);

  return (
    <div class={css.root}>
      <div class={css.row}>
        {`gen: ${currentStep()} `}
        <span style={{ "padding-left": "64px" }}>{`real speed: ${stepsPerSec()} `}</span>
      </div>
      <div class={css.row}>
        <button class={css.actionBtn} onClick={progress.oneStep}>
          1 step
        </button>
        <Show when={isRunning()}>
          <button
            class={css.actionBtn}
            style={{ color: "#f8f8f8", "background-color": "#de4040" }}
            onClick={progress.stop}
          >
            STOP
          </button>
        </Show>
        <Show when={!isRunning()}>
          <button
            class={css.actionBtn}
            style={{ color: "#f8f8f8", "background-color": "#50c40e" }}
            onClick={progress.start}
          >
            START
          </button>
        </Show>
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
        <div class={css.sep}></div>
        <button class={css.actionBtn} onClick={resetFieldPressed}>
          Reset
        </button>
      </div>
    </div>
  );
}
