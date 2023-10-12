import { expect, test, describe } from "bun:test";
import { adjustOffset } from "./utils";

describe("adjustOffset", () => {
  test("basic", () => {
    expect(
      adjustOffset(
        //
        { x: 40, y: 60 },
        { x: 200, y: 150 },
        4,
        5,
      ),
    ).toEqual({ x: 168, y: 132 });
    expect(
      adjustOffset(
        //
        { x: 40, y: 60 },
        { x: 168, y: 132 },
        5,
        4,
      ),
    ).toEqual({ x: 200, y: 150 });
  });
});
