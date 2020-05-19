#!/usr/bin/env node

const path = require('path');

const Terrajs = require('@cda0/terrajs');

const {
  vspherePassword,
  vsphereServer,
  vsphereUsername,
} = require('../shared/constants');
const logger = require('../shared/logger');

const deploy = async () => {
  const terraform = new Terrajs({ terraformDir: path.join(__dirname, 'terraform') });

  await terraform.init();

  await terraform.plan({
    out: 'terraform.tfplan',
    var: {
      vspherePassword,
      vsphereServer,
      vsphereUsername,
    },
  });

  await terraform.apply({
    plan: 'terraform.tfplan',
  });
};

deploy()
  .then(() => process.exit())
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
