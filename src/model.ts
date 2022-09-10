import { createEvent, createStore, sample } from 'effector';
import { checkNeighbors } from './utils';

export const FIELD_SIZE = 40;

const initField: boolean[][] = Array(FIELD_SIZE).fill(false).map(() => {
  return Array(FIELD_SIZE).fill(false);
});
export const $field = createStore<boolean[][]>(initField);

export const rawClicked = createEvent<any>();
const cellClicked = createEvent<{ row: number; col: number; }>();

export const tick = createEvent<any>();

sample({
  clock: rawClicked.filterMap((ev) => {
    if (ev.target.dataset && ev.target.dataset.row && ev.target.dataset.col) {
      return { row: +ev.target.dataset.row, col: +ev.target.dataset.col };
    }
  }),
  target: cellClicked,
});

$field
  .on(cellClicked, (field, { row, col }) => {
    const newField = [...field];
    const newRow = [...field[row]];

    newRow[col] = !newRow[col];
    newField[row] = newRow;

    return newField;
  }).on(tick, (field) => {
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
  });
