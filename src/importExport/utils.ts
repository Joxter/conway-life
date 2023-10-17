import { Result, Err, Ok } from "@sniptt/monads";
import { Pattern, Size } from "../types";
import { IFauna } from "../lifes/interface";
import { MyFauna } from "../lifes/myFauna";
import { HashlifeAdapter } from "../lifes/hashlifeAdapter";

const DEAD = "b";
const LIVE = "o";

export function faunaToCellsOld(fauna: IFauna): string {
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

export function faunaToCells(fauna: IFauna): string {
  let grid = faunaToGrid(fauna);

  return grid
    .map((row) => {
      if (row.includes(1)) {
        return row.map((c) => (c === 1 ? "X" : ".")).join("");
      } else {
        return "";
      }
    })
    .join("\n");
}

/**
 * .X.
 * ..X
 * XXX
 *
 * to Fauna
 * */
export function cellsToFauna(fauna: IFauna, str: string): IFauna {
  str
    .trim()
    .split("\n")
    .forEach((row, y) => {
      row.split("").forEach((cell, x) => {
        if (cell === "X") {
          fauna.setCell(x, y, true);
        }
      });
    });

  return fauna;
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
): Result<{ pop: number; width: number; height: number }, string> {
  let pop = 0;
  let width = 0;
  let height = 0;

  return parseRle(rle, (x, y) => {
    pop++;
    if (x > width) width = x;
    if (y > height) height = y;
  }).andThen((): Result<{ pop: number; width: number; height: number }, string> => {
    if (width === 0 || height === 0 || pop === 0) return Err("Empty pattern");

    return Ok({ pop, width: width + 1, height: height + 1 });
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

export function fixRleFile(content: string): Result<string, string> {
  // fix size, filter non "b3/s23" rules
  let lines = content.split("\n");

  let result = "";

  let ruleRegexp = /^x\s*=\s*(\d+),\s*y\s*=\s*(\d+),\s*rule\s*=\s*(.+)$/;
  let i = 0;
  let rule = "b3/s23";

  let fineRule = ["b3/s23", "B3/s23", "b3/S23", "B3/S23", "3/23", "23/3"];

  while (i < lines.length) {
    let line = lines[i].trim();
    i++;

    if (line.startsWith("#")) {
      result += line + "\n";
    }

    if (ruleRegexp.test(line)) {
      let match = line.match(ruleRegexp);
      if (match) {
        let [, x, y, _fileRule] = match;
        _fileRule = _fileRule.trim();

        if (!fineRule.includes(_fileRule)) {
          return Err(`Only "${rule}" possible, but got "${_fileRule}"`);
        }
      }
      break;
    }
  }

  let rle = "";
  while (i < lines.length) {
    rle += lines[i].trim();
    i++;
  }

  return rleToPopulationAndSize(rle).map(({ width, height, pop }) => {
    result += POPULATION_RLE_LINE_PREFIX + `${pop}\n`;
    result += `x = ${width}, y = ${height}, rule = ${rule}\n`;
    result += rle;

    return result;
  });
}

const POPULATION_RLE_LINE_PREFIX = "#C population=";

export function parseNormRleFile(rleFile: string, fileName: string): Pattern {
  let lines = rleFile.split("\n");

  let rawName = "";
  let author: string[] = [];
  let wikiLink = "";
  let patternLink = "";
  let comment: string[] = [];
  let rule = "";
  let population = 0;
  let size = [0, 0] as [number, number];

  let ruleRegexp = /^x = (\d+), y = (\d+), rule = (.+)$/;

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith(POPULATION_RLE_LINE_PREFIX)) {
      population = +line.slice(POPULATION_RLE_LINE_PREFIX.length);
    } else if (line.startsWith("#N")) {
      rawName += line.slice(2).trim() + " ";
    } else if (line.startsWith("#O")) {
      author.push(line.slice(2).trim());
    } else if (line.startsWith("#C")) {
      if (line.includes("conwaylife.com/wiki/")) {
        // todo fix case "#C link: conwaylife.com"
        wikiLink = line.slice(2).trim();
      } else if (line.includes("conwaylife.com/patterns/")) {
        // todo fix case "#C link: conwaylife.com"
        patternLink = line.slice(2).trim();
      }
      if (line.slice(2).trim()) {
        comment.push(line.slice(2).trim());
      }
    } else if (line.startsWith("x ")) {
      let match = line.match(ruleRegexp);
      if (match) {
        let [, x, y, _rule] = match;
        size = [+x, +y];
        rule = _rule;
      }
      break;
    }
  }
  let rle = lines[lines.length - 1];

  let pat: Pattern = {
    fileName,
    rawName: rawName.trim(),
    name:
      prettifyName(getFromWikiLink(wikiLink)) || prettifyName(rawName) || prettifyName(fileName),
    author,
    comment,
    population,
    wikiLink,
    patternLink,
    size,
    rule,
    rle,
    type: null,
  };

  return pat;

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
