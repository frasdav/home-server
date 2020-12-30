#!/usr/bin/env node

const logger = require('./shared/logger');

const applications = require('./applications');
const virtualMachineTemplates = require('./virtual-machine-templates');
const virtualMachines = require('./virtual-machines');

const destroy = async () => {
  await applications.destroy();
  await virtualMachines.destroy();
  await virtualMachineTemplates.destroy();
};

destroy()
  .then(() => process.exit())
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
