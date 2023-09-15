import { CoordsStr, Fauna, Field, SavedFauna } from "../types";

export function exportToSting(field: Field): string {
  return "";
  /*
  let firstLive: number | null = null;
  let lastLive: number | null = null;

  const squash = field.map((row, i) => {
    const notDead = row.includes(1) || row.includes(2);
    if (firstLive === null && notDead) firstLive = i;
    if (notDead) lastLive = i;

    return row.map((it) => +it).join('');
  });

  if (firstLive === null || lastLive === null) {
    return '';
  }

  return squash.slice(firstLive, lastLive + 1).join('\n');
  */
}

export function saveToLS(history: { fauna: Fauna; name: string }[]) {
  console.warn("TODO saveToLS");
  return;

  // let res: { fauna: SavedFauna; name: string; }[] = history.map(({ name, fauna }) => {
  //   let savedF: SavedFauna = [...fauna.entries()];
  //   return { fauna: savedF, name };
  // });
  // localStorage.setItem('history', JSON.stringify(res));
}

function coordsStrToNumbers(coords: CoordsStr): [number, number] {
  const [col, row] = coords.split("|");
  return [+col, +row];
}

export function getSavedFromLS(): { fauna: Fauna; name: string }[] {
  try {
    // @ts-ignore
    let saved: { fauna: SavedFauna; name: string }[] =
      JSON.parse(localStorage.getItem("history") || "null") || [];

    let result: { fauna: Fauna; name: string }[] = saved.map(({ fauna: savedF, name }) => {
      let fauna: Fauna = new Map();
      savedF.forEach(([coords, val]) => {
        const [col, row] = coordsStrToNumbers(coords);
        if (!fauna.has(col)) {
          fauna.set(col, new Map());
        }
        fauna.get(col)!.set(row, val);
      });
      return { fauna, name };
    });

    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
}

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
const DEAD = 'b';
const LIVE = 'o';

export function faunaToGrid(fauna: Fauna): string {
  let res = '';

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
      res += fauna.get(x)?.get(y) ? '0' : '.';
    }
    res += '\n';
  }

  return res.trim();
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

function sortedEntries<T>(m: Map<number, T>): Array<[T, number]> {
  return Array.from(m.keys())
    .sort((a, b) => {
      return a - b;
    })
    .map((y) => {
      let row = m.get(y)!;
      return [row, y];
    });
}

export function getReactOfFauna(fauna: Fauna): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  let top = 0;
  let bottom = 0;
  let left = 0;
  let right = 0;

  for (let [row, x] of sortedEntries(fauna)) {
    for (let [val, y] of sortedEntries(row)) {
      if (val) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
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

  for (let [row, y] of sortedEntries(fauna)) {
    for (let [val, x] of sortedEntries(row)) {
      grid[x - rect.left][y - rect.top] = 1;
    }
  }

  return squashMultiplyDollarsInString(grid.map((row) => squashRowToRle(row)).join('$')) + '!';

  function squashRowToRle(row: (0 | 1)[]): string {
    let res = '';
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
  let res = '';
  let cnt = 0;

  for (let i = 0; i < str.length; i++) {
    let currChar = str[i];

    if (currChar != '$') {
      if (cnt === 1) res += '$';
      if (cnt > 1) res += cnt + '$';
      res += currChar;
      cnt = 0;
    } else {
      cnt++;
    }
  }
  return res;
}
