#!/usr/bin/env node

const logger = require('./shared/logger');

const virtualMachineTemplates = require('./virtual-machine-templates');
const virtualMachines = require('./virtual-machines');

const deploy = async () => {
  await virtualMachineTemplates.deploy();
  await virtualMachines.deploy();
};

deploy()
  .then(() => process.exit())
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
