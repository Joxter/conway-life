import { createStore } from 'effector';
import { patterns } from '../blueprints/lexicon';
import { Fauna } from '../types';
import { makeFaunaFromLexicon, rleToFauna } from '../utils';

export function createBlueprints() {
  const lexions = [
    `.OOO
OOO.
.O..`,
    `OOO
O..
.O.`,
    `.......OOO.......
.......O.........
OOO......O.......
O......O.O.......
.O....OO.OOOO....
...OOOO.OOOOO.OO.
....OO.......OO.O`,
    `\t.........O.O..................
\t........O..O..................
\t.......OO.....................
\t......O...O...................
\t.....OOO.O....................
\t..OO..........................
\t.O...OOOOO.......OOOO.....O..O
\tO...O............O...O...O....
\tO.....OO.........O.......O...O
\tOOO...OOOO........O..O...OOOO.
\t.O.......O....................
\t.OO...................OO......
\t.O.O..................OO......
\t.OO..OO.O........O.O..OO......
\t..O.OOO.O...O.OOOO.O..OO......
\t.........OO.O.OO..O...OO...OOO
\t....OOOOOO.OO...OOOO..OO...OOO
\t.....O....OOO......O..OO...OOO
\t......OO.....OO..OO...OO......
\t.......O..O.....OOOO..OO......
\t........O.O.OO.....O..OO......
\t......................OO......
\t..............................
\t..................O..O...OOOO.
\t.................O.......O...O
\t.................O...O...O....
\t.................OOOO.....O..O`,
  ];
  // const currentBp = createStore<Fauna | null>(makeFaunaFromLexicon(lexions[3]));
  const currentBp = createStore<Fauna | null>(null);
  // const currentBp = createStore<Fauna | null>(rleToFauna(patterns.Edge_shooter.rle));

  return { currentBp };
}
