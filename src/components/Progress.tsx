import { progress } from "../model/field";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";
import { Show } from "solid-js";
import { PlusMinus } from "./PlusMinus";

export function Progress() {
  let [isRunning, currentStep, expectedStepsPerSec] = useUnit([
    progress.$isRunning,
    progress.$currentStep,
    progress.$expectedStepsPerSec,
  ]);

  return (
    <div
      class={css.whiteBox}
      style={{ position: "absolute", width: "300px", bottom: "10px", left: "10px" }}
    >
      <p style={{ display: "flex", gap: "4px" }}>
        <button onClick={progress.oneStep}>Step</button>
        {`timer: `}
        <Show when={isRunning()}>
          <button
            style={{ color: "#f8f8f8", "background-color": "#de4040", border: "0" }}
            onClick={progress.stop}
          >
            STOP
          </button>
        </Show>
        <Show when={!isRunning()}>
          <button
            style={{ color: "#f8f8f8", "background-color": "#50c40e", border: "0" }}
            onClick={progress.start}
          >
            START
          </button>
        </Show>
        {`genaration: ${currentStep()} `}
      </p>
      <p style={{ display: "flex", gap: "4px", "margin-top": '4px' }}>
        {`gen per sec`}
        <PlusMinus
          value={expectedStepsPerSec()}
          onPlusClicked={progress.incExpectedStepsPerSec}
          onMinusClicked={progress.decExpectedStepsPerSec}
          range={progress.speedRange}
        />
      </p>
    </div>
  );
}
