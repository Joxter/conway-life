// @ts-ignore
import { expect, test, describe } from "bun:test";
import { adjustOffset } from "./utils";

describe("adjustOffset", () => {
  test("offset outside, x2", () => {
    expect(
      adjustOffset(
        //
        { x: 5, y: 8 },
        { x: 40 / 2, y: 30 / 2 },
        2,
      ),
    ).toEqual({ x: -15, y: -7 });
  });
  test("offset outside, x0.5", () => {
    expect(
      adjustOffset(
        //
        { x: 5, y: 8 },
        { x: 40 / 2, y: 30 / 2 },
        0.5,
      ),
    ).toEqual({ x: 15, y: 15.5 });
  });

  test("offset inside, x2", () => {
    expect(
      adjustOffset(
        //
        { x: -5, y: -8 },
        { x: 40 / 2, y: 30 / 2 },
        2,
      ),
    ).toEqual({ x: -25, y: -23 });
  });
  test("offset inside, x0.5", () => {
    expect(
      adjustOffset(
        //
        { x: -5, y: -8 },
        { x: 40 / 2, y: 30 / 2 },
        0.5,
      ),
    ).toEqual({ x: 5, y: -0.5 });
  });
});
