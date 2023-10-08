import { createEffect, createEvent, createStore, sample } from "effector";
import { Fauna } from "../types";
import { faunaToRle } from "../importExport/utils";

type HistoryItem = {
  rle: string;
  name: string;
  removed: boolean;
};

/** @deprecated */
export const $history = createStore<HistoryItem[]>(getSavedFromLS() || []);

export const addToHistory = createEvent<Fauna>();
export const removeClicked = createEvent<string>();
export const restoreClicked = createEvent<string>();
export const historySelected = createEvent<string>();
export const saveClicked = createEvent<any>();

$history
  .on(addToHistory, (state, fauna) => {
    let uniqId = 0;

    while (!!state.find((it) => it.name === `save #${uniqId}`)) {
      uniqId++;
    }

    return [...state, { rle: faunaToRle(fauna), name: `save #${uniqId}`, removed: false }];
  })
  .on(removeClicked, (state, name) => {
    return state.map((it) => {
      if (it.name === name) {
        return { ...it, removed: true };
      }
      return it;
    });
  })
  .on(restoreClicked, (state, name) => {
    return state.map((it) => {
      if (it.name === name) {
        return { ...it, removed: false };
      }
      return it;
    });
  });

sample({
  source: $history,
  target: createEffect<HistoryItem[], any, any>((items) => {
    saveFaunasToLS("history", items);
  }),
});

export function saveFaunasToLS(name: string, history: HistoryItem[]) {
  let res: { rle: string; name: string }[] = history
    .filter((it) => !it.removed)
    .map(({ name, rle }) => {
      return { rle, name };
    });
  localStorage.setItem(name, JSON.stringify(res));
}

export function getSavedFromLS(): HistoryItem[] {
  try {
    // @ts-ignore
    let saved: { rle: string; name: string }[] =
      JSON.parse(localStorage.getItem("history") || "null") || [];

    let result = saved.map(({ rle, name }) => {
      return { rle, name, removed: false };
    });

    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
}
