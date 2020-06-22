const Ansible = require('node-ansible');
const path = require('path');
const YAML = require('yaml');

const {
  readFile,
  writeFile,
} = require('../../shared/fs');
const govc = require('../../shared/govc');
const logger = require('../../shared/logger');

const buildInventory = async (config) => {
  logger.info('Getting kube-master Ip address');
  const kubeMasterVmInfoResponse = await govc('vm.info -json "kube-master"', config);
  const kubeMasterVmInfo = JSON.parse(kubeMasterVmInfoResponse);
  const kubeMasterVmIpAddress = kubeMasterVmInfo.VirtualMachines[0].Guest.IpAddress;

  logger.info('Generating Ansible inventory');
  const emptyAnsibleInventoryData = await readFile(path.join(__dirname, '../ansible', 'hosts.empty.yml'));
  const ansibleInventory = YAML.parse(emptyAnsibleInventoryData.toString());
  ansibleInventory.all.hosts = {
    'kube-master': {
      ansible_host: kubeMasterVmIpAddress,
    },
  };
  await writeFile(path.join(__dirname, '../ansible', 'hosts.yml'), YAML.stringify(ansibleInventory));
};

const getPlaybook = () => {
  logger.info('Building Ansible playbook');
  const playbook = new Ansible.Playbook().playbook('site').inventory('hosts.yml').user('ubuntu');
  playbook.on('stdout', (data) => { logger.info(data.toString()); });
  playbook.on('stderr', (data) => { logger.error(data.toString()); });
  return playbook;
};

module.exports = {
  buildInventory,
  getPlaybook,
};
