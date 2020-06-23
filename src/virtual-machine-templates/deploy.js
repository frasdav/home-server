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
const { waitForVmPoweredOff } = require('../shared/vm');

const {
  configFilePath,
  ubuntuCloudImageOvaName,
  ubuntuCloudImageOvaUrl,
  ubuntuTemplateVmName,
} = require('../shared/constants');

const pipeline = promisify(stream.pipeline);

const deploy = async () => {
  const config = await getConfig(configFilePath);

  const ubuntuCloudImageOvaPath = path.join(__dirname, ubuntuCloudImageOvaName);

  logger.info(`Checking for Ova at path '${ubuntuCloudImageOvaPath}'`);
  if (!(await exists(ubuntuCloudImageOvaPath))) {
    logger.info(`Existing Ova not found; downloading Ova from '${ubuntuCloudImageOvaUrl}'`);
    await pipeline(
      got.stream(ubuntuCloudImageOvaUrl),
      createWriteStream(ubuntuCloudImageOvaPath),
    );
  }

  logger.info(`Checking for existing Vm with name '${ubuntuTemplateVmName}'`);
  const templateVmInfoResponse = await govc(`vm.info -json "${ubuntuTemplateVmName}"`, config);
  const templateVmInfo = JSON.parse(templateVmInfoResponse);
  if (templateVmInfo.VirtualMachines && templateVmInfo.VirtualMachines.length > 0) {
    logger.info(`Existing Vm with name '${ubuntuTemplateVmName}' found`);
    return;
  }

  const cloudInitData = await readFile(path.join(__dirname, 'cloud-config.yml'));
  const base64CloudInitData = cloudInitData.toString('base64');

  logger.info(`Exporting spec from Ova '${ubuntuCloudImageOvaPath}'`);
  const ubuntuCloudImageOvaSpecResponse = await govc(`import.spec ${ubuntuCloudImageOvaPath}`, config);
  const ubuntuCloudImageOvaSpec = JSON.parse(ubuntuCloudImageOvaSpecResponse);
  ubuntuCloudImageOvaSpec.Name = ubuntuTemplateVmName;
  ubuntuCloudImageOvaSpec.PropertyMapping.find((p) => p.Key === 'hostname').Value = '';
  ubuntuCloudImageOvaSpec.PropertyMapping.find((p) => p.Key === 'user-data').Value = base64CloudInitData;
  ubuntuCloudImageOvaSpec.NetworkMapping.find((p) => p.Name === 'VM Network').Network = 'VM Network';

  const ubuntuCloudImageOvaSpecPath = `${ubuntuCloudImageOvaPath}.json`;
  await writeFile(ubuntuCloudImageOvaSpecPath, JSON.stringify(ubuntuCloudImageOvaSpec, null, 2));

  logger.info(`Creating Vm with name '${ubuntuTemplateVmName}' using Ova ${ubuntuCloudImageOvaPath} and spec '${ubuntuCloudImageOvaSpecPath}'`);
  await govc(`import.ova -options=${ubuntuCloudImageOvaSpecPath} ${ubuntuCloudImageOvaPath}`, config);

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

module.exports = deploy;
