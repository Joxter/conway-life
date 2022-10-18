import { CoordsStr, Fauna, FaunaInc, Field, FieldCell, initCellSize, SavedFauna } from './types';

function objEntries<T extends string, R>(obj: Record<T, R>): Array<[T, R]> {
  return Object.entries(obj) as Array<[T, R]>;
}

export function newMakeGo(input: Fauna): Fauna {
  let result: Fauna = new Map();
  let faunaInc: FaunaInc = new Map();

  input.forEach((color, coords) => {
    incNeighbors(faunaInc, coords, color);
  });

  faunaInc.forEach(([oneCnt, twoCnt], coords) => {
    let cellVal = input.get(coords) || 0 as const;
    let total = oneCnt + twoCnt;

    if (!cellVal && total == 3) {
      result.set(coords, oneCnt > twoCnt ? 1 : 2);
    } else if (cellVal && !(total < 2 || total > 3)) {
      result.set(coords, cellVal);
    }
  });

  return result;
}

function incNeighbors(faunaInc: FaunaInc, coords: CoordsStr, value: FieldCell): FaunaInc {
  const [col, row] = coordsStrToNumbers(coords);

  let neighborCoords: CoordsStr[] = [
    `${col - 1}|${row - 1}`,
    `${col - 1}|${row}`,
    `${col - 1}|${row + 1}`,

    `${col}|${row - 1}`,
    `${col}|${row + 1}`,

    `${col + 1}|${row - 1}`,
    `${col + 1}|${row}`,
    `${col + 1}|${row + 1}`,
  ];

  neighborCoords.forEach((neibs) => {
    if (!faunaInc.has(neibs)) {
      faunaInc.set(neibs, [0, 0]);
    }
    let [cnt1, cnt2] = faunaInc.get(neibs)!;

    if (value === 1) {
      faunaInc.set(neibs, [cnt1 + 1, cnt2]);
    } else {
      faunaInc.set(neibs, [cnt1, cnt2 + 1]);
    }
  });

  return faunaInc;
}

export function coordsStrToNumbers(coords: CoordsStr): [number, number] {
  const [col, row] = coords.split('|');
  return [+col, +row];
}

export function numbersToCoords([col, row]: [number, number]): CoordsStr {
  return `${col}|${row}`;
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
  let res: { fauna: SavedFauna; name: string; }[] = history.map(({ name, fauna }) => {
    let savedF: SavedFauna = [...fauna.entries()];
    return { fauna: savedF, name };
  });
  localStorage.setItem('history', JSON.stringify(res));
}

export function getSavedFromLS(): { fauna: Fauna; name: string; }[] {
  try {
    // @ts-ignore
    let saved: { fauna: SavedFauna; name: string; }[] =
      JSON.parse(localStorage.getItem('history') || 'null') || [];

    let result: { fauna: Fauna; name: string; }[] = saved.map(({ fauna: savedF, name }) => {
      let fauna: Fauna = new Map(savedF);
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
  if (fauna.size === 0) return { col, row };

  fauna.forEach((_, coords) => {
    const [_col, _row] = coordsStrToNumbers(coords);
    col += _col;
    row += _row;
  });

  return {
    col: Math.round(col / fauna.size),
    row: Math.round(row / fauna.size),
  };
}

/*
 *    .OO..
 *    O..O.
 *    .O..O
 *    ..OO.
 */
export function makeFaunaFromLexicon(input: string): Fauna {
  let result: Fauna = new Map();

  input.split('\n').forEach((line, rowI) => {
    line = line.trim();

    for (let colI = 0; colI < line.length; colI++) {
      if (line[colI] === 'O') {
        result.set(numbersToCoords([colI, rowI]), 1);
      }
    }
  });

  return result;
}

export function rleToFauna(rle: string): Fauna {
  let res: Fauna = new Map();

  const dead = 'b';
  const live = 'o';
  const lineEnd = '$';

  let parsedNum = '';
  let y = 0;
  let x = 0;
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  for (let i = 0; i < rle.length; i++) {
    let char = rle[i];
    if (numbers.includes(char)) {
      parsedNum += char;
    } else {
      let parsedNum2 = +parsedNum || 1;

      if (char === dead) {
        x += parsedNum2;
      } else if (char === live) {
        for (let j = 0; j < parsedNum2; j++) {
          res.set(numbersToCoords([x, y]), 1);
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
