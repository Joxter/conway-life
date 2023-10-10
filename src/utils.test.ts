import { expect, test, describe } from "bun:test";
import { adjustOffset, newFaunaDataFromRle } from "./utils";

describe("adjustOffset", () => {
  test("basic", () => {
    expect(
      adjustOffset(
        //
        { row: 38, col: 58 },
        { x: 200, y: 150 },
        4,
      ),
    ).toEqual({ x: -32, y: -2 });
    expect(
      adjustOffset(
        //
        { row: 38, col: 58 },
        { x: 200, y: 150 },
        5,
      ),
    ).toEqual({ x: -90, y: -40 });
  });
});

describe("newFaunaDataFromRle", () => {
  test("should return empty state", () => {
    let res = newFaunaDataFromRle("");

    expect(res.getPopulation()).toEqual(0);
    expect(res.getTime()).toEqual(0);
    expect(res.getBounds()).toEqual(null);
  });

  test("should work", () => {
    let res = newFaunaDataFromRle("b2ob$o2bo$b3o!");

    expect(res.getPopulation()).toEqual(7);
    expect(res.getTime()).toEqual(0);
    expect(res.getBounds()).toEqual({ bottom: 2, left: 0, right: 3, top: 0 });
  });
});
