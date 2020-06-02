#!/usr/bin/env node

const { getConfig } = require('./shared/config');
const logger = require('./shared/logger');

const virtualMachineTemplate = require('./virtual-machine-template');
const virtualMachines = require('./virtual-machines');

const {
  configFilePath,
} = require('./shared/constants');

const deploy = async () => {
  const config = await getConfig(configFilePath);
  await virtualMachineTemplate.deploy(config);
  await virtualMachines.deploy(config);
};

deploy()
  .then(() => process.exit())
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
