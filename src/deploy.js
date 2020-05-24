#!/usr/bin/env node

const logger = require('./shared/logger');

const virtualMachineTemplate = require('./virtual-machine-template');
const virtualMachines = require('./virtual-machines');

const deploy = async () => {
  await virtualMachineTemplate.deploy();
  await virtualMachines.deploy();
};

deploy()
  .then(() => process.exit())
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
