export const Color1 = '#5583e5';
export const Color2 = '#79e555';

export type FieldCell = 0 | 1 | 2;
export type Field = FieldCell[][];

export type CoordsStr = `${number}|${number}`;
export type Fauna = Map<CoordsStr, FieldCell>; // x y value
export type FaunaInc = Map<CoordsStr, [number, number]>; // [color1 count,color2 count]
