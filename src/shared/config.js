const YAML = require('yaml');
const { exec } = require('./shell');

const getConfig = async (configFilePath) => {
  const configStr = await exec(`sops --decrypt ${configFilePath}`);
  return YAML.parse(configStr);
};

module.exports = {
  getConfig,
};
