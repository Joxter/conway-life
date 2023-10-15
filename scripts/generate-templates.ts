import fs from "fs";
import path from "node:path";
import { PATTERN_COLS, PatternRow, PatternTypeNames } from "../src/types";
import { parseRleFile } from "../src/importExport/utils";
import { typeByRle } from "../src/microscope/tools";

let patternsFolderPath = path.join(import.meta.dir, "../public/patterns");
let outputFilePath = path.join(import.meta.dir, "../src/all-templates.ts");

let startTime = Date.now();
run(patternsFolderPath, outputFilePath);
let endTime = Date.now();
console.log("Done in", formatTimeSec(endTime - startTime), "sec");

function run(folder: string, output: string) {
  let patternsNames: Record<string, number> = {};
  let patterns: PatternRow[] = [];

  let patternTypesStat: Record<PatternTypeNames, number> = {
    "still-live": 0,
    oscillator: 0,
    ship: 0,
    gun: 0,
    unknown: 0,
    "died-at": 0,
  };
  let total: Record<string, number> = {};

  fs.readdirSync(folder)
    // .slice(0, 20)
    .forEach((fileName: string, i: number, all: string[]) => {
      if (i % 500 === 0) {
        // progress
        let percent = Math.round((i / all.length) * 100);
        console.log(`${percent}% ${i}/${all.length}`);
      }

      if (fileName.endsWith(".cells")) {
        console.warn("Skip .cells file", fileName);
      } else if (fileName.endsWith(".rle")) {
        let noExtName = fileName.slice(0, -4);

        let filePath = path.join(folder, fileName);
        let content = fs.readFileSync(filePath, "utf8").toString();

        let { rle, ...res } = parseRleFile(content, fileName);
        if (res.population === 0) {
          // console.error(`Failed to parse rle "${rle.slice(0, 20)}..."\n Err: ${err}`);
          return;
        }

        let limit = res.population < 100 ? 300 : res.population < 500 ? 100 : 10;

        // let start = Date.now();
        let type = typeByRle(rle, limit).unwrap().unwrap();
        // let time = formatTimeSec(Date.now() - start);
        // total[time] = total[time] ? total[time] + 1 : 1;

        res.type = type;
        patternTypesStat[type.name]++;

        patterns.push(PATTERN_COLS.map((colName) => res[colName]) as PatternRow);
        patternsNames[fileName] = patterns.length - 1;
      }
    });

  console.log("Types: ");
  console.log(JSON.stringify(patternTypesStat));
  // console.log("Time stat sorted by asc:");
  // console.log(JSON.stringify(sortTimes(total)));

  let fileContent = `import { PatternNoRle, Pattern, PATTERN_COLS } from "./types";

// prettier-ignore
// @ts-ignore
let patterns: PatternNoRle[] = ${JSON.stringify(patterns)};
// prettier-ignore
let patternsNames: Record<string, number> = ${JSON.stringify(patternsNames)};

// TODO optimise
// @ts-ignore
export let allTemplates: Record<string, Omit<Pattern, "rle">> = Object.fromEntries(
  Object.keys(patternsNames).map((fileNames) => {
    let patData = patterns[patternsNames[fileNames]];

    let pat = {};
    PATTERN_COLS.forEach((colName, i) => {
      // @ts-ignore
      pat[colName] = patData[i];
    });
    return [fileNames, pat];
  }),
);
`;

  // fs.writeFileSync(output, fileContent);
}

function sortTimes(times: Record<string, number>) {
  return Object.fromEntries(Object.entries(times).sort((a, b) => Number(a[0]) - Number(b[0])));
}

function formatTimeSec(durationMsec: number) {
  return (durationMsec / 1000).toFixed(3);
}

/*

=== 13 oct
let limit = res.population < 100 ? 300 : res.population < 500 ? 100 : 10;
Types: {"still-live":580,"oscillator":1572,"ship":235,"unknown":1961,"died-at":53}
Done in 53.826 sec

=== 15 oct
+ hashlife
Types: {"still-live":580,"oscillator":1572,"ship":235,"unknown":1961,"died-at":53}
Done in 30.354 sec

+ gun
Types: {"still-live":580,"oscillator":1572,"ship":235,"gun":74,"unknown":1887,"died-at":53}
Done in 32.677 sec

*/
