import { expect, test, describe } from "bun:test";
import { isFaunaDataEq, typeByRle } from "./tools";
import { rleToFauna } from "../importExport/utils";

describe("tools", () => {
  describe("isFaunaEq", () => {
    test("basic true", () => {
      let rle = "o2b2ob4obo$6ob2o2bo!";
      let aFauna = rleToFauna(rle).unwrap();
      let bFauna = rleToFauna(rle).unwrap();

      expect(isFaunaDataEq(aFauna, bFauna)).toEqual(true);
    });

    test("basic false", () => {
      let rle = "o2b2ob4obo$6ob2o2bo!"; // 2x12 infinite growth
      let aFauna = rleToFauna(rle).unwrap();
      let bFauna = rleToFauna(rle).unwrap();

      bFauna.nextGen();

      expect(isFaunaDataEq(aFauna, bFauna)).toEqual(false);
    });

    test("same size(3*3) and population(5), different patterns", () => {
      let patterns = [`2o$b2o$2bo!`, `b2o$2o$o!`, `b2o$bo$2o!`, `b2o$o$obo!`, `2bo$b2o$2o!`];

      for (let i = 0; i < patterns.length; i++) {
        let aFauna = rleToFauna(patterns[i]).unwrap();

        for (let j = 0; j < patterns.length; j++) {
          let bFauna = rleToFauna(patterns[j]).unwrap();

          if (i !== j) {
            expect(isFaunaDataEq(aFauna, bFauna)).toEqual(false);
          }
        }
      }
    });
  });

  describe("typeByRle (ship)", () => {
    test("glider is a ship", () => {
      let rle = "bob$2bo$3o!";
      let type = typeByRle(rle, 100).unwrap().unwrap();

      expect(type.name).toEqual("ship");
      if (type.name === "ship") {
        expect(type.period).toEqual(4);
      }
    });

    test("35p12h6v0 is a ship with period sd", () => {
      let rle =
        "8b3o$8bo2bo2b3o$2b3o3bo5bo2bo$bo2bo3bo5bo$4bo3bo5bo3bo$o2bo4bo2bo2bo3bo$b2o6b2o3bo$15bobo!";

      let type = typeByRle(rle, 100).unwrap().unwrap();

      expect(type.name).toEqual("ship");
      if (type.name === "ship") {
        expect(type.period).toEqual(12);
      }
    });

    test("block is not a ship", () => {
      let rle = "2o$2o!";
      let type = typeByRle(rle, 100).unwrap().unwrap();

      expect(type.name).not.toEqual("ship");
    });
  });

  describe.skip("isRleStillLive", () => {
    // todo update
    function isRleStillLive(a: any): any {}

    function extractedIsRleStillLive(rle: string): boolean {
      return isRleStillLive(rle).unwrap();
    }

    test("block is still-live", () => {
      let rle = "2o$2o!";
      expect(extractedIsRleStillLive(rle)).toEqual(true);
    });

    test("29bitstilllifeno1 is still-live", () => {
      let rle = "5bo$4bobo$2obobobo$2obobobo$3bob2o$2obo$2obo$3bob2o$3bo2bo$4b2o!";
      expect(extractedIsRleStillLive(rle)).toEqual(true);
    });

    test("glider is not still-life, it is a ship", () => {
      let rle = "bob$2bo$3o!";
      expect(extractedIsRleStillLive(rle)).toEqual(false);
    });

    test("1beacon is not still-life", () => {
      let rle = "2b2o3b$bobo3b$o2bob2o$2obo2bo$bobo3b$bo2bo2b$2b2o!";
      expect(extractedIsRleStillLive(rle)).toEqual(false);
    });
  });

  describe.skip("isOscillatorsByRle", () => {
    // todo update
    function isOscillatorsByRle(a: any): any {}

    function extractedIsOscillatorsByRle(rle: string): number | null {
      return null;
    }

    test("block has period eq 1", () => {
      let rle = "2o$2o!";
      expect(extractedIsOscillatorsByRle(rle)).toEqual(1);
    });

    test("29bitstilllifeno1 has period eq 1", () => {
      let rle = "5bo$4bobo$2obobobo$2obobobo$3bob2o$2obo$2obo$3bob2o$3bo2bo$4b2o!";
      expect(extractedIsOscillatorsByRle(rle)).toEqual(1);
    });

    test("glider is a ship, it is no a oscillator", () => {
      let rle = "bob$2bo$3o!";
      expect(extractedIsOscillatorsByRle(rle)).toEqual(null);
    });

    test("1beacon is a oscillator with period eq 2", () => {
      let rle = "2b2o3b$bobo3b$o2bob2o$2obo2bo$bobo3b$bo2bo2b$2b2o!";
      expect(extractedIsOscillatorsByRle(rle)).toEqual(2);
    });

    test("Tanner is a oscillator with period eq 46", () => {
      let rle = `2b2o9b$2bo10b$3bo9b$2b2o9b$13b$9b2o2b$9bo3b$10bo2b$9b2o2b$b2o10b$b2o6b
2o2b$o7bobo2b$b2o6bo3b$b2o7b3o$12bo$13b$13b$13b$13b$13b$13b$b2o10b$b2o
2b2o6b$5bobo5b$7bo5b$7b2o4b!`;
      expect(extractedIsOscillatorsByRle(rle)).toEqual(46);
    });

    test("50P92.1 is a oscillator with period eq 92", () => {
      let rle = `25b2o5b2o$25b2o5b2o12$27b2ob2o$26bo5bo2$25bo7bo$25bo2bobo2bo$25b3o3b3o
3$17b2o$2o15bobo$2o17bo$17b3o4$17b3o$2o17bo$2o15bobo$17b2o!`;
      expect(extractedIsOscillatorsByRle(rle)).toEqual(92);
    });
  });
});
