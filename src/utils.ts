function checkNeighbors(field: boolean[][], { row, col }: { row: number; col: number; }) {
  let count = 0;

  if (field[row - 1]) {
    if (field[row - 1][col - 1]) count++;
    if (field[row - 1][col]) count++;
    if (field[row - 1][col + 1]) count++;
  }
  if (field[row]) {
    if (field[row][col - 1]) count++;
    if (field[row][col + 1]) count++;
  }
  if (field[row + 1]) {
    if (field[row + 1][col - 1]) count++;
    if (field[row + 1][col]) count++;
    if (field[row + 1][col + 1]) count++;
  }

  return count;
}

export function getRowColFromEvent(ev: Event): { row: number; col: number; } | undefined {
  // @ts-ignore
  if (ev.target && ev.target.dataset && ev.target.dataset.row && ev.target.dataset.col) {
    // @ts-ignore
    return { row: +ev.target.dataset.row, col: +ev.target.dataset.col };
  }
}

export function makeGo(field: boolean[][]): boolean[][] {
  return field.map((rowArr, row) => {
    return rowArr.map((colVal, col) => {
      let cellVal = colVal;
      let nCount = checkNeighbors(field, { row, col });

      if (cellVal && nCount < 2) { // If live and <2 live neighbors
        return false;
      } else if (cellVal && nCount > 3) { // If live and >3 live neighbors
        return false;
      } else if (!cellVal && nCount == 3) { // If dead and 3 live neighbors
        return true;
      }

      return cellVal;
    });
  });
}

export function saveToLS(field: boolean[][]) {
  localStorage.setItem('field', JSON.stringify(field));
}

export function getInitFromLS(): boolean[][] | null {
  try {
    return JSON.parse(localStorage.getItem('field') || '') || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}
