import { FaunaData } from "../model/field";
import { getRectOfFauna, rleToFauna } from "../importExport/utils";
import { nextGen } from "../calcNextGen";
import { PatternTypes } from "../types";

export function makeFaunaDataFromRle(rle: string): FaunaData | null {
  let res = rleToFauna(rle);
  if (res.isErr()) {
    // todo dirty
    console.error(`Failed to parse rle "${rle.slice(0, 20)}..."\n Err: ${res.unwrapErr()}`);
    return null;
  }

  let { fauna, population } = res.unwrap();

  return {
    fauna,
    population,
    size: getRectOfFauna(fauna),
    time: 0,
  };
}

export function isFaunaDataEq(a: FaunaData, b: FaunaData): boolean {
  // console.log("------- isFaunaDataEq");
  // console.log("size", JSON.stringify(a.size), JSON.stringify(b.size));
  // console.log("pop", a.population, b.population);
  // console.log("fauna", a.fauna, b.fauna);

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
    let nextGenData = nextGen(currGen.fauna);
    if (isFaunaDataEq(firstGen, nextGenData)) {
      return i;
    }
    currGen = nextGenData;
  }

  return null;
}

export function typeByRle(rle: string, max = 100): PatternTypes | null {
  let period = isOscillatorsByRle(rle, max);

  if (period === 1) {
    return "still-live";
  }

  if (period) {
    return `oscillator|p${period}`;
  }

  return null;
}
