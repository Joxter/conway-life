export const Color1 = "#5583e5";

export type ColRow = { col: number; row: number };

//                X → to left (col)
//                Y ↓ to bottom (row)
export type XY = { x: number; y: number };
export type FieldCell = 1;
export type Field = Coords[];

export type Coords = [x: number, y: number]; // COL, ROW // x: col, y: row

//                      x (col)     y (row)
export type Fauna = Map<number, Map<number, FieldCell>>; // x y value TODO: refactor to Map<x, Set<y>>
export type FaunaInc = Map<number, Map<number, [number, number]>>; // [color1 count,color2 count]

export type Pattern = {
  fileName: string;
  rawName: string;
  name: string;
  comment: string;
  author: string;
  wikiLink: string;
  patternLink: string;
  population: number;
  size: [x: number, y: number];
  rule: string;
  rle: string;
};
