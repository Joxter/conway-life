import { Field, FieldCell } from './types';

function checkNeighbors(field: Field, { row, col }: { row: number; col: number; }) {
  let count = [0, 0, 0]; // color 0 1 2

  function inc(cell: FieldCell | undefined) {
    if (typeof cell === 'number') {
      count[cell]++;
    }
  }

  if (field[row - 1]) {
    inc(field[row - 1][col - 1]);
    inc(field[row - 1][col]);
    inc(field[row - 1][col + 1]);
  }
  if (field[row]) {
    inc(field[row][col - 1]);
    inc(field[row][col + 1]);
  }
  if (field[row + 1]) {
    inc(field[row + 1][col - 1]);
    inc(field[row + 1][col]);
    inc(field[row + 1][col + 1]);
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

export function makeGo(field: Field): Field {
  return field.map((rowArr, row) => {
    return rowArr.map((colVal, col) => {
      let cellVal = colVal;
      let [deadCnt, oneCnt, twoCnt] = checkNeighbors(field, { row, col });

      if (cellVal && (oneCnt + twoCnt) < 2) { // If live and <2 live neighbors
        return 0;
      } else if (cellVal && (oneCnt + twoCnt) > 3) { // If live and >3 live neighbors
        return 0;
      } else if (!cellVal && (oneCnt + twoCnt) == 3) { // If dead and 3 live neighbors
        return oneCnt > twoCnt ? 1 : 2;
      }

      return cellVal;
    });
  });
}

export function exportToSting(field: Field): string {
  let firstLive: number | null = null;
  let lastLive: number | null = null;

  const squash = field.map((row, i) => {
    const notDead = row.includes(1) || row.includes(2);
    if (firstLive === null && notDead) firstLive = i;
    if (notDead) lastLive = i;

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

export function createEmpty(width: number, height: number): Field {
  return Array(height).fill(0).map(() => {
    return Array(width).fill(0);
  });
}
