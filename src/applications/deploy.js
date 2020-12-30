const {
  buildInventory,
  getPlaybook,
} = require('./helpers/ansible');
const { getConfig } = require('../shared/config');
const logger = require('../shared/logger');

const {
  configFilePath,
} = require('../shared/constants');

const deploy = async () => {
  const config = await getConfig(configFilePath);

  await buildInventory(config);

  const playbook = await getPlaybook();

  logger.info('Executing Ansible playbook with tag \'deploy\'');
  playbook.tags('deploy');
  await playbook.exec({ cwd: `${__dirname}/ansible` });
};

module.exports = deploy;
