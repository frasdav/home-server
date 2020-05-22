const fs = require('fs');
const { promisify } = require('util');

const { createWriteStream } = fs;
const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

module.exports = {
  createWriteStream,
  exists,
  readFile,
  writeFile,
};
