import { ColRow, Fauna, FaunaInc, Size, XY } from "./types";
import { getRectOfFauna, rleToFauna } from "./importExport/utils";
import { FaunaData } from "./model/field";
import { None } from "@sniptt/monads";

export function objEntries<T extends string, R>(obj: Record<T, R>): Array<[T, R]> {
  return Object.entries(obj) as Array<[T, R]>;
}

export function newMakeGo(input: Fauna): {
  fauna: Fauna;
  time: number;
  size: Size;
  population: number;
} {
  let start = Date.now();
  let result: Fauna = new Map();
  let faunaInc: FaunaInc = new Map();
  let population = 0;
  let size = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };

  input.forEach((colMap, col) => {
    colMap.forEach((val, row) => {
      incNeighbors(faunaInc, col, row);
    });
  });

  faunaInc.forEach((colMap, col) => {
    let rowMap = new Map();
    colMap.forEach((total, row) => {
      let isLive = (input.get(col) && input.get(col)!.get(row)!) === 1;

      if (!isLive && total === 3) {
        rowMap.set(row, 1);
      } else if (isLive && (total === 2 || total === 3)) {
        rowMap.set(row, 1);
      }
      if (col < size.left) size.left = col;
      if (col > size.right) size.right = col;
      if (row < size.top) size.top = row;
      if (row > size.bottom) size.bottom = row;
    });

    population += rowMap.size;
    result.set(col, rowMap);
  });
  const time = Date.now() - start;

  return { fauna: result, time, population, size };
}

function incNeighbors(faunaInc: FaunaInc, col: number, row: number): FaunaInc {
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
    let val = row.get(coordsArr[1]);
    if (val === undefined) {
      row.set(coordsArr[1], 1);
    } else {
      row.set(coordsArr[1], val + 1);
    }
  });

  return faunaInc;
}

export function getViewPortParams() {
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

export function fuzzy(str: string, query: string): number {
  if (str.includes(query)) return 1;

  for (let i = 0; i < query.length; i++) {
    const index = str.indexOf(query[i], i);
    if (index === -1) {
      return 0;
    }
  }

  return 0.5;
}

function minDistance(str: string, query: string): number {
  let dp = Array(str.length + 1)
    .fill(null)
    .map(() => Array(query.length + 1).fill(0));

  for (let i = 0; i < dp.length; i++) {
    dp[i][0] = i;
  }

  for (let i = 0; i < dp[0].length; i++) {
    dp[0][i] = i;
  }

  for (let i = 1; i < dp.length; i++) {
    for (let j = 1; j < dp[0].length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // left
        dp[i][j - 1] + 1, // right
        dp[i - 1][j - 1] + (str[i - 1] != query[j - 1] ? 1 : 0), // diagonal
      );
    }
  }

  return dp[dp.length - 1][dp[0].length - 1];
}

export function newFaunaDataFromRle(rle: string): FaunaData {
  let emptyFauna: Fauna = new Map();

  return rleToFauna(rle)
    .map(({ fauna, population }) => {
      return { fauna, time: 0, population, size: getRectOfFauna(fauna) };
    })
    .unwrapOr({ fauna: emptyFauna, time: 0, population: 0, size: None });
}
