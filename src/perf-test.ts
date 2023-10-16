import path from "node:path";
import fs from "fs";
import { parseNormRleFile, rleToFauna } from "./importExport/utils";

let heavyPatterns = ["universalturingmachine.rle"];

heavyPatterns.forEach((name) => {
  let patternPath = path.join(import.meta.dir, "../public/patterns", name);
  let content = fs.readFileSync(patternPath, "utf8").toString();

  let { rle } = parseNormRleFile(content, name);

  let fauna = rleToFauna(rle).unwrap();

  let total = 0;
  for (let i = 0; i < 1000; i++) {
    fauna.nextGen();
    if (i % 50 === 0) {
      console.log(i, fauna.getPopulation());
    }
    total += fauna.getTime();
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
