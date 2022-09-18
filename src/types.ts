export const Color1 = '#5583e5';
export const Color2 = '#79e555';

export const cellSizes = [5, 10, 20, 30, 40];
export const initCellSize = cellSizes[2];

export type FieldCell = 0 | 1 | 2;
export type Field = { val: FieldCell; col: number; row: number; }[];

export type CoordsStr = `${number}|${number}`; // COL, ROW
export type Fauna = Map<CoordsStr, FieldCell>; // x y value
export type FaunaInc = Map<CoordsStr, [number, number]>; // [color1 count,color2 count]
export type SavedFauna = Array<[CoordsStr, FieldCell]>;
