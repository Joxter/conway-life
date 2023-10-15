import { IFauna } from "./interface";
import { Coords, Size } from "../types";

type Fauna = Map<number, Set<number>>;
type FaunaInc = Map<number, Map<number, number>>;

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
  private fauna: Fauna;
  private time: number;
  private bounds: Size | null;
  private population: number;
  private generation: number;
  private cells: Coords[] | null;

  constructor() {
    this.fauna = new Map();
    this.time = 0;
    this.bounds = null;
    this.population = 0;
    this.generation = 0;
    this.cells = [];
  }

  initNew() {
    this.fauna = new Map();
    this.time = 0;
    this.bounds = null;
    this.population = 0;
    this.generation = 0;
    this.cells = [];
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
    this.cells = null;
  }

  getCell(faunaX: number, faunaY: number) {
    if (!this.fauna.has(faunaX)) {
      return false;
    }
    const xRow = this.fauna.get(faunaX)!;
    return xRow.has(faunaY);
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
    this.cells = null;
  }

  nextGen() {
    let start = Date.now();
    let result: Fauna = new Map();
    let faunaInc: FaunaInc = new Map();
    let population = 0;
    let bounds = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };

    const input = this.fauna;
    let field: Coords[] = [];

    input.forEach((colMap, col) => {
      colMap.forEach((val, row) => {
        incNeighbors(faunaInc, col, row);
      });
    });

    faunaInc.forEach((colMap, col) => {
      let rowSet: Set<number> = new Set();
      colMap.forEach((liveNeighbors, row) => {
        let isLive = input.has(col) && input.get(col)!.has(row);

        if (
          (!isLive && liveNeighbors === 3) ||
          (isLive && (liveNeighbors === 2 || liveNeighbors === 3))
        ) {
          rowSet.add(row);

          if (col < bounds.left) bounds.left = col;
          if (col > bounds.right) bounds.right = col;
          if (row < bounds.top) bounds.top = row;
          if (row > bounds.bottom) bounds.bottom = row;
          field.push([col, row]);
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
      return;
    }

    this.fauna = result;
    this.time = time;
    this.bounds = bounds;
    this.population = population;
    this.cells = field;
    this.generation++;
  }

  serialise() {
    return {
      fauna: this.fauna,
      time: this.time,
      size: this.bounds,
      population: this.population,
      generation: this.generation,
    };
  }

  deserialise(data: SerData) {
    this.fauna = data.fauna;
    this.time = data.time;
    this.bounds = data.size;
    this.population = data.population;
    this.generation = data.generation;
    this.cells = null;
  }

  getCells() {
    if (this.cells === null) {
      let cells: Coords[] = [];

      this.fauna.forEach((colMap, col) => {
        colMap.forEach((val, row) => {
          cells.push([col, row]);
        });
      });
      this.cells = cells;
    }

    return this.cells;
  }

  normalise() {
    if (this.population === 0) return;

    let newFauna: Fauna = new Map();
    let { left, top } = this.getBounds()!;

    this.getCells().forEach(([x, y]) => {
      if (!newFauna.has(x - left)) {
        newFauna.set(x - left, new Set());
      }
      newFauna.get(x - left)!.add(y - top);
    });

    this.fauna = newFauna;
    this.cells = null;
    this.bounds!.top = 0;
    this.bounds!.left = 0;
    this.bounds!.right = this.bounds!.right - left;
    this.bounds!.bottom = this.bounds!.bottom - top;
  }

  getBounds() {
    if (this.population === 0) return null;

    let bounds = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity }; // todo optimize

    this.fauna.forEach((colMap, col) => {
      colMap.forEach((val, row) => {
        if (col < bounds.left) bounds.left = col;
        if (col > bounds.right) bounds.right = col;
        if (row < bounds.top) bounds.top = row;
        if (row > bounds.bottom) bounds.bottom = row;
      });
    });
    this.bounds = bounds;

    return this.bounds;
  }

  getSize() {
    let bounds = this.getBounds();
    if (!bounds) return [0, 0] as const;

    return [bounds.right - bounds.left + 1, bounds.bottom - bounds.top + 1] as const;
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
