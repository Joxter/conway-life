import { describe, expect, test } from "bun:test";
import { cellsToFauna, faunaToCells } from "../importExport/utils";
import { MyFauna } from "./myFauna";

function cellsToMyFauna(str: string) {
  return cellsToFauna(new MyFauna(), str);
}

describe("myFauna", () => {
  test("smoke test", () => {
    let fauna = cellsToMyFauna(`
X...
....
...X
`);

    expect(fauna.getPopulation()).toEqual(2);
    expect(fauna.getGeneration()).toEqual(0);
    expect(fauna.getCell(0, 0)).toEqual(true);
    expect(fauna.getCell(3, 2)).toEqual(true);
    expect(fauna.getCells()).toEqual([
      [0, 0],
      [3, 2],
    ]);
    expect(fauna.getBounds()).toEqual({ left: 0, right: 3, top: 0, bottom: 2 });
    expect(fauna.getSize()).toEqual([4, 3]);
  });

  test("setCell should turn on and off cells", () => {
    let fauna = cellsToMyFauna("");
    fauna.setCell(0, 0, true);
    fauna.setCell(3, 2, true);

    expect(fauna.getCell(0, 0)).toEqual(true);
    expect(fauna.getCell(3, 2)).toEqual(true);
    expect(fauna.getCell(2, 3)).toEqual(false);

    fauna.setCell(0, 0, false);

    expect(fauna.getCell(0, 0)).toEqual(false);
    expect(fauna.getCell(3, 2)).toEqual(true);
  });

  test("toggleCell should switch state to the opposite value", () => {
    let fauna = cellsToMyFauna("");
    fauna.toggleCell(0, 0);
    fauna.toggleCell(3, 2);

    expect(fauna.getCell(0, 0)).toEqual(true);
    expect(fauna.getCell(3, 2)).toEqual(true);
    expect(fauna.getCell(2, 3)).toEqual(false);

    fauna.toggleCell(0, 0);

    expect(fauna.getCell(0, 0)).toEqual(false);
    expect(fauna.getCell(3, 2)).toEqual(true);
  });

  test("nextGen should calculate next generation", () => {
    let fauna = cellsToMyFauna(`
.X.
..X
XXX
`);
    fauna.nextGen();

    expect(fauna.getGeneration()).toEqual(1);
    expect(faunaToCells(fauna)).toEqual(
      `
X.X
.XX
.X.`.trim(),
    );
  });
});
