import { None, Option, Result, Some, Err, Ok } from "@sniptt/monads";
import { Fauna, Pattern } from "../types";

/*
 *    .OO..
 *    O..O.
 *    .O..O
 *    ..OO.
 */
export function makeFaunaFromLexicon(input: string): Fauna {
  let result: Fauna = new Map();

  input.split("\n").forEach((line, rowI) => {
    line = line.trim();

    let row = new Map();
    for (let colI = 0; colI < line.length; colI++) {
      if (line[colI] === "O") {
        row.set(colI, 1);
      }
    }
    result.set(rowI, row);
  });

  return result;
}

const DEAD = "b";
const LIVE = "o";

export function faunaToCells(fauna: Fauna): string {
  let grid = faunaToGrid(fauna);

  return grid
    .map((row) => {
      if (row.includes(1)) {
        return row
          .map((c) => (c === 1 ? "O" : "."))
          .join("")
          .replace(/\.+$/, "");
      } else {
        return "";
      }
    })
    .join("\n");
}

export function faunaToGrid(fauna: Fauna): Array<(0 | 1)[]> {
  let optRect = getRectOfFauna(fauna);
  if (optRect.isNone()) {
    return [];
  }
  let rect = optRect.unwrap();

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

  return grid;
}

export function rleToGrid(rleFile: string): Result<boolean[][], string> {
  let { rle, size } = parseRleFile(rleFile);

  let grid: boolean[][] = []; // todo add "size"

  let res = parseRle(rle, (x, y) => {
    if (!grid[y]) {
      grid[y] = [];
    }
    grid[y][x] = true;
  });

  return res.map(() => grid);
}

export function rleToFauna(rleFile: string): Result<Fauna, string> {
  let fauna: Fauna = new Map();

  let { rle } = parseRleFile(rleFile);

  let res = parseRle(rle, (x, y) => {
    if (!fauna.has(x)) {
      fauna.set(x, new Map());
    }
    fauna.get(x)!.set(y, 1);
  });

  return res.map(() => fauna);
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

export function getRectOfFauna(
  fauna: Fauna,
): Option<{ top: number; bottom: number; left: number; right: number }> {
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

  if (
    Number.isFinite(top) &&
    Number.isFinite(bottom) &&
    Number.isFinite(left) &&
    Number.isFinite(right)
  ) {
    return Some({ top, bottom, left, right });
  }
  return None;
}

export function faunaToRle(fauna: Fauna): string {
  let grid = faunaToGrid(fauna);

  return squashMultiplyDollarsInString(grid.map((row) => squashRowToRle(row)).join("$")) + "!";

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
}

/*
..OO
.O.O
O..O.OO
OO.O..O
.O.O
.O..O
..OO
*/
export function cellsToGrid(cells: string): boolean[][] {
  let height = cells.split("\n").length;
  let width = Math.max(...cells.split("\n").map((row) => row.length));

  let grid: boolean[][] = new Array(height).fill(0).map(() => new Array(width).fill(false));

  cells.split("\n").forEach((row, rowI) => {
    row.split("").forEach((c, colI) => {
      if (c === "O") {
        grid[rowI][colI] = true;
      }
    });
  });

  return grid;
}

function parseRleFile(rleFile: string): Pattern {
  let rle = rleFile
    .split("\n")
    .filter((line) => !line.startsWith("#") && !line.startsWith("x ="))
    .join("\n")
    .trim();

  // TODO continue

  return {
    name: "string;",
    comment: "string;",
    author: "string;",
    wikiLink: "string;",
    patternLink: "string;",
    size: [0, 0],
    rule: "B3/S23", // B3/S23
    rle,
  };
}

// https://conwaylife.com/wiki/Run_Length_Encoded
function parseRle(
  content: string,
  setXY: (x: number, y: number) => any, // make optional
): Result<true, string> {
  const dead = "b";
  const live = "o";
  const lineEnd = "$";

  let num = "";
  let y = 0;
  let x = 0;

  for (let i = 0; i < content.length; i++) {
    let char = content[i];
    if (char === "\n" || char === "\r" || char === "!") {
      continue;
    }

    if (char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57) {
      num += char;
    } else {
      let parsedNum = +num || 1;

      if (char === dead) {
        x += parsedNum;
      } else if (char === live) {
        for (let j = 0; j < parsedNum; j++) {
          setXY(x, y);
          // if (!res.has(x)) {
          //   res.set(x, new Map());
          // }
          // res.get(x)!.set(y, 1);
          x++;
        }
      } else if (char === lineEnd) {
        y += parsedNum;
        x = 0;
      } else {
        return Err(`Unknown character: "${char}"`);
      }
      num = "";
    }
  }

  return Ok(true as const);
}
