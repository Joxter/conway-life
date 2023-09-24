import { expect, test, describe } from "bun:test";
import { adjustOffset, newFaunaDataFromRle } from "./utils";
import { None, Some } from "@sniptt/monads";

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

    expect(res).toEqual({
      fauna: new Map(),
      population: 0,
      size: None,
      time: 0,
    });
  });

  test("should work", () => {
    let res = newFaunaDataFromRle("b2ob$o2bo$b3o!");

    expect(res.population).toEqual(7);
    expect(res.time).toEqual(0);
    expect(res.size.unwrap()).toEqual({ bottom: 2, left: 0, right: 3, top: 0 });
  });
});
