const path = require("path");
const _fs = require("fs");
const { merge } = require("lodash");

function mergeJsonInFolder(folder) {
  const files = _fs
    .readdirSync(folder)
    .filter(
      (elem) =>
        _fs.statSync(path.join(folder, elem)).isFile() && elem.endsWith(".json")
    );

  const result = files.reduce((result, file) => {
    try {
      const content = _fs.readFileSync(path.join(folder, file));
      const obj = JSON.parse(content);
      result = merge(result, obj);
    } catch (error) {
      console.error("failed to parse file %s", file, error);
    }
    return result;
  }, {});

  return result;
}

module.exports = mergeJsonInFolder;
