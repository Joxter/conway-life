const fs = require("fs");
const path = require("path");

/*
to chatGPT:
  hi, I have a folder with a lof of files. Some of the files have the same name, but different
  extensions. Like: foo.cells, foo.rle, bar.cells, bar.rle. Could you write a JS script to
  remove all ***.cells variants?
*/
const folderPath = "../public/patterns2";

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  // Filter out files with the ".cells" extension
  const cellFiles = files.filter((file) => path.extname(file) === ".cells");

  // Delete the filtered files
  cellFiles.forEach((file) => {
    const filePath = path.join(folderPath, file);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file ${filePath}:`, err);
      } else {
        console.log(`Deleted file: ${filePath}`);
      }
    });
  });
});
