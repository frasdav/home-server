const path = require('path');
const Terrajs = require('@cda0/terrajs');

const { getConfig } = require('../shared/config');
const logger = require('../shared/logger');

const {
  configFilePath,
} = require('../shared/constants');

const destroy = async () => {
  const config = await getConfig(configFilePath);

  const terraform = new Terrajs({ terraformDir: path.join(__dirname, 'terraform') });

  logger.info('Initialising Terraform');
  await terraform.init();

  logger.info('Destroying infrastructure');
  await terraform.destroy({
    autoApprove: true,
    var: {
      domain: config.domain,
      kube_worker_count: config.kube_worker_count,
      network_cidr: config.network_cidr,
      network_default_gateway: config.network_default_gateway,
      network_dns_servers: config.network_dns_servers,
      vcenter_datacenter: config.vcenter_datacenter,
      vcenter_datastore: config.vcenter_datastore,
      vcenter_network: config.vcenter_network,
      vcenter_password: config.vcenter_password,
      vcenter_server: config.vcenter_server,
      vcenter_username: config.vcenter_username,
    },
  });
};

module.exports = destroy;
