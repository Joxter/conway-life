export const RENDER_MODE: 'svg' | 'html' = 'svg';

export const Color1 = '#5583e5';
export const Color2 = '#79e555';

export const cellSizes = [1, 35] as const;
export const initCellSize = 2;

export type ColRow = { col: number; row: number; };
export type FieldCell = 0 | 1 | 2;
export type Field = { val: FieldCell; col: number; row: number; }[];

export type CoordsStr = `${number}|${number}`; // COL, ROW
export type Coords = [number, number]; // COL, ROW
export type Fauna = Map<number, Map<number, FieldCell>>; // x y value
export type FaunaInc = Map<number, Map<number, [number, number]>>; // [color1 count,color2 count]
export type SavedFauna = Array<[CoordsStr, FieldCell]>;

export type Pattern = {
  name: string;
  link: string;
  rle: string;
};
