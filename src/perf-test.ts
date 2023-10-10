import { nextGen } from "./calcNextGen";
import path from "node:path";
import fs from "fs";
import { parseRle, parseRleFile, rleToFauna } from "./importExport/utils";
import { Result } from "@sniptt/monads";
import { LifeUniverse, redraw } from "./hashlife";

let heavyPatterns = ["universalturingmachine.rle"];

heavyPatterns.forEach((name) => {
  let patternPath = path.join(import.meta.dir, "../public/patterns", name);
  let content = fs.readFileSync(patternPath, "utf8").toString();

  let { rle } = parseRleFile(content, name);

  let fauna = rleToFauna(rle).unwrap().fauna;

  let total = 0;
  for (let i = 0; i < 1000; i++) {
    let res = nextGen(fauna);
    if (i % 50 === 0) {
      console.log(i, res.population);
    }
    fauna = res.fauna;
    total += res.time;
  }
  console.log("my time", (total / 1000).toFixed(3), "sec"); // naive but ok
  console.log("-------------");

  // let start = Date.now();
  // let hLife = rleToHashlife(rle).unwrap();
  // hLife.fauna.set_step(8);
  //
  // const time = Date.now() - start;
  // console.log("initTime", (time / 1000).toFixed(3), "sec");
  //
  // let total2 = 0;
  // for (let i = 0; i < 1000; i++) {
  //   let start = Date.now();
  //   hLife.fauna.next_generation(true);
  //   const time = Date.now() - start;
  //   if (i % 50 === 0) {
  //     console.log(i, hLife.fauna.root!.population, hLife.fauna.generation);
  //   }
  //   total2 += time;
  // }
  // console.log((total2 / 1000).toFixed(3), "sec");
});

/*
let life = new LifeUniverse();

life.set_bit(1, 1, true);
life.set_bit(2, 2, true);
life.set_bit(2, 3, true);
life.set_bit(3, 2, true);
life.set_bit(3, 1, true);
life.set_step(8);

setInterval(() => {
  let start = Date.now();

  console.log("----------");
  console.log("life.generation,", life.generation);
  // console.log("life.step,", life.step);
  // console.log("life.hashmap_size,", life.hashmap_size);
  // console.log("life.get_root_bounds(),", life.get_root_bounds());
  // console.log("life.root.population", life.root!.population);
  // console.log("life.root.level", life.root!.level);
  // redraw(life.root!);
  // console.log(redraw(life.root!));
  // console.log(JSON.stringify(life.get_field(life.root!)));
  console.log(life.get_field(life.root!).length);

  life.next_generation(true);
  console.log(
    "life. (size) ",
    Math.pow(2, life.root!.level - 1),
    ((Date.now() - start) / 1000).toFixed(3),
  );
}, 10);
*/

export function rleToHashlife(
  rle: string,
): Result<{ fauna: LifeUniverse; population: number }, string> {
  let fauna = new LifeUniverse();

  let res = parseRle(rle, (x, y) => {
    fauna.set_bit(x, y, true);
  });

  return res.map(() => {
    return { fauna, population: fauna.root!.population };
  });
}
