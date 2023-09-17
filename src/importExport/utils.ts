import { Fauna } from "../types";

/*
 *    .OO..
 *    O..O.
 *    .O..O
 *    ..OO.
 */
export function makeFaunaFromLexicon(input: string): Fauna {
  console.warn("TODO makeFaunaFromLexicon");
  return new Map();
  // let result: Fauna = new Map();
  //
  // input.split('\n').forEach((line, rowI) => {
  //   line = line.trim();
  //
  //   for (let colI = 0; colI < line.length; colI++) {
  //     if (line[colI] === 'O') {
  //       result.set(numbersToCoords(colI, rowI), 1);
  //     }
  //   }
  // });
  //
  // return result;
}
const DEAD = "b";
const LIVE = "o";

export function faunaToGrid(fauna: Fauna): string {
  let res = "";

  let maxX = 0;
  let maxY = 0;

  fauna.forEach((row, x) => {
    if (x > maxX) maxX = x;
    row.forEach((val, y) => {
      if (y > maxY) maxY = y;
    });
  });

  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= maxX; x++) {
      res += fauna.get(x)?.get(y) ? "0" : ".";
    }
    res += "\n";
  }

  return res.trim();
}

export function rleToFauna(rle: string): Fauna {
  let res: Fauna = new Map();

  const dead = "b";
  const live = "o";
  const lineEnd = "$";

  let parsedNum = "";
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
      parsedNum = "";
    }
  }

  return res;
}

function sortedEntries<T>(m: Map<number, T>): Array<[number, T]> {
  return Array.from(m.keys())
    .sort((a, b) => {
      return a - b;
    })
    .map((y) => {
      let row = m.get(y)!;
      return [y, row];
    });
}

export function getReactOfFauna(fauna: Fauna): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  let top = Infinity;
  let bottom = -Infinity;
  let left = Infinity;
  let right = -Infinity;

  for (let [x, row] of fauna.entries()) {
    for (let [y, val] of row.entries()) {
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  return { top, bottom, left, right };
}

export function faunaToRle(fauna: Fauna): string {
  let rect = getReactOfFauna(fauna);

  let rectWidth = rect.right - rect.left + 1;
  let rectHeight = rect.bottom - rect.top + 1;

  let grid = Array(rectHeight)
    .fill(0)
    .map(() => {
      return Array(rectWidth).fill(0);
    });

  for (let [x, row] of fauna.entries()) {
    for (let [y, val] of row.entries()) {
      grid[y - rect.top][x - rect.left] = 1;
    }
  }

  let res = squashMultiplyDollarsInString(grid.map((row) => squashRowToRle(row)).join("$")) + "!";

  return res;
  function squashRowToRle(row: (0 | 1)[]): string {
    let res = "";
    let lastVal = row[0];
    let lastValCount = 1;

    for (let i = 1; i < row.length; i++) {
      let currVal = row[i];

      if (lastVal === currVal) {
        lastValCount++;
        continue;
      }
      if (lastValCount > 1) {
        res += lastValCount;
      }
      res += lastVal === 0 ? DEAD : LIVE;

      lastVal = currVal;
      lastValCount = 1;
    }

    if (lastVal === 1) {
      if (lastValCount > 1) {
        res += lastValCount;
      }
      res += LIVE;
    }

    return res;
  }
}

function squashMultiplyDollarsInString(str: string): string {
  let res = "";
  let cnt = 0;

  for (let i = 0; i < str.length; i++) {
    let currChar = str[i];

    if (currChar != "$") {
      if (cnt === 1) res += "$";
      if (cnt > 1) res += cnt + "$";
      res += currChar;
      cnt = 0;
    } else {
      cnt++;
    }
  }
  return res;
}
