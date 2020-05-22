const {
  govcEnv,
} = require('./constants');
const { exec } = require('./shell');

const govc = (cmd) => exec(`govc ${cmd}`, {
  env: govcEnv,
});

module.exports = govc;
