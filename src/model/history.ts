import { createEffect, createEvent, createStore, sample } from 'effector';
import { Fauna } from '../types';
import { getSavedFromLS, saveToLS } from '../utils';

export const $history = createStore<{ fauna: Fauna; name: string; }[]>(getSavedFromLS() || []);

export const addToHistory = createEvent<Fauna>();
export const removeFromHistory = createEvent<string>();
export const historySelected = createEvent<string>();

$history
  .on(addToHistory, (state, fauna) => {
    let lastName = state[state.length - 1]?.name || '0';
    let match = lastName.match(/(\d+)/);
    let lastId = match && +match[1] || 0;

    return [...state, { fauna, name: `save #${lastId + 1}` }];
  })
  .on(removeFromHistory, (state, name) => {
    return; // todo make safe deleting
    return state.filter((it) => it.name !== name);
  });

sample({
  source: $history,
  target: createEffect<{ fauna: Fauna; name: string; }[], any, any>((field) => {
    saveToLS(field);
  }),
});
