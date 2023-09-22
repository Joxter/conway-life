import { describe, expect, test } from "bun:test";

import { faunaToCells, faunaToGrid, faunaToRle, rleToFauna, parseRleFile } from "./utils";

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

  describe("faunaToCells", () => {
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

      expect(faunaToCells(rleToFauna(rle).unwrap())).toEqual(cells);
    });
  });

  describe("parseRleFile", () => {
    test("case 1", () => {
      let pattern = `#N pentoad2_synth.rle
#O Jeremy Tan and Goldtiger997, 1 April 2019
#C https://conwaylife.com/forums/viewtopic.php?p=74280#p74280
#C https://conwaylife.com/wiki/Pentoad_2
#C https://conwaylife.com/patterns/pentoad2_synth.rle
x = 62, y = 39, rule = B3/S23
61bo$40bo18b2o$41b2o17b2o$40b2o2$54bo$44bo8bo$45b2o6b3o$44b2o5$15bo$
39b2o18bo$38bo!`;

      expect(parseRleFile(pattern)).toEqual({
        derivedName: "Pentoad 2",
        author: "Jeremy Tan and Goldtiger997, 1 April 2019",
        comment: "https://conwaylife.com/forums/viewtopic.php?p=74280#p74280",
        name: "pentoad2_synth.rle",
        patternLink: "https://conwaylife.com/patterns/pentoad2_synth.rle",
        rle: "61bo$40bo18b2o$41b2o17b2o$40b2o2$54bo$44bo8bo$45b2o6b3o$44b2o5$15bo$39b2o18bo$38bo!",
        rule: "b3/s23",
        size: [62, 39],
        wikiLink: "https://conwaylife.com/wiki/Pentoad_2",
      });
    });

    test("case 2", () => {
      let pattern = `#N Pentoad 1H2
#C A period 5 oscillator.
#C www.conwaylife.com/wiki/Pentoad_1H2
x = 15, y = 12, rule = b3/s23
8b2o5b$8bobo2b2o$9b3ob2o2$5b2o8b$6bo8b$6bo8b$6b2o7b$2b2o11b$bobo11b$bo
13b$2o!`;

      expect(parseRleFile(pattern)).toEqual({
        derivedName: "Pentoad 1H2",
        author: "",
        comment: "A period 5 oscillator.",
        name: "Pentoad 1H2",
        patternLink: "",
        rle: "8b2o5b$8bobo2b2o$9b3ob2o2$5b2o8b$6bo8b$6bo8b$6b2o7b$2b2o11b$bobo11b$bo13b$2o!",
        rule: "b3/s23",
        size: [15, 12],
        wikiLink: "www.conwaylife.com/wiki/Pentoad_1H2",
      });
    });

    test("case 3", () => {
      let pattern = `#Cpseudo p14 gun
#CKarel Suhajda,Feb 2004
#C
x = 385, y = 337, rule = B3/S23
133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`;

      expect(parseRleFile(pattern)).toEqual({
        derivedName: "",
        author: "",
        comment: "pseudo p14 gun\nKarel Suhajda,Feb 2004",
        name: "",
        patternLink: "",
        rle: "133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!",
        rule: "b3/s23",
        size: [385, 337],
        wikiLink: "",
      });
    });

    test("2 author case", () => {
      let pattern = `#O Foo, 2022
#O Bar, 1234
x = 385, y = 337, rule = B3/S23
133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`;

      let parsed = parseRleFile(pattern);
      expect(parsed.author).toEqual("Foo, 2022\nBar, 1234");
    });

    test("2 names case", () => {
      let pattern = `#N Foo, 2022
#N Bar, 1234
x = 385, y = 337, rule = B3/S23
133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`;

      let parsed = parseRleFile(pattern);
      expect(parsed.name).toEqual("Foo, 2022 Bar, 1234"); // don't want 2+ line names
    });

    test("nothing case", () => {
      let pattern = `x = 385, y = 337, rule = B3/S23
133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`;

      let parsed = parseRleFile(pattern);
      expect(parsed.size).toEqual([385, 337]);
      expect(parsed.rle).toEqual(
        "133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!",
      );
    });

    test("very nothing case", () => {
      let pattern = `133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!`;

      let parsed = parseRleFile(pattern);
      expect(parsed.rle).toEqual(
        "133boo76booboo3boo101boo3booboo$130bo3bo75bobobo3bobo14bo71bo14bobo!",
      );
    });

    test("super very nothing case", () => {
      let pattern = ``;

      parseRleFile(pattern);
      expect(parseRleFile(pattern)).toEqual({
        author: "",
        comment: "",
        derivedName: "",
        name: "",
        patternLink: "",
        rle: "",
        rule: "",
        size: [0, 0],
        wikiLink: "",
      });
    });
  });
});
