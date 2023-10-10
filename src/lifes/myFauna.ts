import { IFauna } from "./interface";
import { Coords, Size } from "../types";

type Fauna = Map<number, Set<number>>;
type FaunaInc = Map<number, Map<number, number>>; // todo remove

type SerData = {
  fauna: Fauna;
  time: number;
  size: Size | null;
  population: number;
  generation: number;
};

/**
 * My naive implementation of Game of Life with just Map<number, Set<number>>
 * */
export class MyFauna implements IFauna<SerData> {
  fauna: Fauna;
  time: number;
  size: Size | null;
  population: number;
  generation: number;

  constructor() {
    this.fauna = new Map();
    this.time = 0;
    this.size = null;
    this.population = 0;
    this.generation = 0;
  }

  initNew() {
    this.fauna = new Map();
    this.time = 0;
    this.size = null;
    this.population = 0;
    this.generation = 0;
  }

  toggleCell(x: number, y: number) {
    if (!this.fauna.has(x)) {
      this.fauna.set(x, new Set());
    }
    const xRow = this.fauna.get(x)!;

    if (xRow.has(y)) {
      xRow.delete(y);
      this.population--;
    } else {
      xRow.add(y);
      this.population++;
    }
  }

  setCell(faunaX: number, faunaY: number, live: boolean) {
    if (!this.fauna.has(faunaX)) {
      this.fauna.set(faunaX, new Set());
    }
    const xRow = this.fauna.get(faunaX)!;

    if (xRow.has(faunaY)) {
      this.population--;
    } else {
      this.population++;
    }

    if (live) {
      xRow.add(faunaY);
    } else {
      xRow.delete(faunaY);
    }
  }

  getCells() {
    let field: Coords[] = [];
    this.fauna.forEach((colMap, x) => {
      colMap.forEach((val, y) => {
        field.push([x, y]);
      });
    });

    return field;
  }

  nextGen() {
    let start = Date.now();
    let result: Fauna = new Map();
    let faunaInc: FaunaInc = new Map();
    let population = 0;
    let size = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };

    const input = this.fauna;

    input.forEach((colMap, col) => {
      colMap.forEach((val, row) => {
        incNeighbors(faunaInc, col, row);
      });
    });

    faunaInc.forEach((colMap, col) => {
      let rowSet: Set<number> = new Set();
      colMap.forEach((total, row) => {
        let isLive = input.has(col) && input.get(col)!.has(row);

        if ((!isLive && total === 3) || (isLive && (total === 2 || total === 3))) {
          rowSet.add(row);

          if (col < size.left) size.left = col;
          if (col > size.right) size.right = col;
          if (row < size.top) size.top = row;
          if (row > size.bottom) size.bottom = row;
        }
      });

      if (rowSet.size > 0) {
        population += rowSet.size;
        result.set(col, rowSet);
      }
    });
    const time = Date.now() - start;

    if (population === 0) {
      this.initNew();
    }

    this.fauna = result;
    this.time = time;
    this.size = size;
    this.population = population;
  }

  serialise() {
    return {
      fauna: this.fauna,
      time: this.time,
      size: this.size,
      population: this.population,
      generation: this.generation,
    };
  }

  deserialise(data: SerData) {
    this.fauna = data.fauna;
    this.time = data.time;
    this.size = data.size;
    this.population = data.population;
    this.generation = data.generation;
  }

  getBounds() {
    return this.size;
  }
  getPopulation() {
    return this.population;
  }
  getGeneration() {
    return this.generation;
  }
  getTime() {
    return this.time;
  }
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
