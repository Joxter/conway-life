import { CoordsStr, Fauna, FaunaInc, Field, FieldCell, initCellSize } from './types';

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
    if (cellVal && (oneCnt + twoCnt) < 2) { // If live and <2 live neighbors
    } else if (cellVal && (oneCnt + twoCnt) > 3) { // If live and >3 live neighbors
    } else if (!cellVal && (oneCnt + twoCnt) == 3) { // If dead and 3 live neighbors
      result.set(coords, oneCnt > twoCnt ? 1 : 2);
    } else {
      if (cellVal) {
        result.set(coords, cellVal);
      }
    }
  });

  return result;
}

function incNeighbors(faunaInc: FaunaInc, coords: CoordsStr, value: FieldCell): FaunaInc {
  const [x, y] = coordsStrToNumbers(coords);

  let neighborCoords: CoordsStr[] = [
    `${x - 1}|${y - 1}`,
    `${x - 1}|${y}`,
    `${x - 1}|${y + 1}`,

    `${x}|${y - 1}`,
    `${x}|${y + 1}`,

    `${x + 1}|${y - 1}`,
    `${x + 1}|${y}`,
    `${x + 1}|${y + 1}`,
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
  const coordsXY = coords.split('|');
  return [+coordsXY[0], +coordsXY[1]];
}

export function numbersToCoords([x, y]: [number, number]): CoordsStr {
  return `${x}|${y}`;
}

export function getRowColFromEvent(
  ev: { clientY: number; clientX: number; shiftKey: boolean; },
  cellSize: number,
): { col: number; shift: boolean; x: number; y: number; row: number } {
  let row = Math.floor(ev.clientY / cellSize);
  let col = Math.floor(ev.clientX / cellSize);

  return {
    row,
    col,
    y: row * cellSize,
    x: col * cellSize,
    shift: ev.shiftKey,
  };
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

export function saveToLS(history: { field: Field; name: string; }[]) {
  // localStorage.setItem('history', JSON.stringify(history));
}

export function getSavedFromLS(): { field: Field; name: string; }[] | null {
  try {
    // @ts-ignore
    return JSON.parse(localStorage.getItem('history') || null) || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function getWindowParams() {
  return {
    width: window.visualViewport.width,
    height: window.visualViewport.height,
  };
}
