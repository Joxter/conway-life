self.addEventListener('message', (ev) => {
  const res = newMakeGo(ev.data)
  self.postMessage(res)
});


function newMakeGo(input) {
  let start = Date.now();
  let result = new Map();
  let faunaInc = new Map();
  let size = 0;

  input.forEach((colMap, col) => {
    colMap.forEach((color, row) => {
      incNeighbors(faunaInc, [col, row], color);
    });
  });

  faunaInc.forEach((colMap, col) => {
    let rowMap = new Map();
    colMap.forEach(([oneCnt, twoCnt], row) => {
      let cellVal = input.get(col) && input.get(col).get(row) || 0;
      let total = oneCnt + twoCnt;

      if (cellVal === 0 && total == 3) {
        rowMap.set(row, oneCnt > twoCnt ? 1 : 2);
      } else if (cellVal !== 0 && (total === 2 || total === 3)) {
        rowMap.set(row, cellVal);
      }
    });

    size += rowMap.size;
    result.set(col, rowMap);
  });
  const time = Date.now() - start;

  return { fauna: result, time, size };
}

function incNeighbors(faunaInc, [col, row], value) {
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
    const row = faunaInc.get(coordsArr[0]);
    if (!row.has(coordsArr[1])) {
      row.set(coordsArr[1], [0, 0]);
    }

    if (value === 1) {
      row.get(coordsArr[1])[0]++;
    } else {
      row.get(coordsArr[1])[1]++;
    }
  });

  return faunaInc;
}
