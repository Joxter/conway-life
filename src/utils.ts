export function checkNeighbors(tableArr: boolean[][], { row, col }: { row: number; col: number; }) {
  let count = 0;

  if (tableArr[row - 1]) {
    if (tableArr[row - 1][col - 1]) count++;
    if (tableArr[row - 1][col]) count++;
    if (tableArr[row - 1][col + 1]) count++;
  }
  if (tableArr[row]) {
    if (tableArr[row][col - 1]) count++;
    if (tableArr[row][col + 1]) count++;
  }
  if (tableArr[row + 1]) {
    if (tableArr[row + 1][col - 1]) count++;
    if (tableArr[row + 1][col]) count++;
    if (tableArr[row + 1][col + 1]) count++;
  }

  return count;
}
