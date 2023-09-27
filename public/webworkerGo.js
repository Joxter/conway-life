// src/makeGo.ts
function newMakeGo(input) {
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
      if (!isLive && total === 3) {
        rowMap.set(row, 1);
      } else if (isLive && (total === 2 || total === 3)) {
        rowMap.set(row, 1);
      }
      if (col < size.left)
        size.left = col;
      if (col > size.right)
        size.right = col;
      if (row < size.top)
        size.top = row;
      if (row > size.bottom)
        size.bottom = row;
    });
    population += rowMap.size;
    result.set(col, rowMap);
  });
  const time = Date.now() - start;
  return { fauna: result, time, population, size };
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
    lastRes = null;
    lastRes = newMakeGo(ev.data.fauna);
    gen = 1;
    console.log("111", { gen });
    self.postMessage({ res: lastRes, gen });
  } else if (ev.data.gen) {
    if (!lastRes) {
      console.log("no lastRes");
      return;
    }
    while (gen < ev.data.gen) {
      gen++;
      lastRes = newMakeGo(lastRes.fauna);
    }
    console.log("222", { gen });
    self.postMessage({ res: lastRes, gen });
  }
});
