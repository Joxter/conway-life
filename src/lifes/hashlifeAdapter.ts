import { IFauna } from "./interface";
import { LifeUniverse } from "./hashlife";
import { Coords, Size } from "../types";

export class HashlifeAdapter implements IFauna<any> {
  universe: LifeUniverse;
  time: number;

  constructor() {
    this.universe = new LifeUniverse();
    this.time = 0;
  }

  setCell(x: number, y: number, live: boolean): any {
    this.universe.set_bit(x, y, live);
  }

  toggleCell(x: number, y: number): any {
    this.universe.set_bit(x, y, !this.universe.get_bit(x, y));
  }

  shallowClone() {
    let cloned = new HashlifeAdapter();
    cloned.universe = this.universe.clone();

    return cloned;
  }

  getCell(x: number, y: number): boolean {
    return this.universe.get_bit(x, y);
  }

  getBounds(): Size | null {
    return this.universe.get_root_bounds();
  }

  getSize() {
    let bounds = this.getBounds();
    if (!bounds) return [0, 0] as const;

    return [bounds.right - bounds.left + 1, bounds.bottom - bounds.top + 1] as const;
  }

  getCells(): Coords[] {
    return this.universe.get_field(this.universe.root!);
  }

  getGeneration(): number {
    return this.universe.generation;
  }

  getPopulation(): number {
    return this.universe.root!.population;
  }

  getTime(): number {
    return this.time;
  }

  nextGen(): any {
    let start = Date.now();
    this.universe.next_generation(true);
    this.time = Date.now() - start;
  }

  normalise(): void {
    throw new Error(`Method "normalise" not implemented.`);
  }

  serialise(): any {
    throw new Error(`Method "serialise" not implemented.`);
  }

  deserialise(data: any): void {
    throw new Error(`Method "deserialise" not implemented.`);
  }
}
