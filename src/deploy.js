#!/usr/bin/env node

const { getConfig } = require('./shared/config');
const logger = require('./shared/logger');

const virtualMachineTemplates = require('./virtual-machine-templates');
const virtualMachines = require('./virtual-machines');

const {
  configFilePath,
} = require('./shared/constants');

const deploy = async () => {
  const config = await getConfig(configFilePath);
  await virtualMachineTemplates.deploy(config);
  await virtualMachines.deploy(config);
};

deploy()
  .then(() => process.exit())
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
