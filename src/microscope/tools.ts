import { rleToFauna } from "../importExport/utils";
import { PatternTypes } from "../types";
import { IFauna } from "../lifes/interface";
import { Result, Option, Some } from "@sniptt/monads";

export function isFaunaDataEq(a: IFauna, b: IFauna): boolean {
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

  for (let [x, y] of a.getCells()) {
    if (!b.getCell(x, y)) {
      return false;
    }
  }

  return true;
}

export function typeByRle(rle: string, max = 100): Result<Option<PatternTypes>, string> {
  return rleToFauna(rle).map((firstGen) => {
    let currGen = rleToFauna(rle).unwrap(); // todo add .clone() method?

    for (let i = 1; i <= max; i++) {
      if (currGen.getPopulation() === 0) {
        return Some({ name: "died-at", gen: i });
      }
      currGen.nextGen();
      if (isFaunaDataEq(firstGen, currGen)) {
        if (i === 1) {
          return Some({ name: "still-live" });
        } else {
          return Some({ name: "oscillator", period: i });
        }
      }
    }

    return Some({ name: "unknown" });
  });
}
