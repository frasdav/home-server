const Ansible = require('node-ansible');
const path = require('path');
const YAML = require('yamljs');

const { getConfig } = require('../shared/config');
const {
  readFile,
  writeFile,
} = require('../shared/fs');
const govc = require('../shared/govc');
const logger = require('../shared/logger');

const {
  configFilePath,
} = require('../shared/constants');

const deploy = async () => {
  const config = await getConfig(configFilePath);

  logger.info('Getting kube-master Ip address');
  const kubeMasterVmInfoResponse = await govc('vm.info -json "kube-master"', config);
  const kubeMasterVmInfo = JSON.parse(kubeMasterVmInfoResponse);
  const kubeMasterVmIpAddress = kubeMasterVmInfo.VirtualMachines[0].Guest.IpAddress;

  logger.info('Generating Ansible inventory');
  const emptyAnsibleInventoryData = await readFile(path.join(__dirname, 'ansible', 'hosts.empty.yml'));
  const ansibleInventory = YAML.parse(emptyAnsibleInventoryData.toString());
  ansibleInventory.all.hosts = {
    'kube-master': {
      ansible_host: kubeMasterVmIpAddress,
    },
  };
  await writeFile(path.join(__dirname, 'ansible', 'hosts.yml'), YAML.stringify(ansibleInventory, 6, 2));

  logger.info('Executing Ansible');
  const playbook = new Ansible.Playbook().playbook('site').inventory('hosts.yml').user('ubuntu');
  // playbook.variables({
  //   vcenter_datacenter: config.vcenter_datacenter,
  //   vcenter_datastore: config.vcenter_datastore,
  //   vcenter_network: config.vcenter_network,
  //   vcenter_password: config.vcenter_password,
  //   vcenter_server: config.vcenter_server,
  //   vcenter_storage_policy: config.vcenter_storage_policy,
  //   vcenter_username: config.vcenter_username,
  // });
  playbook.on('stdout', (data) => { logger.info(data.toString()); });
  playbook.on('stderr', (data) => { logger.error(data.toString()); });
  await playbook.exec({ cwd: `${__dirname}/ansible` });
};

module.exports = deploy;
