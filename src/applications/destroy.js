const {
  buildInventory,
  getPlaybook,
} = require('./helpers/ansible');
const { getConfig } = require('../shared/config');
const logger = require('../shared/logger');

const {
  configFilePath,
} = require('../shared/constants');

const destroy = async () => {
  const config = await getConfig(configFilePath);

  await buildInventory(config);

  const playbook = await getPlaybook();

  logger.info('Executing Ansible playbook with tag \'destroy\'');
  playbook.tags('destroy');
  await playbook.exec({ cwd: `${__dirname}/ansible` });
};

module.exports = destroy;
