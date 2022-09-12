import { createEvent, createStore } from 'effector';

export const $exported = createStore('');

export const exportClicked = createEvent<any>();
