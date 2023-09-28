import { expect, test, describe } from "bun:test";
import { isFaunaEq } from "./tools";
import { getRectOfFauna, rleToFauna } from "../importExport/utils";
import { newMakeGo } from "../makeGo";
import { FaunaData } from "../model/field";

function makeFaunaDataFromRle(rle: string): FaunaData {
  let { fauna, population } = rleToFauna(rle).unwrap();

  return {
    fauna,
    population,
    size: getRectOfFauna(fauna),
    time: 0,
  };
}

describe("tools", () => {
  describe("isFaunaEq", () => {
    test("basic true", () => {
      let rle = "o2b2ob4obo$6ob2o2bo!";
      let aFauna = makeFaunaDataFromRle(rle);
      let bFauna = makeFaunaDataFromRle(rle);

      expect(isFaunaEq(aFauna, bFauna)).toEqual(true);
    });

    test("basic false", () => {
      let rle = "o2b2ob4obo$6ob2o2bo!"; // 2x12 infinite growth
      let aFauna = makeFaunaDataFromRle(rle);
      let _bFauna = rleToFauna(rle).unwrap();

      let bFauna = newMakeGo(_bFauna.fauna);

      expect(isFaunaEq(aFauna, bFauna)).toEqual(false);
    });

    test("same size and population, different patterns", () => {
      let patterns = [`2o$b2o$2bo!`, `b2o$2o$o!`, `b2o$bo$2o!`, `b2o$o$obo!`, `2bo$b2o$2o!`]; // 3*3 pop5

      for (let i = 0; i < patterns.length; i++) {
        let aFauna = makeFaunaDataFromRle(patterns[i]);

        for (let j = 0; j < patterns.length; j++) {
          let bFauna = makeFaunaDataFromRle(patterns[j]);

          if (i !== j) {
            expect(isFaunaEq(aFauna, bFauna)).toEqual(false);
          }
        }
      }
    });
  });
});
