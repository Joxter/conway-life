//                X → to left (col)
//                Y ↓ to bottom (row)
export type XY = { x: number; y: number };
export type Coords = [x: number, y: number];
export type Field = Coords[];

export type Size = { left: number; right: number; top: number; bottom: number };

export type PatternTypes =
  | { name: "still-live" }
  | { name: "oscillator"; period: number }
  | { name: "will-die"; gen: number }
  | { name: "ship"; period: number } // add direction
  | { name: "gun"; period: number }
  | { name: "unknown" };

export const AllPatTypes = [
  "still-live",
  "oscillator",
  "ship",
  "gun",
  "unknown",
  "will-die",
] as const;

export type PatternTypeNames = (typeof AllPatTypes)[number];

export type Pattern = {
  fileName: string;
  rawName: string;
  name: string;
  comment: string[];
  author: string[];
  wikiLink: string;
  patternLink: string;
  population: number; // the population grows with a coefficient of x2.999...4 maximum
  size: [x: number, y: number];
  rule: string;
  rle: string;
  type: PatternTypes | null;
};

export type PatternNoRle = Omit<Pattern, "rle">;

export const PATTERN_COLS = [
  "fileName",
  "rawName",
  "name",
  "comment",
  "author",
  "wikiLink",
  "patternLink",
  "population",
  "size",
  "rule",
  "type",
] as const;

export type PatternRow = [
  Pattern["fileName"],
  Pattern["rawName"],
  Pattern["name"],
  Pattern["comment"],
  Pattern["author"],
  Pattern["wikiLink"],
  Pattern["patternLink"],
  Pattern["population"],
  Pattern["size"],
  Pattern["rule"],
  Pattern["type"],
];
