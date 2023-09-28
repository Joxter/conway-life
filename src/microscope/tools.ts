import { FaunaData } from "../model/field";

export function isFaunaEq(a: FaunaData, b: FaunaData): boolean {
  if (a.population !== b.population) {
    return false;
  }

  if (!a.size || !b.size) {
    // todo undef??
    return false;
  }

  let aSize = [a.size.right - a.size.left + 1, a.size.bottom - a.size.top + 1];
  let bSize = [b.size.right - b.size.left + 1, b.size.bottom - b.size.top + 1];

  if (aSize[0] !== bSize[0] || aSize[1] !== bSize[1]) {
    return false;
  }

  for (let [x, aRow] of a.fauna) {
    if (!b.fauna.has(x)) {
      return false;
    }

    let bRow = b.fauna.get(x)!;
    if (aRow.size !== bRow.size) {
      return false;
    }

    for (let [y, aCell] of aRow) {
      let bCell = bRow.get(y);

      if (aCell !== bCell) {
        return false;
      }
    }
  }

  return true;
}
