import { expect, test, describe } from "bun:test";
import { isOscillatorsByRle, isFaunaDataEq, isRleStillLive, makeFaunaDataFromRle } from "./tools";
import { rleToFauna } from "../importExport/utils";
import { nextGen } from "../calcNextGen";

describe("tools", () => {
  describe("isFaunaEq", () => {
    test("basic true", () => {
      let rle = "o2b2ob4obo$6ob2o2bo!";
      let aFauna = makeFaunaDataFromRle(rle);
      let bFauna = makeFaunaDataFromRle(rle);

      expect(isFaunaDataEq(aFauna, bFauna)).toEqual(true);
    });

    test("basic false", () => {
      let rle = "o2b2ob4obo$6ob2o2bo!"; // 2x12 infinite growth
      let aFauna = makeFaunaDataFromRle(rle);
      let _bFauna = rleToFauna(rle).unwrap();

      let bFauna = nextGen(_bFauna.fauna);

      expect(isFaunaDataEq(aFauna, bFauna)).toEqual(false);
    });

    test("same size and population, different patterns", () => {
      let patterns = [`2o$b2o$2bo!`, `b2o$2o$o!`, `b2o$bo$2o!`, `b2o$o$obo!`, `2bo$b2o$2o!`]; // 3*3 pop5

      for (let i = 0; i < patterns.length; i++) {
        let aFauna = makeFaunaDataFromRle(patterns[i]);

        for (let j = 0; j < patterns.length; j++) {
          let bFauna = makeFaunaDataFromRle(patterns[j]);

          if (i !== j) {
            expect(isFaunaDataEq(aFauna, bFauna)).toEqual(false);
          }
        }
      }
    });
  });

  describe("isRleStillLive", () => {
    test("block is still-live", () => {
      let rle = "2o$2o!";
      expect(isRleStillLive(rle)).toEqual(true);
    });

    test("29bitstilllifeno1 is still-live", () => {
      let rle = "5bo$4bobo$2obobobo$2obobobo$3bob2o$2obo$2obo$3bob2o$3bo2bo$4b2o!";
      expect(isRleStillLive(rle)).toEqual(true);
    });

    test("glider is not still-life, it is a ship", () => {
      let rle = "bob$2bo$3o!";
      expect(isRleStillLive(rle)).toEqual(false);
    });

    test("1beacon is not still-life", () => {
      let rle = "2b2o3b$bobo3b$o2bob2o$2obo2bo$bobo3b$bo2bo2b$2b2o!";
      expect(isRleStillLive(rle)).toEqual(false);
    });
  });

  describe("isOscillatorsByRle", () => {
    test("block has period eq 1", () => {
      let rle = "2o$2o!";
      expect(isOscillatorsByRle(rle)).toEqual(1);
    });

    test("29bitstilllifeno1 has period eq 1", () => {
      let rle = "5bo$4bobo$2obobobo$2obobobo$3bob2o$2obo$2obo$3bob2o$3bo2bo$4b2o!";
      expect(isOscillatorsByRle(rle)).toEqual(1);
    });

    test("glider is a ship, it is no a oscillator", () => {
      let rle = "bob$2bo$3o!";
      expect(isOscillatorsByRle(rle)).toEqual(null);
    });

    test("1beacon is a oscillator with period eq 2", () => {
      let rle = "2b2o3b$bobo3b$o2bob2o$2obo2bo$bobo3b$bo2bo2b$2b2o!";
      expect(isOscillatorsByRle(rle)).toEqual(2);
    });

    test("Tanner is a oscillator with period eq 46", () => {
      let rle = `2b2o9b$2bo10b$3bo9b$2b2o9b$13b$9b2o2b$9bo3b$10bo2b$9b2o2b$b2o10b$b2o6b
2o2b$o7bobo2b$b2o6bo3b$b2o7b3o$12bo$13b$13b$13b$13b$13b$13b$b2o10b$b2o
2b2o6b$5bobo5b$7bo5b$7b2o4b!`;
      expect(isOscillatorsByRle(rle)).toEqual(46);
    });
  });
});
