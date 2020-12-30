const { getConfig } = require('../shared/config');
const govc = require('../shared/govc');
const logger = require('../shared/logger');
const { templateVmExists } = require('../shared/vm');

const {
  configFilePath,
  ubuntuTemplateVmName,
} = require('../shared/constants');

const destroy = async () => {
  const config = await getConfig(configFilePath);

  logger.info(`Checking for Vm with name '${ubuntuTemplateVmName}'`);
  if (await templateVmExists(ubuntuTemplateVmName, config)) {
    logger.info(`Existing Vm with name '${ubuntuTemplateVmName}' found; deleting`);
    await govc(`vm.destroy "${ubuntuTemplateVmName}"`, config);
  }
};

module.exports = destroy;
