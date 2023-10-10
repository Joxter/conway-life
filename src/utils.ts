import { ColRow, Size, XY } from "./types";
import { rleToFauna } from "./importExport/utils";
import { IFauna } from "./lifes/interface";
import { MyFauna } from "./lifes/myFauna";

export function objEntries<T extends string, R>(obj: Record<T, R>): Array<[T, R]> {
  return Object.entries(obj) as Array<[T, R]>;
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

export function getMiddleOfFauna(fauna: IFauna) {
  let col = 0;
  let row = 0;
  if (fauna.getPopulation() === 0) return { col, row };

  fauna.getCells().forEach(([_col, _row]) => {
    col += _col;
    row += _row;
  });

  return {
    col: Math.round(col / fauna.getPopulation()),
    row: Math.round(row / fauna.getPopulation()),
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

export function newFaunaDataFromRle(rle: string): IFauna {
  return rleToFauna(rle).unwrapOr(new MyFauna());
}

export function getParamsFromSize({ right, top, left, bottom }: Size): [number, number] {
  let width = right - left + 1;
  let height = bottom - top + 1;
  return [width, height];
}
