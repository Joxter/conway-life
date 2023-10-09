import fs from "fs";
import path from "node:path";
import { Pattern } from "../src/types";
import { parseRleFile } from "../src/importExport/utils";
import { typeByRle } from "../src/microscope/tools";

let patternsFolderPath = path.join(import.meta.dir, "../public/patterns");
let outputFilePath = path.join(import.meta.dir, "all-templates.ts");

let startTime = Date.now();
run(patternsFolderPath, outputFilePath);
let endTime = Date.now();
console.log("Done in", ((endTime - startTime) / 1000).toFixed(3), "sec");

function run(folder: string, output: string) {
  let names: Record<string, Omit<Pattern, "rle">> = {};

  let patternTypesStat = { "still-live": 0, oscillator: 0, none: 0 };

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
        // console.log(fileName);

        let filePath = path.join(folder, fileName);
        let content = fs.readFileSync(filePath, "utf8").toString();

        let { rle, ...res } = parseRleFile(content, fileName);

        let type =
          res.population < 100
            ? typeByRle(rle, 300)
            : res.population < 300
            ? typeByRle(rle, 100)
            : res.population < 1000
            ? typeByRle(rle, 1)
            : null;

        res.type = type;

        if (type?.name === "still-live") {
          patternTypesStat["still-live"]++;
        } else if (type?.name === "oscillator") {
          patternTypesStat["oscillator"]++;
        } else {
          patternTypesStat["none"]++;
        }

        names[fileName] = res;
      }
    });

  console.log("Types: ");
  console.log(patternTypesStat);

  let fileContent = `import { Pattern } from "../types";

// prettier-ignore
export let allTemplates: Record<string, Omit<Pattern, "rle">> = ${JSON.stringify(names)};
  `;

  fs.writeFileSync(output, fileContent);
}
