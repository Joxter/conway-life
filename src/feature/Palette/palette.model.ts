import { createEvent, createStore, sample } from "effector";
import { rleToFauna } from "../../importExport/utils";
import { Coords } from "../../types";

const rles = {
  "glider.rle": "bob$2bo$3o!",
  "hwss.rle": "3b2o2b$bo4bo$o6b$o5bo$6o!",
} as const;

type PaletteNames = keyof typeof rles;

export function createPalette() {
  let $items = createStore<PaletteNames[]>(Object.keys(rles) as any);
  let $currentPalette = createStore<{
    cells: Coords[];
    name: PaletteNames;
    width: number;
    height: number;
  } | null>(null);

  let selectPattern = createEvent<PaletteNames | null>();

  sample({
    clock: selectPattern,
    fn: (name) => {
      if (name && rles[name]) {
        let f = rleToFauna(rles[name]).unwrap();

        return {
          cells: f.getCells(),
          name: name,
          width: f.getBounds()!.right + 1,
          height: f.getBounds()!.bottom + 1,
        };
      } else {
        return null;
      }
    },
    target: $currentPalette,
  });

  return { $items, $currentPalette, selectPattern };
}
