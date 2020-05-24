const {
  ubuntuTemplateVmName,
} = require('../shared/constants');
const govc = require('../shared/govc');
const logger = require('../shared/logger');

const destroy = async () => {
  logger.info(`Checking for Vm with name '${ubuntuTemplateVmName}'`);
  const templateVmInfoResponse = await govc(`vm.info -json "${ubuntuTemplateVmName}"`);
  const templateVmInfo = JSON.parse(templateVmInfoResponse);
  if (templateVmInfo.VirtualMachines && templateVmInfo.VirtualMachines.length > 0) {
    logger.info(`Existing Vm with name '${ubuntuTemplateVmName}' found; deleting`);
    await govc(`vm.destroy "${ubuntuTemplateVmName}"`);
  }
};

module.exports = destroy;
