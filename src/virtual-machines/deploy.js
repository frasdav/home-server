const Ansible = require('node-ansible');
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

const deploy = async () => {
  const terraform = new Terrajs({ terraformDir: path.join(__dirname, 'terraform') });

  logger.info('Initialising Terraform');
  await terraform.init();

  logger.info('Planning infrastructure changes');
  await terraform.plan({
    out: 'terraform.tfplan',
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

  logger.info('Applying infrastructure changes');
  await terraform.apply({
    plan: 'terraform.tfplan',
  });

  logger.info('Executing Ansible');
  const playbook = new Ansible.Playbook().playbook('site').inventory('hosts.ini').user('ubuntu');
  playbook.on('stdout', (data) => { logger.info(data.toString()); });
  playbook.on('stderr', (data) => { logger.error(data.toString()); });
  await playbook.exec({ cwd: `${__dirname}/ansible` });
};

module.exports = deploy;
