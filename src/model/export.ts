import { createEvent, createStore } from "effector";

export const $exported = createStore("");

export const exportFieldChanged = createEvent<any>();

export const exportClicked = createEvent<any>();
export const importClicked = createEvent<any>();
export const importEx = createEvent<any>(); // todo fix
export const exportEx = createEvent<any>(); // todo fix

$exported.on(exportFieldChanged, (_, val) => val);
