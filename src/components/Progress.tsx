import { progress } from "../model/field";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";
import { Show } from "solid-js";

export function Progress() {
  let [isRunning, currentStep] = useUnit([progress.$isRunning, progress.$currentStep]);

  return (
    <p class={css.whiteBox} style={{ display: "flex", gap: "4px", position: "absolute" }}>
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
      {`steps: ${currentStep()}`}
    </p>
  );
}
