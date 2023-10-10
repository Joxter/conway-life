// src/lifes/myFauna.ts
var incNeighbors = function(faunaInc, col, row) {
  let neighborCoords = [
    [col - 1, row - 1],
    [col - 1, row],
    [col - 1, row + 1],
    [col, row - 1],
    [col, row + 1],
    [col + 1, row - 1],
    [col + 1, row],
    [col + 1, row + 1]
  ];
  if (!faunaInc.has(col - 1))
    faunaInc.set(col - 1, new Map);
  if (!faunaInc.has(col))
    faunaInc.set(col, new Map);
  if (!faunaInc.has(col + 1))
    faunaInc.set(col + 1, new Map);
  neighborCoords.forEach((coordsArr) => {
    const row2 = faunaInc.get(coordsArr[0]);
    let val = row2.get(coordsArr[1]);
    if (val === undefined) {
      row2.set(coordsArr[1], 1);
    } else {
      row2.set(coordsArr[1], val + 1);
    }
  });
  return faunaInc;
};

class MyFauna {
  fauna;
  time;
  size;
  population;
  generation;
  cells;
  constructor() {
    this.fauna = new Map;
    this.time = 0;
    this.size = null;
    this.population = 0;
    this.generation = 0;
    this.cells = [];
  }
  initNew() {
    this.fauna = new Map;
    this.time = 0;
    this.size = null;
    this.population = 0;
    this.generation = 0;
    this.cells = [];
  }
  toggleCell(x, y) {
    if (!this.fauna.has(x)) {
      this.fauna.set(x, new Set);
    }
    const xRow = this.fauna.get(x);
    if (xRow.has(y)) {
      xRow.delete(y);
      this.population--;
    } else {
      xRow.add(y);
      this.population++;
      this.cells.push([x, y]);
    }
  }
  setCell(faunaX, faunaY, live) {
    if (!this.fauna.has(faunaX)) {
      this.fauna.set(faunaX, new Set);
    }
    const xRow = this.fauna.get(faunaX);
    if (xRow.has(faunaY)) {
      this.population--;
    } else {
      this.population++;
      this.cells.push([faunaX, faunaY]);
    }
    if (live) {
      xRow.add(faunaY);
    } else {
      xRow.delete(faunaY);
    }
  }
  nextGen() {
    let start = Date.now();
    let result = new Map;
    let faunaInc = new Map;
    let population = 0;
    let size = { left: Infinity, right: (-Infinity), top: Infinity, bottom: (-Infinity) };
    const input = this.fauna;
    let field = [];
    input.forEach((colMap, col) => {
      colMap.forEach((val, row) => {
        incNeighbors(faunaInc, col, row);
      });
    });
    faunaInc.forEach((colMap, col) => {
      let rowSet = new Set;
      colMap.forEach((total, row) => {
        let isLive = input.has(col) && input.get(col).has(row);
        if (!isLive && total === 3 || isLive && (total === 2 || total === 3)) {
          rowSet.add(row);
          if (col < size.left)
            size.left = col;
          if (col > size.right)
            size.right = col;
          if (row < size.top)
            size.top = row;
          if (row > size.bottom)
            size.bottom = row;
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
    this.size = size;
    this.population = population;
    this.cells = field;
    this.generation++;
  }
  serialise() {
    return {
      fauna: this.fauna,
      time: this.time,
      size: this.size,
      population: this.population,
      generation: this.generation,
      cells: this.cells
    };
  }
  deserialise(data) {
    this.fauna = data.fauna;
    this.time = data.time;
    this.size = data.size;
    this.population = data.population;
    this.generation = data.generation;
    this.cells = data.cells;
  }
  getCells() {
    return this.cells;
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

// src/webworkerGo.ts
var lastRes = null;
self.addEventListener("message", (ev) => {
  if (ev.data.fauna) {
    lastRes = new MyFauna;
    lastRes.deserialise(ev.data.fauna);
  } else if (ev.data.gen) {
    if (!lastRes) {
      console.log("no lastRes");
      return;
    }
    lastRes.nextGen();
    self.postMessage({ calculated: lastRes.serialise() });
  }
});
