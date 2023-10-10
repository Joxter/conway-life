//                X → to left (col)
//                Y ↓ to bottom (row)
export type XY = { x: number; y: number };
export type Coords = [x: number, y: number];
export type Field = Coords[];

export type Size = { left: number; right: number; top: number; bottom: number };

export type PatternTypes = { name: "still-live" } | { name: "oscillator"; period: number };
export type PatternTypeNames = "still-live" | "oscillator";

export type Pattern = {
  fileName: string;
  rawName: string;
  name: string;
  comment: string;
  author: string;
  wikiLink: string;
  patternLink: string;
  population: number; // population growth maximum "*2.999...4" speed
  size: [x: number, y: number];
  rule: string;
  rle: string;
  type: PatternTypes | null;
};
