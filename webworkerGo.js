// src/calcNextGen.ts
function nextGen(input) {
  let start = Date.now();
  let result = new Map;
  let faunaInc = new Map;
  let population = 0;
  let size = { left: Infinity, right: (-Infinity), top: Infinity, bottom: (-Infinity) };
  input.forEach((colMap, col) => {
    colMap.forEach((val, row) => {
      incNeighbors(faunaInc, col, row);
    });
  });
  faunaInc.forEach((colMap, col) => {
    let rowMap = new Map;
    colMap.forEach((total, row) => {
      let isLive = (input.get(col) && input.get(col).get(row)) === 1;
      if (!isLive && total === 3 || isLive && (total === 2 || total === 3)) {
        rowMap.set(row, 1);
        if (col < size.left)
          size.left = col;
        if (col > size.right)
          size.right = col;
        if (row < size.top)
          size.top = row;
        if (row > size.bottom)
          size.bottom = row;
      }
    });
    if (rowMap.size > 0) {
      population += rowMap.size;
      result.set(col, rowMap);
    }
  });
  const time = Date.now() - start;
  if (population === 0) {
    return { fauna: result, time, population, size: null };
  }
  return { fauna: result, time, population, size };
}
function currGen(input) {
  let start = Date.now();
  let population = 0;
  let size = { left: Infinity, right: (-Infinity), top: Infinity, bottom: (-Infinity) };
  for (let [row, rowData] of input) {
    population += rowData.size;
    for (let [col, val] of rowData) {
      if (col < size.left)
        size.left = col;
      if (col > size.right)
        size.right = col;
      if (row < size.top)
        size.top = row;
      if (row > size.bottom)
        size.bottom = row;
    }
  }
  const time = Date.now() - start;
  if (population === 0) {
    return { fauna: input, time, population, size: null };
  }
  return { fauna: input, time, population, size };
}
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

// src/webworkerGo.ts
var gen = 0;
var lastRes = null;
self.addEventListener("message", (ev) => {
  if (ev.data.fauna) {
    lastRes = currGen(ev.data.fauna);
    gen = 1;
    self.postMessage({ res: lastRes, gen });
  } else if (ev.data.gen) {
    if (!lastRes) {
      console.log("no lastRes");
      return;
    }
    gen++;
    lastRes = nextGen(lastRes.fauna);
    self.postMessage({ res: lastRes, gen });
  }
});
