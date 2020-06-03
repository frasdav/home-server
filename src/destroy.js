#!/usr/bin/env node

const { getConfig } = require('./shared/config');
const logger = require('./shared/logger');

const virtualMachineTemplates = require('./virtual-machine-templates');
const virtualMachines = require('./virtual-machines');

const {
  configFilePath,
} = require('./shared/constants');

const destroy = async () => {
  const config = await getConfig(configFilePath);
  await virtualMachines.destroy(config);
  await virtualMachineTemplates.destroy(config);
};

destroy()
  .then(() => process.exit())
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
