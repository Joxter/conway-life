export const Color1 = '#5583e5';
export const Color2 = '#79e555';

export const cellSizes = [1, 35] as const;
export const initCellSize = 20;

export type ColRow = { col: number; row: number; };
export type FieldCell = 0 | 1 | 2;
export type Field = { val: FieldCell; col: number; row: number; }[];

export type CoordsStr = `${number}|${number}`; // COL, ROW
export type Fauna = Map<CoordsStr, FieldCell>; // x y value
export type FaunaInc = Map<CoordsStr, [number, number]>; // [color1 count,color2 count]
export type SavedFauna = Array<[CoordsStr, FieldCell]>;
