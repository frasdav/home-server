const path = require('path');

const Terrajs = require('@cda0/terrajs');

const {
  domain,
  kubeWorkerCount,
  networkCidr,
  networkDefaultGateway,
  networkDnsServers,
  vcenterPassword,
  vcenterServer,
  vcenterUsername,
} = require('../shared/constants');
const logger = require('../shared/logger');

const destroy = async () => {
  const terraform = new Terrajs({ terraformDir: path.join(__dirname, 'terraform') });

  logger.info('Initialising Terraform');
  await terraform.init();

  logger.info('Destroying infrastructure');
  await terraform.destroy({
    autoApprove: true,
    var: {
      domain,
      kubeWorkerCount,
      networkCidr,
      networkDefaultGateway,
      // networkDnsServers,
      vcenterPassword,
      vcenterServer,
      vcenterUsername,
    },
  });
};

module.exports = destroy;
