import { rleToFauna } from "../importExport/utils";
import { PatternTypes } from "../types";
import { IFauna } from "../lifes/interface";

export function makeFaunaDataFromRle(rle: string): IFauna | null {
  let res = rleToFauna(rle);
  if (res.isErr()) {
    // todo dirty
    console.error(`Failed to parse rle "${rle.slice(0, 20)}..."\n Err: ${res.unwrapErr()}`);
    return null;
  }

  let fauna = res.unwrap();

  return fauna;
}

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

export function isRleStillLive(rle: string): boolean {
  let period = isOscillatorsByRle(rle, 1);

  return period === 1;
}

export function isOscillatorsByRle(rle: string, max = 100): number | null {
  let firstGen = makeFaunaDataFromRle(rle);
  let currGen = makeFaunaDataFromRle(rle);
  if (!firstGen || !currGen) {
    return null;
  }

  for (let i = 1; i <= max; i++) {
    currGen.nextGen();
    if (isFaunaDataEq(firstGen, currGen)) {
      return i;
    }
  }

  return null;
}

export function typeByRle(rle: string, max = 100): PatternTypes | null {
  let period = isOscillatorsByRle(rle, max);

  if (period === 1) {
    return { name: "still-live" };
  }

  if (period) {
    return { name: "oscillator", period };
  }

  return null;
}
