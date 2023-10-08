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
  // TODO abandoned
  let [history] = useUnit([$history]);

  return (
    <div class={css.history}>
      <button onClick={saveClicked}>Save</button>

      <select
        name=""
        id=""
        onChange={(ev) => {
          // if (historyEl.removed) {
          //   restoreClicked(historyEl.name);
          // } else {
          //   historySelected(ev.target);
          // }
          historySelected(ev.target.value);
        }}
      >
        <For each={history()}>
          {(historyEl) => {
            return (
              <option value={historyEl.name}>
                {historyEl.name}
                {/*
                {historyEl.removed ? null : (
                  <button
                    onClick={() => {
                      removeClicked(historyEl.name);
                    }}
                  >
                    x
                  </button>
                )}
*/}
              </option>
            );
          }}
        </For>
      </select>
    </div>
  );
}
