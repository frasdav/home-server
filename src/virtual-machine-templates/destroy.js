const { getConfig } = require('../shared/config');
const govc = require('../shared/govc');
const logger = require('../shared/logger');

const {
  configFilePath,
  ubuntuTemplateVmName,
} = require('../shared/constants');

const destroy = async () => {
  const config = await getConfig(configFilePath);

  logger.info(`Checking for Vm with name '${ubuntuTemplateVmName}'`);
  const templateVmInfoResponse = await govc(`vm.info -json "${ubuntuTemplateVmName}"`, config);
  const templateVmInfo = JSON.parse(templateVmInfoResponse);
  if (templateVmInfo.VirtualMachines && templateVmInfo.VirtualMachines.length > 0) {
    logger.info(`Existing Vm with name '${ubuntuTemplateVmName}' found; deleting`);
    await govc(`vm.destroy "${ubuntuTemplateVmName}"`, config);
  }
};

module.exports = destroy;
