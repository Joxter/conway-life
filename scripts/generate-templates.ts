import fs from "fs";
import path from "node:path";
import { Pattern } from "../src/types";
import { parseRleFile } from "../src/importExport/utils";

let patternsFolderPath = path.join(import.meta.dir, "../public/patterns");
let outputFilePath = path.join(import.meta.dir, "all-templates.ts");
run(patternsFolderPath, outputFilePath);

function run(folder: string, output: string) {
  let names: Record<string, Omit<Pattern, "rle">> = {};

  fs.readdirSync(folder)
    // .slice(0, 20)
    .forEach((fileName) => {
      if (fileName.endsWith(".cells")) {
        console.warn("Skip .cells file", fileName);
      } else if (fileName.endsWith(".rle")) {
        let noExtName = fileName.slice(0, -4);

        let filePath = path.join(folder, fileName);
        let content = fs.readFileSync(filePath, "utf8").toString();

        let { rle, ...res } = parseRleFile(content, fileName);

        names[fileName] = res;
      }
    });

  let fileContent = `import { Pattern } from "../types";

// prettier-ignore
export let allTemplates: Record<string, Omit<Pattern, "rle">> = ${JSON.stringify(names)};
  `;

  fs.writeFileSync(output, fileContent);
}
