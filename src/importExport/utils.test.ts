// @ts-ignore
import { describe, expect, test } from 'bun:test';

import { faunaToGrid, faunaToRle, getReactOfFauna, rleToFauna } from './utils';

let glider = 'bo$2bo$3o!';
let gliderGun = `24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!`;
let gliderGunTest = `24bo$22bobo$12b2o6b2o12b2o3$11bo3bo4b2o12b2o$2o8bo5bo3b2o6$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!`;

describe('rleToFauna', () => {
  test('faunaToGrid glider', () => {
    expect(faunaToGrid(rleToFauna(glider))).toEqual(
      `
.0.
..0
000`.trim()
    );
  });

  test('faunaToGrid gliderGun', () => {
    expect(faunaToGrid(rleToFauna(gliderGun))).toEqual(
      `
........................0...........
......................0.0...........
............00......00............00
...........0...0....00............00
00........0.....0...00..............
00........0...0.00....0.0...........
..........0.....0.......0...........
...........0...0....................
............00......................`.trim()
    );
  });

  test('faunaToGrid gliderGun (TEST)', () => {
    expect(faunaToGrid(rleToFauna(gliderGunTest))).toEqual(
      `
........................0...........
......................0.0...........
............00......00............00
....................................
....................................
...........0...0....00............00
00........0.....0...00..............
....................................
....................................
....................................
....................................
....................................
00........0...0.00....0.0...........
..........0.....0.......0...........
...........0...0....................
............00......................`.trim()
    );
  });

  test('getReactOfFauna', () => {
    expect(getReactOfFauna(rleToFauna(glider)))
      //
      .toEqual({ bottom: 2, left: 0, right: 2, top: 0 });
  });

  test('faunaToRle glider', () => {
    expect(faunaToRle(rleToFauna(glider)))
      //
      .toEqual(glider);
  });

  test('faunaToRle gliderGun', () => {
    expect(faunaToRle(rleToFauna(gliderGun)))
      //
      .toEqual(gliderGun);
  });
  test('faunaToRle gliderGun (TEST)', () => {
    expect(faunaToRle(rleToFauna(gliderGunTest)))
      //
      .toEqual(gliderGunTest);
  });
});
