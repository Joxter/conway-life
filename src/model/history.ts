import { createEffect, createEvent, createStore, sample } from 'effector';
import { Field } from '../types';
import { getSavedFromLS, saveToLS } from '../utils';

export const $history = createStore<{ field: Field; name: string; }[]>(getSavedFromLS() || []);

export const addToHistory = createEvent<Field>();
export const removeFromHistory = createEvent<string>();
export const historySelected = createEvent<string>();

$history
  .on(addToHistory, (state, newField) => {
    return [...state, { field: newField, name: `save #${state.length}` }];
  })
  .on(removeFromHistory, (state, name) => {
    return state.filter((it) => it.name !== name);
  });

sample({
  source: $history,
  target: createEffect<{ field: Field; name: string; }[], any, any>((field) => {
    saveToLS(field);
  }),
});
