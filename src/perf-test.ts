import { newMakeGo } from "./utils";
import path from "node:path";
import fs from "fs";
import { parseRleFile, rleToFauna } from "./importExport/utils";

let heavyPatterns = ["universalturingmachine.rle"];

heavyPatterns.forEach((name) => {
  let patternPath = path.join(import.meta.dir, "../public/patterns", name);
  let content = fs.readFileSync(patternPath, "utf8").toString();

  let { rle } = parseRleFile(content, name);

  let fauna = rleToFauna(rle).unwrap().fauna;

  let total = 0;
  for (let i = 0; i < 10; i++) {
    let res = newMakeGo(fauna);
    console.log(res.time, res.size);
    fauna = res.fauna;
    total += res.time;
  }
  console.log(total); // naive but ok
});
