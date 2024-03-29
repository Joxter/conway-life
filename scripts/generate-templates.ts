import fs from "fs";
import path from "node:path";
import { PATTERN_COLS, PatternRow, PatternTypeNames } from "../src/types";
import { fixRleFile, parseNormRleFile, rleToFauna } from "../src/importExport/utils";
import { amountOfIslands, typeByRle } from "../src/microscope/tools";

let normInputPath = path.join(import.meta.dir, "../raw-patterns/all");
let normResultPath = path.join(import.meta.dir, "../public/patterns");
let outputAllTemplatePath = path.join(import.meta.dir, "../src/all-templates.ts");

let startTime = Date.now();
// normalizeRleFiles(normInputPath, normResultPath);

let res = sortPatternsByTypes(normResultPath);
// fs.writeFileSync(
//   //
//   outputAllTemplatePath,
//   getAllTemplateContent(res.patterns, res.patternsNames),
// );

let endTime = Date.now();

console.log("Done in", formatTimeSec(endTime - startTime), "sec");

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

=== 16 oct
+ norm patterns
Types: {"still-live":580,"oscillator":1569,"ship":234,"gun":74,"unknown":1851,"will-die":46}
Done in 32.504 sec

+ stable-at
Types: {"still-live":580,"oscillator":1569,"ship":234,"gun":74,"stable-at":447,"unknown":1404,"will-die":46}
Done in 198.597 sec

+ restore MyFauna
Types: {"still-live":580,"oscillator":1569,"ship":234,"gun":74,"stable-at":447,"unknown":1404,"will-die":46}
Done in 53.129 sec

+ add amountOfIslands
Types: {"still-live":580,"oscillator":1569,"ship":234,"gun":74,"stable-at":447,"unknown":1404,"will-die":46}
Done in 70.340 sec

*/

function normalizeRleFiles(inputFolder: string, output: string) {
  fs.mkdirSync(output, { recursive: true });

  let failed = 0;
  let ok = 0;

  fs.readdirSync(inputFolder)
    // .slice(0, 20)
    .forEach((fileName: string) => {
      let filePath = path.join(inputFolder, fileName);
      let content = fs.readFileSync(filePath, "utf8").toString();

      if (fileName.startsWith("README")) {
        fs.writeFileSync(path.join(output, fileName), content);
        return;
      }

      if (fileName.endsWith(".rle")) {
        fixRleFile(content).match({
          ok: (content) => {
            ok++;
            fs.writeFileSync(path.join(output, fileName), content);
          },
          err: (err) => {
            failed++;
            console.error(`File "${filePath} error: ${err}`);
          },
        });
      }
    });

  console.log("Failed:", failed);
  console.log("Ok:", ok);
}

function sortPatternsByTypes(folder: string) {
  let patternsNames: Record<string, number> = {};
  let patterns: PatternRow[] = [];

  let patternTypesStat: Record<PatternTypeNames, string[]> = {
    "still-live": [],
    oscillator: [],
    ship: [],
    gun: [],
    "stable-at": [],
    unknown: [],
    "will-die": [],
  };

  fs.readdirSync(folder)
    // .slice(0, 200)
    .forEach((fileName: string, i: number, all: string[]) => {
      // console.log(fileName);
      if (i % 200 === 0) {
        let percent = Math.round((i / all.length) * 100);
        console.log(`${percent}% ${i}/${all.length}`);
      }

      let filePath = path.join(folder, fileName);
      let content = fs.readFileSync(filePath, "utf8").toString();
      let { rle, ...res } = parseNormRleFile(content, fileName);

      let limit = res.population < 100 ? 300 : res.population < 500 ? 100 : 10;

      let type = typeByRle(rle, limit).unwrap().unwrap();

      res.type = type;
      res.islands = rleToFauna(rle)
        .map<number | null>((f) => amountOfIslands(f))
        .unwrapOr(null);

      // console.log(fileName, JSON.stringify(type));

      patternTypesStat[type.name].push(fileName);

      patterns.push(PATTERN_COLS.map((colName) => res[colName]) as PatternRow);
      patternsNames[fileName] = patterns.length - 1;
    });

  console.log("Types: ");
  let patternTypesCnt = Object.fromEntries(
    Object.entries(patternTypesStat)
      //
      .map(([name, arr]) => {
        return [name, arr.length];
      }),
  );

  console.log(JSON.stringify(patternTypesCnt));

  return { patterns, patternsNames };
}

function getAllTemplateContent(
  patterns: PatternRow[],
  patternsNames: Record<string, number>,
): string {
  return `import { PatternNoRle, Pattern, PATTERN_COLS } from "./types";

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
}
