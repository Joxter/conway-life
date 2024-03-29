import { describe, expect, test } from "bun:test";

import {
  faunaToCellsOld,
  faunaToGrid,
  faunaToRle,
  rleToFauna,
  parseNormRleFile,
  getRectOfFauna,
  fixRleFile,
} from "./utils";
import { MyFauna } from "../lifes/myFauna";

let glider = "bo$2bo$3o!";
let gliderGun = `24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!`;
let gliderGunTest = `24bo$22bobo$12b2o6b2o12b2o3$11bo3bo4b2o12b2o$2o8bo5bo3b2o6$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!`;

describe("import-export utils", () => {
  describe("faunaToGrid", () => {
    test("should work with simples test", () => {
      let fauna = new MyFauna();
      fauna.setCell(1, 2, true);
      fauna.setCell(1, 5, true);

      // two cells vertically
      expect(faunaToGrid(fauna)).toEqual([[1], [0], [0], [1]]);
    });
    test("should work with simples test 2", () => {
      let fauna = new MyFauna();
      fauna.setCell(2, 2, true);
      fauna.setCell(5, 2, true);

      // two cells horizontally
      expect(faunaToGrid(fauna)).toEqual([[1, 0, 0, 1]]);
    });

    test("should work with simples test 3", () => {
      let fauna = new MyFauna();
      fauna.setCell(-2, -1, true);
      fauna.setCell(-2, 0, true);
      fauna.setCell(1, 2, true);
      fauna.setCell(1, -1, true);

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
      let fauna = new MyFauna();
      expect(faunaToGrid(fauna)).toEqual([]);
    });
  });

  describe("faunaToRle", () => {
    test("should work with simples test", () => {
      let fauna = new MyFauna();
      fauna.setCell(1, 2, true);
      fauna.setCell(1, 5, true);

      expect(faunaToRle(fauna)).toEqual("o3$o!");
    });

    test("should work with simples test 2", () => {
      let fauna = new MyFauna();
      fauna.setCell(2, 2, true);
      fauna.setCell(5, 2, true);

      expect(faunaToRle(fauna)).toEqual("o2bo!");
    });

    test("should work with simples test 3", () => {
      let fauna = new MyFauna();
      fauna.setCell(-2, -1, true);
      fauna.setCell(-2, 0, true);
      fauna.setCell(1, 2, true);
      fauna.setCell(1, -1, true);

      expect(faunaToRle(fauna)).toEqual("o2bo$o2$3bo!");
    });
  });

  describe("rleToFauna", () => {
    test("glider", () => {
      expect(faunaToRle(rleToFauna(glider).unwrap())).toEqual(glider);
      expect(faunaToCellsOld(rleToFauna(glider).unwrap())).toEqual(".O\n..O\nOOO");
    });
    test("gliderGun", () => {
      expect(faunaToRle(rleToFauna(gliderGun).unwrap())).toEqual(gliderGun);
      expect(faunaToCellsOld(rleToFauna(gliderGun).unwrap())).toEqual(
        "........................O\n......................O.O\n............OO......OO............OO\n...........O...O....OO............OO\nOO........O.....O...OO\nOO........O...O.OO....O.O\n..........O.....O.......O\n...........O...O\n............OO",
      );
    });
    test("gliderGunTest", () => {
      expect(faunaToRle(rleToFauna(gliderGunTest).unwrap())).toEqual(gliderGunTest);
      expect(faunaToCellsOld(rleToFauna(gliderGunTest).unwrap())).toEqual(
        "........................O\n......................O.O\n............OO......OO............OO\n\n\n...........O...O....OO............OO\nOO........O.....O...OO\n\n\n\n\n\nOO........O...O.OO....O.O\n..........O.....O.......O\n...........O...O\n............OO",
      );
    });
  });

  describe("faunaToCellsOld", () => {
    test("104P177 should work", () => {
      let rle = `16bo12bo16b$9b2o24b2o9b$8b3o3b2o14b2o3b3o8b$14b2ob2o8b2ob2o14b$16bo12b
o16b4$2bo40bo2b$b2o40b2ob$b2o40b2ob4$2b2o38b2o2b$2b2o38b2o2b$o3bo36bo
3bo$3bo38bo3b$3bo38bo3b9$3bo38bo3b$3bo38bo3b$o3bo36bo3bo$2b2o38b2o2b$
2b2o38b2o2b4$b2o40b2ob$b2o40b2ob$2bo40bo2b4$16bo12bo16b$14b2ob2o8b2ob
2o14b$8b3o3b2o14b2o3b3o8b$9b2o24b2o9b$16bo12bo!`;

      let cells = `................O............O
.........OO........................OO
........OOO...OO..............OO...OOO
..............OO.OO........OO.OO
................O............O



..O........................................O
.OO........................................OO
.OO........................................OO



..OO......................................OO
..OO......................................OO
O...O....................................O...O
...O......................................O
...O......................................O








...O......................................O
...O......................................O
O...O....................................O...O
..OO......................................OO
..OO......................................OO



.OO........................................OO
.OO........................................OO
..O........................................O



................O............O
..............OO.OO........OO.OO
........OOO...OO..............OO...OOO
.........OO........................OO
................O............O`;

      expect(faunaToCellsOld(rleToFauna(rle).unwrap())).toEqual(cells);
    });
  });

  describe("parseNormRleFile", () => {
    test("case 1", () => {
      let pattern = `#N pentoad2_synth.rle
#O Jeremy Tan and Goldtiger997, 1 April 2019
#C https://conwaylife.com/forums/viewtopic.php?p=74280#p74280
#C https://conwaylife.com/wiki/Pentoad_2
#C https://conwaylife.com/patterns/pentoad2_synth.rle
x = 62, y = 39, rule = B3/S23
61bo$40bo39b2o18bo$38bo!`;

      expect(parseNormRleFile(pattern, "foo.rle")).toEqual({
        fileName: "foo.rle",
        name: "Pentoad 2",
        author: ["Jeremy Tan and Goldtiger997, 1 April 2019"],
        comment: [
          "https://conwaylife.com/forums/viewtopic.php?p=74280#p74280",
          "https://conwaylife.com/wiki/Pentoad_2",
          "https://conwaylife.com/patterns/pentoad2_synth.rle",
        ],
        population: 0,
        rawName: "pentoad2_synth.rle",
        patternLink: "https://conwaylife.com/patterns/pentoad2_synth.rle",
        rle: "61bo$40bo39b2o18bo$38bo!",
        rule: "B3/S23",
        size: [62, 39],
        wikiLink: "https://conwaylife.com/wiki/Pentoad_2",
        type: null,
      });
    });

    test("case 2", () => {
      let pattern = `#N Pentoad 1H2
#C A period 5 oscillator.
#C www.conwaylife.com/wiki/Pentoad_1H2
#C population=24
x = 15, y = 12, rule = b3/s23
8b2o5b$8bobo2b2o$9b3ob2o2$5b2o8b$6bo8b$6bo8b$6b2o7b$2b2o11b$bobo11b$bo13b$2o!`;

      expect(parseNormRleFile(pattern, "foo.rle")).toEqual({
        fileName: "foo.rle",
        name: "Pentoad 1H2",
        author: [],
        comment: ["A period 5 oscillator.", "www.conwaylife.com/wiki/Pentoad_1H2"],
        population: 24,
        rawName: "Pentoad 1H2",
        patternLink: "",
        rle: "8b2o5b$8bobo2b2o$9b3ob2o2$5b2o8b$6bo8b$6bo8b$6b2o7b$2b2o11b$bobo11b$bo13b$2o!",
        rule: "b3/s23",
        size: [15, 12],
        wikiLink: "www.conwaylife.com/wiki/Pentoad_1H2",
        type: null,
      });
    });

    test("case 3", () => {
      let pattern = `#Cpseudo p14 gun
#CKarel Suhajda,Feb 2004
#C
x = 385, y = 337, rule = B3/S23
133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`;

      expect(parseNormRleFile(pattern, "foo.rle")).toEqual({
        fileName: "foo.rle",
        name: "foo",
        author: [],
        comment: ["pseudo p14 gun", "Karel Suhajda,Feb 2004"],
        population: 0,
        rawName: "",
        patternLink: "",
        rle: "133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!",
        rule: "B3/S23",
        size: [385, 337],
        wikiLink: "",
        type: null,
      });
    });

    test("2 author case", () => {
      let pattern = `#O Foo, 2022
#O Bar, 1234
x = 385, y = 337, rule = B3/S23
133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`;

      let parsed = parseNormRleFile(pattern, "foo");
      expect(parsed.author).toEqual(["Foo, 2022", "Bar, 1234"]);
    });

    test("2 names case", () => {
      let pattern = `#N Foo, 2022
#N Bar, 1234
x = 385, y = 337, rule = B3/S23
133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`;

      let parsed = parseNormRleFile(pattern, "foo");
      expect(parsed.name).toEqual("Foo, 2022 Bar, 1234"); // don't want 2+ line names
    });

    test("should prettify name", () => {
      let pattern = `#N Achim%27s other_p%5E16
x = 385, y = 337, rule = B3/S23
133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`;

      let parsed = parseNormRleFile(pattern, "foo");
      expect(parsed.name).toEqual("Achim's other p^16");
    });

    test("size should be the same as in the `x = ...` line", () => {
      let pattern = `x = 385, y = 337, rule = B3/S23
133boo!`;

      let parsed = parseNormRleFile(pattern, "foo");
      expect(parsed.size).toEqual([385, 337]);
    });

    test("should be fine if only `rle` string passed", () => {
      let pattern = `133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`;

      let parsed = parseNormRleFile(pattern, "foo");
      expect(parsed.rle).toEqual(
        "133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!",
      );
    });

    test("super very nothing case", () => {
      let pattern = ``;

      expect(parseNormRleFile(pattern, "foo")).toEqual({
        fileName: "foo",
        author: [],
        comment: [],
        population: 0,
        name: "foo",
        rawName: "",
        patternLink: "",
        rle: "",
        rule: "",
        size: [0, 0],
        wikiLink: "",
        type: null,
      });
    });
  });

  describe("getRectOfFauna", () => {
    test("7wss case", () => {
      /*
      x = 8, y = 5, rule = B3/S23
      3b3o$bo5bo$o$o6bo$7o!
      */

      let size = getRectOfFauna(rleToFauna("3b3o$bo5bo$o$o6bo$7o!").unwrap());
      expect(size).toEqual({ bottom: 4, left: 0, right: 7, top: 0 }); //
    });
  });

  describe("fixRleFile", () => {
    test("basic", () => {
      let content = ` #N Achim%27s other_p%5E16
x = 385, y = 337, rule = B3/S23
133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!
`;
      expect(fixRleFile(content).unwrap()).toEqual(`#N Achim%27s other_p%5E16
#C population=25
x = 332, y = 2, rule = b3/s23
133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`);
    });

    test("rle only", () => {
      let content = ` 133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo! `;
      expect(fixRleFile(content).unwrap()).toEqual(`#C population=25
x = 332, y = 2, rule = b3/s23
133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`); //
    });
  });
});
