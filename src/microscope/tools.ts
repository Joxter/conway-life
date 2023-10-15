import { rleToHashLife } from "../importExport/utils";
import { PatternTypes, XY } from "../types";
import { IFauna } from "../lifes/interface";
import { Result, Option, Some } from "@sniptt/monads";
import { MyFauna } from "../lifes/myFauna";

export function isFaunaEq(a: IFauna, b: IFauna, offset?: XY): boolean {
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

export function isFaunaAinB(a: IFauna, b: IFauna): boolean {
  if (a.getPopulation() > b.getPopulation()) {
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

  // b must be bigger
  if (aSize[0] > bSize[0] || aSize[1] > bSize[1]) {
    return false;
  }

  for (let [x, y] of a.getCells()) {
    if (!b.getCell(x, y)) {
      return false;
    }
  }

  return true;
}

export function aMinusB(a: IFauna, b: IFauna): IFauna {
  let fauna = new MyFauna();

  for (let [x, y] of a.getCells()) {
    if (!b.getCell(x, y)) {
      fauna.setCell(x, y, true);
    }
  }

  return fauna;
}

export function isSpaceship(init: IFauna, currFauna: IFauna, max: number): boolean {
  init.normalise();
  currFauna.normalise();

  for (let i = 1; i <= 10; i++) {
    currFauna.nextGen();
    if (currFauna.getPopulation() === 0) {
      return false;
    }
    let { left, top } = currFauna.getBounds()!;

    if (left !== 0 && top !== 0 && isFaunaEq(init, currFauna, { x: left, y: top })) {
      return true;
    }
  }
  return false;
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

      if (isFaunaEq(initFauna, currFauna)) {
        if (i === 1) {
          return Some({ name: "still-live" });
        } else {
          return Some({ name: "oscillator", period: i });
        }
      } else if (isFaunaEq(initFauna, currFauna, { x: left, y: top })) {
        return Some({ name: "ship", period: i });
      } else if (isFaunaAinB(initFauna, currFauna)) {
        // todo extremely unoptimised
        if (
          isSpaceship(
            //
            aMinusB(currFauna, initFauna),
            aMinusB(currFauna, initFauna),
            max,
          )
        ) {
          return Some({ name: "gun", period: i });
        }
      }
    }

    return Some({ name: "unknown" });
  });
}
