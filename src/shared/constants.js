const path = require('path');

const configFilePath = path.join(__dirname, '../config.enc.yml');

const ubuntuVersion = '20.04';
const ubuntuTemplateVmName = `Ubuntu ${ubuntuVersion}`;
const ubuntuCloudImageOvaName = `ubuntu-${ubuntuVersion}-server-cloudimg-amd64.ova`;
const ubuntuCloudImageOvaUrl = `https://cloud-images.ubuntu.com/releases/${ubuntuVersion}/release/${ubuntuCloudImageOvaName}`;

module.exports = {
  configFilePath,
  ubuntuCloudImageOvaName,
  ubuntuCloudImageOvaUrl,
  ubuntuTemplateVmName,
};
