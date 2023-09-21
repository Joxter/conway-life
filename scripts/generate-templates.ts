import fs from "fs";

run("../public/patterns", "all-templates.ts");

function run(folder: string, output: string) {
  let names: string[] = [];

  fs.readdirSync(folder)
    // .slice(0, 20)
    .forEach((fileName) => {
      if (fileName.endsWith(".cells")) {
        let noExtName = fileName.slice(0, -6);

        names.push(noExtName);
      } else if (fileName.endsWith(".rle")) {
        let noExtName = fileName.slice(0, -4);

        names.push(noExtName);
      }
    });

  let fileContent = `
export let allTemplates: string[] = ${JSON.stringify(names, null, 2)};
  `;

  fs.writeFileSync(output, fileContent);
}
