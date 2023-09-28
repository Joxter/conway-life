import { Fauna, FaunaInc, Size } from "./types";

export function newMakeGo(input: Fauna): {
  fauna: Fauna;
  time: number;
  size: Size | null;
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

  if (population === 0) {
    return { fauna: result, time, population, size: null };
  }

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
