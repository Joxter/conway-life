import { Fauna } from '../types';

/*
*
* see: https://conwaylife.com/wiki/Run_Length_Encoded
*
* */
function parseRle(str:string): {fauna: Fauna, name: string; rule: string; x: number; y: number } {
  return {} as any;
  let state = 'init';

  let i = 0;
  while (i < str.length) {

    i++;
  }
}

export function rleToFauna(rle: string): Fauna {
  let res: Fauna = new Map();

  const dead = 'b';
  const live = 'o';
  const lineEnd = '$';

  let parsedNum = '';
  let y = 0;
  let x = 0;

  for (let i = 0; i < rle.length; i++) {
    let char = rle[i];
    if (char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57) {
      parsedNum += char;
    } else {
      let parsedNum2 = +parsedNum || 1;

      if (char === dead) {
        x += parsedNum2;
      } else if (char === live) {
        for (let j = 0; j < parsedNum2; j++) {
          if (!res.has(x)) {
            res.set(x, new Map());
          }
          res.get(x)!.set(y, 1);
          x++;
        }
      } else if (char === lineEnd) {
        y += parsedNum2;
        x = 0;
      }
      parsedNum = '';
    }
  }

  return res;
}

/*
 *    .OO..
 *    O..O.
 *    .O..O
 *    ..OO.
 */
export function cellsToFauna(input: string): Fauna {
  let result: Fauna = new Map();

  input.split('\n').forEach((line, rowI) => {
    line = line.trim();

    for (let colI = 0; colI < line.length; colI++) {
      if (line[colI] === 'O') {
        if (!result.has(colI)) {
          result.set(colI, new Map());
        }
        result.get(colI)!.set(rowI, 1);
      }
    }
  });

  return result;
}
