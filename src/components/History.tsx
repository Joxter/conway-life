import {
  $history,
  historySelected,
  removeClicked,
  restoreClicked,
  saveClicked,
} from "../model/history";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";
import { For } from "solid-js";

export function History() {
  let [history] = useUnit([$history]);

  return (
    <div class={css.history}>
      <p style={{ margin: "0" }}>History: </p>
      <button style={{ "margin-right": "20px" }} onClick={saveClicked}>
        Save
      </button>

      <For each={history()}>
        {(historyEl) => {
          return (
            <div>
              <button
                onClick={() => {
                  if (historyEl.removed) {
                    restoreClicked(historyEl.name);
                  } else {
                    historySelected(historyEl.name);
                  }
                }}
              >
                {historyEl.removed ? `restore ${historyEl.name}` : historyEl.name}
              </button>
              {historyEl.removed ? null : (
                <button
                  onClick={() => {
                    removeClicked(historyEl.name);
                  }}
                >
                  x
                </button>
              )}
            </div>
          );
        }}
      </For>
    </div>
  );
}
