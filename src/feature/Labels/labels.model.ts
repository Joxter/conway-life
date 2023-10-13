import { createStore } from "effector";

export function createLabels() {
  let $labels = createStore<{ col: number; row: number; label: string }[]>([
    // { col: 0, row: 0, label: "0,0" },
    // { col: 10, row: 10, label: "10,10" },
    // { col: 10, row: -10, label: "10,-10" },
    // { col: -10, row: 10, label: "-10,10" },
    // { col: -10, row: -10, label: "-10,-10" },
    // { col: 10, row: 0, label: "10,0" },
    // { col: 0, row: 10, label: "0,10" },
    // { col: -10, row: 0, label: "-10,0" },
    // { col: 0, row: -10, label: "0,-10" },
  ]);

  return { $labels };
}
