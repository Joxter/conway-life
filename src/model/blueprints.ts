import { createStore } from 'effector';
import { Fauna } from '../types';
import { makeFaunaFromLexicon } from '../utils';

export function createBlueprints() {
  const lexions = [
    `.OOO
OOO.
.O..`,
    `.......OOO.......
.......O.........
OOO......O.......
O......O.O.......
.O....OO.OOOO....
...OOOO.OOOOO.OO.
....OO.......OO.O`,
  ];
  // const currentBp = createStore<Fauna | null>(makeFaunaFromLexicon(lexions[1]));
  const currentBp = createStore<Fauna | null>(null);

  return { currentBp };
}
