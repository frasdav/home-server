#!/usr/bin/env node

const logger = require('./shared/logger');

const virtualMachineTemplates = require('./virtual-machine-templates');
const virtualMachines = require('./virtual-machines');

const destroy = async () => {
  await virtualMachines.destroy();
  await virtualMachineTemplates.destroy();
};

destroy()
  .then(() => process.exit())
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
