import { rleToFauna } from "../importExport/utils";
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
    for (let [x, y] of a.eachCell()) {
      if (!b.getCell(x + offset.x, y + offset.y)) {
        return false;
      }
    }
  } else {
    for (let [x, y] of a.eachCell()) {
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

  for (let [x, y] of a.eachCell()) {
    if (!b.getCell(x, y)) {
      return false;
    }
  }

  return true;
}

export function aMinusB(a: IFauna, b: IFauna): IFauna {
  let fauna = new MyFauna();

  for (let [x, y] of a.eachCell()) {
    if (!b.getCell(x, y)) {
      fauna.setCell(x, y, true);
    }
  }

  return fauna;
}

export function isSpaceship(init: IFauna, currFauna: IFauna, max: number): boolean {
  init.normalise();
  currFauna.normalise();

  for (let i = 1; i <= max; i++) {
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
  return rleToFauna(rle).map((initFauna) => {
    if (initFauna.getPopulation() === 0) return Some({ name: "unknown" });

    let currFauna = initFauna.shallowClone();
    let prevFaunas: IFauna[] = [];

    for (let i = 1; i <= max; i++) {
      prevFaunas.push(currFauna.shallowClone());
      currFauna.nextGen();
      if (currFauna.getPopulation() === 0) {
        return Some({ name: "will-die", gen: i });
      }
      let { left, top } = currFauna.getBounds()!;

      if (i > 4) {
        // last 5 vars
        for (let j = prevFaunas.length - 1; j >= 0; j--) {
          let prFauna = prevFaunas[j];
          if (prFauna.getGeneration() > 0 && isFaunaEq(prFauna, currFauna)) {
            return Some({
              name: "stable-at",
              period: currFauna.getGeneration() - prFauna.getGeneration(),
              gen: prFauna.getGeneration(),
            });
          }
        }
        prevFaunas.shift();
      }

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
            10,
          )
        ) {
          return Some({ name: "gun", period: i });
        }
      }
    }

    return Some({ name: "unknown" });
  });
}

export function amountOfIslands(fauna: IFauna): number {
  // todo optimize
  let cnt = 0;
  let visited: Record<string, boolean> = {};

  for (let [x, y] of fauna.eachCell()) {
    let key = `${x},${y}`;
    if (visited[key]) continue;

    cnt++;

    let stack: [x: number, y: number, hasLifeNeib: boolean][] = [[x, y, false]];

    while (stack.length) {
      let [x, y, hasLifeNeib] = stack.pop()!;
      let key = `${x},${y}`;

      let isLive = fauna.getCell(x, y);

      if (visited[key]) continue;
      visited[key] = true;

      if (isLive || hasLifeNeib) {
        stack.push([x + 1, y - 1, isLive]);
        stack.push([x + 1, y, isLive]);
        stack.push([x + 1, y + 1, isLive]);
        stack.push([x, y - 1, isLive]);
        stack.push([x, y + 1, isLive]);
        stack.push([x - 1, y - 1, isLive]);
        stack.push([x - 1, y, isLive]);
        stack.push([x - 1, y + 1, isLive]);
      }
    }
  }

  return cnt;
}
