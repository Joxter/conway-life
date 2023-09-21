import fs from "fs";

// @ts-ignore
import { PNG } from "pngjs";
import { cellsToGrid, rleToGrid } from "../src/importExport/utils";

run("../patterns", "../public/previews");

function run(folder: string, output: string) {
  fs.readdirSync(folder)
    // .slice(0, 20)
    .forEach((fileName) => {
      if (fileName.startsWith("__")) {
        console.log("skipped", fileName);
        return;
      }

      if (fileName.endsWith(".cells")) {
        let noExtName = fileName.slice(0, -6);
        let content = fs.readFileSync(`${folder}/${fileName}`, "utf8").toString();

        content = content
          .split("\n")
          .filter((line) => !line.startsWith("!"))
          .join("\n");

        // todo proper parse functions
        let grid = cellsToGrid(content.trim());

        // generateImage(grid, `${output}/${noExtName}.png`);
      } else if (fileName.endsWith(".rle")) {
        let noExtName = fileName.slice(0, -4);
        let content = fs.readFileSync(`${folder}/${fileName}`, "utf8").toString();
        content = content
          .split("\n")
          .filter((line) => !line.startsWith("#") && !line.startsWith("x ="))
          .join("\n");

        // todo proper parse functions
        rleToGrid(content.trim()).match({
          ok: (grid) => {
            generateImage(grid, `${output}/${noExtName}.png`);
          },
          err: (text) => {
            console.warn(fileName, text);
          },
        });
      }
    });
}

function getBuffer(grid: boolean[][]) {
  let width = grid[0].length;
  let height = grid.length;

  const BLACK = 0;
  const WHITE = 65535;

  let buffer = Buffer.alloc(2 * width * height);
  let bitmap = new Uint16Array(buffer.buffer);

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      bitmap[i * width + j] = grid[i][j] ? BLACK : WHITE;
    }
  }

  return { width, height, buffer };
}

function generateImage(grid: boolean[][], fileName: string) {
  let { width, height, buffer } = getBuffer(grid);

  let png = new PNG({
    width,
    height,
    bitDepth: 16,
    colorType: 0,
    inputColorType: 0,
    inputHasAlpha: false,
  });

  png.data = buffer;
  png.pack().pipe(fs.createWriteStream(fileName));
}
