const got = require('got');
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');

const { getConfig } = require('../shared/config');
const {
  createWriteStream,
  exists,
  readFile,
  writeFile,
} = require('../shared/fs');
const govc = require('../shared/govc');
const logger = require('../shared/logger');
const { templateVmExists, waitForVmPoweredOff } = require('../shared/vm');

const {
  configFilePath,
  ubuntuCloudImageOvaName,
  ubuntuCloudImageOvaUrl,
  ubuntuTemplateVmName,
} = require('../shared/constants');

const pipeline = promisify(stream.pipeline);

const downloadOva = async (ovaName, ovaUrl) => {
  const ovaPath = path.join(__dirname, ovaName);

  logger.info(`Checking for Ova with name'${ovaName}' at path '${ovaPath}'`);
  if (!(await exists(ovaPath))) {
    logger.info(`Existing Ova with name '${ovaName}' not found; downloading Ova from '${ovaUrl}'`);
    await pipeline(
      got.stream(ovaUrl),
      createWriteStream(ovaPath),
    );
  }

  return ovaPath;
};

const getTemplateSpec = async (ovaPath, config) => {
  logger.info(`Exporting spec from Ova '${ovaPath}'`);
  const ovaSpecResponse = await govc(`import.spec ${ovaPath}`, config);
  return JSON.parse(ovaSpecResponse);
};

const deployUbuntu = async (ovaPath, config) => {
  const cloudInitData = await readFile(path.join(__dirname, 'cloud-config.yml'));
  const base64CloudInitData = cloudInitData.toString('base64');

  const ovaSpec = await getTemplateSpec(ovaPath, config);
  ovaSpec.Name = ubuntuTemplateVmName;
  ovaSpec.PropertyMapping.find((p) => p.Key === 'hostname').Value = '';
  ovaSpec.PropertyMapping.find((p) => p.Key === 'user-data').Value = base64CloudInitData;
  ovaSpec.NetworkMapping.find((p) => p.Name === 'VM Network').Network = 'VM Network';

  const ovaSpecPath = `${ovaPath}.json`;
  await writeFile(ovaSpecPath, JSON.stringify(ovaSpec, null, 2));

  logger.info(`Creating Vm with name '${ubuntuTemplateVmName}' using Ova ${ovaPath} and spec '${ovaSpecPath}'`);
  await govc(`import.ova -options=${ovaSpecPath} ${ovaPath}`, config);

  logger.info(`Upgrading version for Vm with name '${ubuntuTemplateVmName}' to '15'`);
  await govc(`vm.upgrade -vm "${ubuntuTemplateVmName}" -version=15`, config);

  logger.info(`Enabling disk Uuid for Vm with name '${ubuntuTemplateVmName}'`);
  await govc(`vm.change -vm "${ubuntuTemplateVmName}" -e="disk.enableUUID=1"`, config);

  logger.info(`Removing floppy device from Vm with name '${ubuntuTemplateVmName}'`);
  await govc(`device.remove -vm "${ubuntuTemplateVmName}" floppy-8000`, config);

  logger.info(`Adding serial device to Vm with name '${ubuntuTemplateVmName}'`);
  await govc(`device.serial.add -vm "${ubuntuTemplateVmName}"`, config);

  logger.info(`Powering on Vm with name '${ubuntuTemplateVmName}'`);
  await govc(`vm.power -on=true "${ubuntuTemplateVmName}"`, config);

  logger.info(`Waiting for Vm with name '${ubuntuTemplateVmName}' to power off`);
  await waitForVmPoweredOff(ubuntuTemplateVmName, config);

  logger.info(`Marking Vm with name '${ubuntuTemplateVmName}' as template`);
  await govc(`vm.markastemplate "${ubuntuTemplateVmName}"`, config);
};

const deploy = async () => {
  const config = await getConfig(configFilePath);

  logger.info(`Checking for existing Vm with name '${ubuntuTemplateVmName}'`);
  if (!(await templateVmExists(ubuntuTemplateVmName, config))) {
    logger.info(`Existing Vm with name '${ubuntuTemplateVmName}' not found`);
    const ovaPath = await downloadOva(ubuntuCloudImageOvaName, ubuntuCloudImageOvaUrl);
    await deployUbuntu(ovaPath, config);
  }
};

module.exports = deploy;
