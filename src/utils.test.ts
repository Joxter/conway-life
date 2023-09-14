// @ts-ignore
import { expect, test, describe } from "bun:test";
import { adjustOffset } from "./utils";

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
