import { rleToHashLife } from "../importExport/utils";
import { PatternTypes, XY } from "../types";
import { IFauna } from "../lifes/interface";
import { Result, Option, Some } from "@sniptt/monads";

export function isFaunaDataEq(a: IFauna, b: IFauna, offset?: XY): boolean {
  // console.log("------- isFaunaDataEq");
  // console.log("size", JSON.stringify(aBounds), JSON.stringify(bBounds));
  // console.log("pop", a.population, b.population);
  // console.log("fauna", a.fauna, b.fauna);

  if (a.getPopulation() !== b.getPopulation()) {
    return false;
  }

  let aBounds = a.getBounds();
  let bBounds = b.getBounds();

  if (!aBounds || !bBounds) {
    // todo undef??
    return false;
  }

  let aSize = [aBounds.right - aBounds.left + 1, aBounds.bottom - aBounds.top + 1];
  let bSize = [bBounds.right - bBounds.left + 1, bBounds.bottom - bBounds.top + 1];

  if (aSize[0] !== bSize[0] || aSize[1] !== bSize[1]) {
    return false;
  }

  if (offset) {
    for (let [x, y] of a.getCells()) {
      if (!b.getCell(x + offset.x, y + offset.y)) {
        return false;
      }
    }
  } else {
    for (let [x, y] of a.getCells()) {
      if (!b.getCell(x, y)) {
        return false;
      }
    }
  }

  return true;
}

export function typeByRle(rle: string, max = 100): Result<Option<PatternTypes>, string> {
  return rleToHashLife(rle).map((initFauna) => {
    if (initFauna.getPopulation() === 0) return Some({ name: "unknown" });

    let currFauna = rleToHashLife(rle).unwrap(); // todo add .clone() method?

    for (let i = 1; i <= max; i++) {
      currFauna.nextGen();
      if (currFauna.getPopulation() === 0) {
        return Some({ name: "died-at", gen: i });
      }
      let { left, top } = currFauna.getBounds()!;

      if (isFaunaDataEq(initFauna, currFauna)) {
        if (i === 1) {
          return Some({ name: "still-live" });
        } else {
          return Some({ name: "oscillator", period: i });
        }
      } else if (isFaunaDataEq(initFauna, currFauna, { x: left, y: top })) {
        return Some({ name: "ship", period: i });
      }
    }

    return Some({ name: "unknown" });
  });
}
