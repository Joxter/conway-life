import { describe, expect, test } from "bun:test";

import { faunaToGrid, faunaToRle, rleToFauna } from "./utils";

let glider = "bo$2bo$3o!";
let gliderGun = `24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!`;
let gliderGunTest = `24bo$22bobo$12b2o6b2o12b2o3$11bo3bo4b2o12b2o$2o8bo5bo3b2o6$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!`;

describe("import-export utils", () => {
  describe("faunaToGrid", () => {
    test("should work with simples test", () => {
      let fauna = new Map();
      // prettier-ignore
      fauna.set(1, new Map([[2, 1], [5, 1]]));

      // two cells vertically
      expect(faunaToGrid(fauna)).toEqual([[1], [0], [0], [1]]);
    });
    test("should work with simples test 2", () => {
      let fauna = new Map();
      // prettier-ignore
      fauna.set(2, new Map([[2, 1]]));
      // prettier-ignore
      fauna.set(5, new Map([[2, 1]]));

      // two cells horizontally
      expect(faunaToGrid(fauna)).toEqual([[1, 0, 0, 1]]);
    });
    test("should work with simples test 3", () => {
      let fauna = new Map();
      // prettier-ignore
      fauna.set(-2, new Map([[-1, 1],[0, 1]]));
      // prettier-ignore
      fauna.set(1, new Map([[2, 1], [-1, 1]]));

      // two cells horizontally
      expect(faunaToGrid(fauna)).toEqual([
        // prettier-ignore
        [1, 0, 0, 1], // -1
        [1, 0, 0, 0], //  0
        [0, 0, 0, 0], //  1
        [0, 0, 0, 1], //  2
      ]);
    });

    test("empty fauna should be fine", () => {
      let fauna = new Map();
      expect(faunaToGrid(fauna)).toEqual([]);

      let fauna2 = new Map();

      fauna2.set(123, new Map());
      expect(faunaToGrid(fauna)).toEqual([]);
    });
  });

  describe("faunaToRle", () => {
    test("should work with simples test", () => {
      let fauna = new Map();
      // prettier-ignore
      fauna.set(1, new Map([[2, 1], [5, 1]]));

      expect(faunaToRle(fauna)).toEqual("o3$o!");
    });

    test("should work with simples test 2", () => {
      let fauna = new Map();
      // prettier-ignore
      fauna.set(2, new Map([[2, 1]]));
      // prettier-ignore
      fauna.set(5, new Map([[2, 1]]));

      expect(faunaToRle(fauna)).toEqual("o2bo!");
    });

    test("should work with simples test 3", () => {
      let fauna = new Map();
      // prettier-ignore
      fauna.set(-2, new Map([[-1, 1],[0, 1]]));
      // prettier-ignore
      fauna.set(1, new Map([[2, 1], [-1, 1]]));

      expect(faunaToRle(fauna)).toEqual("o2bo$o2$3bo!");
    });
  });

  describe("rleToFauna", () => {
    test("glider", () => {
      expect(faunaToRle(rleToFauna(glider).unwrap())).toEqual(glider);

      // prettier-ignore
      expect(rleToFauna(glider).unwrap()).toEqual(new Map([
        [1, new Map([[0, 1], [2, 1]])],
        [2, new Map([[1, 1], [2, 1]])],
        [0, new Map([[2, 1]])],
      ]
      ));
    });
    test("gliderGun", () => {
      expect(faunaToRle(rleToFauna(gliderGun).unwrap())).toEqual(gliderGun);
    });
    test("gliderGunTest", () => {
      expect(faunaToRle(rleToFauna(gliderGunTest).unwrap())).toEqual(gliderGunTest);
    });
  });
});
