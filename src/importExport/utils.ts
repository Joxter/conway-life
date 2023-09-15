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

export function faunaToRle(fauna: Fauna): string {
  // todo FIX
  let res = "";
  let lastY = 0;
  let lastX = 0;
  let lastVal = 0;

  fauna.forEach((row, y) => {
    if (y !== lastY) {
      res += `${y - lastY}$`;
      lastY = y;
      lastX = 0;
    }

    row.forEach((val, x) => {
      if (x !== lastX) {
        if (lastVal > 1) {
          res += lastVal;
        }
        lastVal = 0;
        res += `b${x - lastX}`;
        lastX = x;
      }

      if (val !== lastVal) {
        if (lastVal > 1) {
          res += lastVal;
        }
        lastVal = val;
        res += val === 1 ? "o" : "b";
      }
    });
  });

  if (lastVal > 1) {
    res += lastVal;
  }

  return res;
}
