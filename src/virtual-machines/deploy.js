const Ansible = require('node-ansible');
const path = require('path');
const Terrajs = require('@cda0/terrajs');
const YAML = require('yaml');

const { getConfig } = require('../shared/config');
const {
  readFile,
  writeFile,
} = require('../shared/fs');
const logger = require('../shared/logger');

const {
  configFilePath,
} = require('../shared/constants');

const deploy = async () => {
  const config = await getConfig(configFilePath);

  const terraform = new Terrajs({ terraformDir: path.join(__dirname, 'terraform') });

  logger.info('Initialising Terraform');
  await terraform.init();

  logger.info('Planning Terraform changes');
  await terraform.plan({
    out: 'terraform.tfplan',
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

  logger.info('Applying Terraform changes');
  await terraform.apply({
    plan: 'terraform.tfplan',
  });

  logger.info('Getting Terraform output');
  const output = JSON.parse(await terraform.output(
    {
      json: true,
    },
    {
      silent: true,
    },
  ));

  logger.info('Generating Ansible inventory');
  const emptyAnsibleInventoryData = await readFile(path.join(__dirname, 'ansible', 'hosts.empty.yml'));
  const ansibleInventory = YAML.parse(emptyAnsibleInventoryData.toString());
  ansibleInventory.all.children.kube_master.hosts = {};
  ansibleInventory.all.children.kube_master.hosts[output.kube_master.value.name] = {
    ansible_host: output.kube_master.value.default_ip_address,
  };
  ansibleInventory.all.children.kube_workers.hosts = {};
  output.kube_workers.value.forEach((h) => {
    ansibleInventory.all.children.kube_workers.hosts[h.name] = {
      ansible_host: h.default_ip_address,
    };
  });
  ansibleInventory.all.vars = {
    vcenter_datacenter: config.vcenter_datacenter,
    vcenter_datastore: config.vcenter_datastore,
    vcenter_network: config.vcenter_network,
    vcenter_password: config.vcenter_password,
    vcenter_server: config.vcenter_server,
    vcenter_storage_policy: config.vcenter_storage_policy,
    vcenter_username: config.vcenter_username,
  };
  await writeFile(path.join(__dirname, 'ansible', 'hosts.yml'), YAML.stringify(ansibleInventory));

  logger.info('Executing Ansible playbook');
  const playbook = new Ansible.Playbook().playbook('site').inventory('hosts.yml').user('ubuntu');
  playbook.on('stdout', (data) => { logger.info(data.toString()); });
  playbook.on('stderr', (data) => { logger.error(data.toString()); });
  await playbook.exec({ cwd: `${__dirname}/ansible` });
};

module.exports = deploy;
