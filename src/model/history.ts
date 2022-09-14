import { createEffect, createEvent, createStore, sample } from 'effector';
import { Field } from '../types';
import { getSavedFromLS, saveToLS } from '../utils';

export const $history = createStore<{ field: Field; name: string; }[]>(getSavedFromLS() || []);

export const addToHistory = createEvent<Field>();
export const removeFromHistory = createEvent<string>();
export const historySelected = createEvent<string>();

$history
  // .on(addToHistory, (state, newField) => {
  //   let lastName = state[state.length - 1]?.name || '0';
  //   let match = lastName.match(/(\d+)/);
  //   let lastId = match && +match[1] || 0;
  //
  //   return [...state, { field: newField, name: `save #${lastId + 1}` }];
  // })
  // .on(removeFromHistory, (state, name) => {
  //   return state.filter((it) => it.name !== name);
  // });

sample({
  source: $history,
  target: createEffect<{ field: Field; name: string; }[], any, any>((field) => {
    saveToLS(field);
  }),
});
