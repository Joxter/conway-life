import { Field } from './types';

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

export function makeGo(field: Field): boolean[][] {
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

export function exportToSting(field: Field): string {
  let firstLive: number | null = null;
  let lastLive: number | null = null;

  const squash = field.map((row, i) => {
    if (firstLive === null && row.includes(true)) firstLive = i;
    if (row.includes(true)) lastLive = i;

    return row.map((it) => +it).join('');
  });

  if (firstLive === null || lastLive === null) {
    return '';
  }

  return squash.slice(firstLive, lastLive + 1).join('\n');
}

export function saveToLS(history: { field: Field; name: string; }[]) {
  localStorage.setItem('history', JSON.stringify(history));
}

export function getSavedFromLS(): { field: Field; name: string; }[] | null {
  try {
    // @ts-ignore
    return JSON.parse(localStorage.getItem('history') || null) || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function createEmpty(width: number, height: number): boolean[][] {
  return Array(height).fill(0).map(() => {
    return Array(width).fill(false);
  });
}
