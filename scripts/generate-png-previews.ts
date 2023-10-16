import fs from "fs";

// @ts-ignore
import { PNG } from "pngjs";
import { parseRle, parseNormRleFile } from "../src/importExport/utils";
import path from "node:path";
import { Result } from "@sniptt/monads";

let patternsFolderPath = path.join(import.meta.dir, "../public/patterns");
let outputFolderPath = path.join(import.meta.dir, "../public/png");

run(patternsFolderPath, outputFolderPath);

function run(folder: string, output: string) {
  fs.readdirSync(folder)
    // .slice(0, 20)
    .forEach((fileName) => {
      if (fileName.startsWith("__")) {
        console.log("skipped", fileName);
        return;
      }

      if (fileName.endsWith(".rle")) {
        let noExtName = fileName.slice(0, -4);
        let content = fs.readFileSync(`${folder}/${fileName}`, "utf8").toString();

        let { rle, size } = parseNormRleFile(content, fileName);

        // console.log(fileName);
        rleToGrid(rle, size).match({
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

function rleToGrid(rle: string, [width, height]: [number, number]): Result<boolean[][], string> {
  let maxSize = 500;

  let scale = Math.max(width, height) / maxSize;
  scale = scale < 1 ? 1 : scale;

  let grid: boolean[][] = Array(Math.floor(height / scale))
    .fill(0)
    .map(() => {
      return Array(Math.floor(width / scale)).fill(false);
    }); // todo actually I don't need a grid here

  let res = parseRle(rle, (x, y) => {
    x = Math.floor(x / scale);
    y = Math.floor(y / scale);
    if (!grid[y]) {
      grid[y] = [];
    }
    grid[y][x] = true;
  });

  return res.map(() => grid);
}
