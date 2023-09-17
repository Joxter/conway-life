import { ColRow, Coords, CoordsStr, Fauna, FaunaInc, FieldCell, XY } from "./types";

function objEntries<T extends string, R>(obj: Record<T, R>): Array<[T, R]> {
  return Object.entries(obj) as Array<[T, R]>;
}

export function newMakeGo(input: Fauna): { fauna: Fauna; time: number; size: number } {
  let start = Date.now();
  let result: Fauna = new Map();
  let faunaInc: FaunaInc = new Map();
  let size = 0;

  input.forEach((colMap, col) => {
    colMap.forEach((color, row) => {
      incNeighbors(faunaInc, [col, row], color);
    });
  });

  faunaInc.forEach((colMap, col) => {
    let rowMap = new Map();
    colMap.forEach(([oneCnt, twoCnt], row) => {
      let cellVal = (input.get(col) && input.get(col)!.get(row)!) || (0 as const);
      let total = oneCnt + twoCnt;

      if (cellVal === 0 && total == 3) {
        rowMap.set(row, oneCnt > twoCnt ? 1 : 2);
      } else if (cellVal !== 0 && (total === 2 || total === 3)) {
        rowMap.set(row, cellVal);
      }
    });

    size += rowMap.size;
    result.set(col, rowMap);
  });
  const time = Date.now() - start;

  return { fauna: result, time, size };
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
      row.get(coordsArr[1])![0]++;
    } else {
      row.get(coordsArr[1])![1]++;
    }
  });

  return faunaInc;
}

function coordsStrToNumbers(coords: CoordsStr): [number, number] {
  const [col, row] = coords.split("|");
  return [+col, +row];
}

export function getWindowParams() {
  return {
    width: window.visualViewport?.width || 600,
    height: window.visualViewport?.height || 400,
  };
}

export function adjustOffset(pivotCell: ColRow, pivotXY: XY, sizeNew: number) {
  return {
    x: pivotXY.x - pivotCell.col * sizeNew,
    y: pivotXY.y - pivotCell.row * sizeNew,
  };
}

export function newFauna(colRows: ColRow[]): Fauna {
  let fauna: Fauna = new Map();

  colRows.forEach(({ col, row }) => {
    if (!fauna.has(col)) {
      fauna.set(col, new Map());
    }
    fauna.get(col)!.set(row, 1);
  });

  return fauna;
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

export function getStrFromLS(key: string, fallback: string): string {
  try {
    let val = localStorage.getItem(key);
    return val === null ? fallback : val;
  } catch (e) {
    console.error(e);
    return fallback;
  }
}

export function setStrToLS(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(e);
  }
}
