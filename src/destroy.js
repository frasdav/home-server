#!/usr/bin/env node

const logger = require('./shared/logger');

const virtualMachineTemplate = require('./virtual-machine-template');
const virtualMachines = require('./virtual-machines');

const destroy = async () => {
  await virtualMachineTemplate.destroy();
  await virtualMachines.destroy();
};

destroy()
  .then(() => process.exit())
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
