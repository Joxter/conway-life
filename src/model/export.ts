import { createEvent, createStore } from "effector";

export const $exported =
  createStore(`48b2o$48b2o4$27bo$27b3o10bo9b2o$21bo8bo7b3o8b2o$21b3o5b2o6bo11bo4bo$
24bo12b2o11bo3bo$13b2o8b2o18b3o7b2o$13b2o30bo$30b2o$30bobo8bo21b2o$32b
obo6b2obo11b2o5b2o$32bo9b2o11bob2o$15b2o41bo$14b2o$14bo4bo34bo$15bo3bo
8bob2o2b2o9b2o7b3o$8b3o7b2o9b2o2b2obo8bo3bo$10bo34bo4bo$49b2o$6bo41b2o
$6b2obo11b2o9bo$2o5b2o11bob2o6bobo$2o21bo8bobo$33b2o$19bo30b2o$10b2o7b
3o28b2o$10bo3bo11b2o$10bo4bo11bo6b2o$14b2o8b3o7bo$13b2o9bo10b3o$37bo4$
15b2o$15b2o!`);

export const exportFieldChanged = createEvent<any>();

export const exportClicked = createEvent<any>();
export const importClicked = createEvent<any>();
export const importEx = createEvent<any>(); // todo fix
export const exportEx = createEvent<any>(); // todo fix

$exported.on(exportFieldChanged, (_, val) => val);
