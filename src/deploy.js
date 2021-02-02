#!/usr/bin/env node

const logger = require('./shared/logger');

const applications = require('./applications');
const virtualMachineTemplates = require('./virtual-machine-templates');
const virtualMachines = require('./virtual-machines');

const deploy = async () => {
  await virtualMachineTemplates.deploy();
  await virtualMachines.deploy();
  await applications.deploy();
};

deploy()
  .then(() => process.exit())
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
