import {Coords, CoordsStr, Fauna, FaunaInc, Field, FieldCell, SavedFauna} from './types';

function objEntries<T extends string, R>(obj: Record<T, R>): Array<[T, R]> {
  return Object.entries(obj) as Array<[T, R]>;
}

export function newMakeGo(input: Fauna): Fauna {
  let start = Date.now();
  let result: Fauna = new Map();
  let faunaInc: FaunaInc = new Map();

  input.forEach((colMap, col) => {
    colMap.forEach((color, row) => {
      incNeighbors(faunaInc, [col, row], color);
    });
  });
  let aaaa = Date.now();

  faunaInc.forEach((colMap, col) => {
    result.set(col, new Map())
    colMap.forEach(([oneCnt, twoCnt], row) => {
      let cellVal = input.get(col) && input.get(col)!.get(row)! || 0 as const;
      let total = oneCnt + twoCnt;

      if (cellVal === 0 && total == 3) {
        result.get(col)!.set(row, oneCnt > twoCnt ? 1 : 2);
      } else if (cellVal !== 0 && (total === 2 || total === 3)) {
        result.get(col)!.set(row, cellVal);
      }
    });
  });
  console.log(Date.now() - start, [aaaa - start, Date.now() - aaaa]);

  return result;
}

function incNeighbors(faunaInc: FaunaInc, [col, row]: Coords, value: FieldCell): FaunaInc {
  let neighborCoords = [
    [col - 1, row - 1],
    [col - 1, row],
    [col - 1, row + 1],

    [col, row - 1],
    [col, row + 1],

    [col + 1, row - 1],
    [col + 1, row],
    [col + 1, row + 1],
  ];
  if (!faunaInc.has(col - 1)) faunaInc.set(col - 1, new Map());
  if (!faunaInc.has(col)) faunaInc.set(col, new Map());
  if (!faunaInc.has(col + 1)) faunaInc.set(col + 1, new Map());

  neighborCoords.forEach((coordsArr) => {
    const row = faunaInc.get(coordsArr[0])!;
    if (!row.has(coordsArr[1])) {
      row.set(coordsArr[1], [0, 0]);
    }

    if (value === 1) {
      row.get(coordsArr[1])![0]++
    } else {
      row.get(coordsArr[1])![1]++
    }
  });

  return faunaInc;
}

export function getRowColFromEvent(
  ev: { clientY: number; clientX: number; shiftKey: boolean; },
  cellSize: number,
): { col: number; shift: boolean; row: number; } {
  let row = Math.floor(ev.clientY / cellSize);
  let col = Math.floor(ev.clientX / cellSize);

  return { row, col, shift: ev.shiftKey };
}

export function exportToSting(field: Field): string {
  return '';
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

export function saveToLS(history: { fauna: Fauna; name: string; }[]) {
  console.warn('TODO saveToLS');
  return;

  // let res: { fauna: SavedFauna; name: string; }[] = history.map(({ name, fauna }) => {
  //   let savedF: SavedFauna = [...fauna.entries()];
  //   return { fauna: savedF, name };
  // });
  // localStorage.setItem('history', JSON.stringify(res));
}

function coordsStrToNumbers(coords: CoordsStr): [number, number] {
  const [col, row] = coords.split('|');
  return [+col, +row];
}

export function getSavedFromLS(): { fauna: Fauna; name: string; }[] {
  try {
    // @ts-ignore
    let saved: { fauna: SavedFauna; name: string; }[] =
      JSON.parse(localStorage.getItem('history') || 'null') || [];

    let result: { fauna: Fauna; name: string; }[] = saved.map(({ fauna: savedF, name }) => {
      let fauna: Fauna = new Map();
      savedF.forEach(([coords, val]) => {
        const [col, row] = coordsStrToNumbers(coords);
        if (!fauna.has(col)) {
          fauna.set(col, new Map())
        }
        fauna.get(col)!.set(row, val)
      })
      return { fauna, name };
    });

    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function getWindowParams() {
  return {
    width: window.visualViewport.width,
    height: window.visualViewport.height,
  };
}

export function getMiddleOfFauna(fauna: Fauna) {
  let col = 0;
  let row = 0;
  let totalSize = 0;
  if (fauna.size === 0) return { col, row };

  fauna.forEach((colMap, _col) => {
    totalSize += colMap.size;
    colMap.forEach((color, _row) => {
      col += _col;
      row += _row;
    });
  });

  return {
    col: Math.round(col / totalSize),
    row: Math.round(row / totalSize),
  };
}

/*
 *    .OO..
 *    O..O.
 *    .O..O
 *    ..OO.
 */
export function makeFaunaFromLexicon(input: string): Fauna {
  console.warn('TODO makeFaunaFromLexicon');
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
            res.set(x, new Map())
          }
          res.get(x)!.set(y, 1)
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
