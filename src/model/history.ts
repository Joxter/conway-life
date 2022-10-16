import { combine, createEffect, createEvent, createStore, sample } from 'effector';
import { Fauna } from '../types';
import { getSavedFromLS, saveToLS } from '../utils';

export const $history = createStore<{ fauna: Fauna; name: string; }[]>(getSavedFromLS() || []);

export const $itemsToRemove = createStore<Set<string>>(new Set());

export const addToHistory = createEvent<Fauna>();
export const removeClicked = createEvent<string>();
export const restoreClicked = createEvent<string>();
const removeFromHistory = createEvent<string[]>();
export const historySelected = createEvent<string>();
export const saveClicked = createEvent<any>();

$itemsToRemove
  .on(removeClicked, (set, itemName) => {
    let newSet = new Set(set);
    newSet.add(itemName);
    return newSet;
  }).on(restoreClicked, (set, itemName) => {
    let newSet = new Set(set);
    newSet.delete(itemName);
    return newSet;
  });

$history
  .on(addToHistory, (state, fauna) => {
    let lastName = state[state.length - 1]?.name || '0';
    let match = lastName.match(/(\d+)/);
    let lastId = match && +match[1] || 0;

    return [...state, { fauna, name: `save #${lastId + 1}` }];
  })
  .on(removeFromHistory, (state, names) => {
    return state.filter((it) => !names.includes(it.name));
  });

sample({
  source: $history,
  target: createEffect<{ fauna: Fauna; name: string; }[], any, any>((field) => {
    saveToLS(field);
  }),
});

window.addEventListener('beforeunload', () => {
  // todo rewrite
  removeFromHistory([...$itemsToRemove.getState()]);
});

export const $historyView = combine($history, $itemsToRemove, (history, itemsToRemove) => {
  return history.map((it) => {
    return { ...it, toRemove: itemsToRemove.has(it.name) };
  });
});
