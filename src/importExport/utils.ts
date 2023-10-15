import { Result, Err, Ok } from "@sniptt/monads";
import { Pattern, Size } from "../types";
import { IFauna } from "../lifes/interface";
import { MyFauna } from "../lifes/myFauna";
import { HashlifeAdapter } from "../lifes/hashlifeAdapter";

const DEAD = "b";
const LIVE = "o";

export function faunaToCells(fauna: IFauna): string {
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

export function faunaToGrid(fauna: IFauna): Array<(0 | 1)[]> {
  let optRect = getRectOfFauna(fauna);
  if (!optRect) {
    return [];
  }
  let rect = optRect;

  let rectWidth = rect.right - rect.left + 1;
  let rectHeight = rect.bottom - rect.top + 1;

  let grid = Array(rectHeight)
    .fill(0)
    .map(() => {
      return Array(rectWidth).fill(0);
    });

  for (let [x, y] of fauna.getCells()) {
    grid[y - rect.top][x - rect.left] = 1;
  }

  return grid;
}

export function rleToFauna(rle: string): Result<IFauna, string> {
  let fauna = new MyFauna();
  let res = parseRle(rle, (x, y) => {
    fauna.setCell(x, y, true);
  });

  return res.map(() => {
    return fauna;
  });
}

export function rleToHashLife(rle: string): Result<IFauna, string> {
  let fauna = new HashlifeAdapter();
  let res = parseRle(rle, (x, y) => {
    fauna.setCell(x, y, true);
  });

  return res.map(() => {
    return fauna;
  });
}

export function rleToPopulationAndSize(
  rle: string,
): Result<{ pop: number; x: number; y: number }, string> {
  let pop = 0;
  let maxX = 0;
  let maxY = 0;

  return parseRle(rle, (x, y) => {
    pop++;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }).map(() => {
    return { pop, x: maxX + 1, y: maxY + 1 };
  });
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

export function getRectOfFauna(fauna: IFauna): Size | null {
  let top = Infinity;
  let bottom = -Infinity;
  let left = Infinity;
  let right = -Infinity;

  for (let [x, y] of fauna.getCells()) {
    if (x < left) left = x;
    if (x > right) right = x;
    if (y < top) top = y;
    if (y > bottom) bottom = y;
  }

  if (
    Number.isFinite(top) &&
    Number.isFinite(bottom) &&
    Number.isFinite(left) &&
    Number.isFinite(right)
  ) {
    return { top, bottom, left, right };
  }

  return null;
}

export function faunaToRle(fauna: IFauna): string {
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

export function parseRleFile(rleFile: string, fileName: string): Pattern {
  // todo add Result<>
  let lines = rleFile.split("\n");

  let rawName = "";
  let author = "";
  let wikiLink = "";
  let patternLink = "";
  let comment = "";
  let rle = "";
  let rule = "";
  let size: [number, number] = [0, 0];

  let rleLineFound = false;

  lines.forEach((line) => {
    line = line.trim();
    if (rleLineFound) {
      rle += line;
      return;
    }

    if (line.startsWith("#N")) {
      rawName += line.slice(2).trim() + " ";
    } else if (line.startsWith("#O")) {
      author += line.slice(2).trim() + "\n";
    } else if (line.startsWith("#C")) {
      if (line.includes("conwaylife.com/wiki/")) {
        wikiLink = line.slice(2).trim();
      } else if (line.includes("conwaylife.com/patterns/")) {
        patternLink = line.slice(2).trim();
      } else {
        comment += line.slice(2).trim() + "\n";
      }
    } else if (line.startsWith("x ")) {
      let regexp = /x\s*=\s*(\d+),\s*y\s*=\s*(\d+),\s*rule\s*=\s*(.+)/;
      let match = line.match(regexp);
      if (match) {
        let [, x, y, _rule] = match;

        size = [+x, +y];
        rule = _rule.toLowerCase();
      }
    } else if (line.match(/^[bo\d!$]+$/)) {
      rle += line;
      rleLineFound = true;
    }
  });
  rawName = rawName.trim();

  let statsFromRle = rleToPopulationAndSize(rle).unwrapOr({ pop: 0, x: size[0], y: size[1] });

  return {
    fileName,
    rawName: rawName.trim(),
    name:
      prettifyName(getFromWikiLink(wikiLink)) || prettifyName(rawName) || prettifyName(fileName),
    author: author.trim(),
    comment: comment.trim(),
    population: statsFromRle.pop,
    wikiLink,
    patternLink,
    size: [statsFromRle.x, statsFromRle.y],
    rule,
    rle,
    type: null,
  };

  function getFromWikiLink(wikiLink: string) {
    // #C www.conwaylife.com/wiki/index.php?title=20P2
    // #C https://conwaylife.com/wiki/Period_3_oscillators
    if (!wikiLink) {
      return "";
    }
    if (wikiLink.includes("title=")) {
      let [_, name] = wikiLink.split("title=");
      return name;
    }
    let [_, name] = wikiLink.split("/wiki/");
    return name;
  }

  function prettifyName(name: string): string {
    return decodeURIComponent(name.replace(/_/g, " ")).replace(".rle", "").trim();
  }
}

// https://conwaylife.com/wiki/Run_Length_Encoded
export function parseRle(
  content: string,
  setXY: (x: number, y: number) => any,
): Result<true, string> {
  const dead = "b";
  const live = "o"; // or any other ???
  const lineEnd = "$";

  let num = "";
  let y = 0;
  let x = 0;

  for (let i = 0; i < content.length; i++) {
    let char = content[i];
    if (char === "\n" || char === "\r") {
      continue;
    }
    if (char === "!") {
      break;
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
