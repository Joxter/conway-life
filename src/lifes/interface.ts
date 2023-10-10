import { Coords, Size } from "../types";

export interface IFauna<T = any> {
  setCell: (x: number, y: number, live: boolean) => any;
  getCell: (x: number, y: number) => boolean;
  toggleCell: (x: number, y: number) => any;
  nextGen: () => any; // todo add optional step?
  getCells: () => Coords[]; // todo add frame

  getTime: () => number; // last calc msec
  getPopulation: () => number;
  getGeneration: () => number;
  getBounds: () => Size | null; // null for empty life

  serialise: () => T;
  deserialise: (data: T) => void;
}
