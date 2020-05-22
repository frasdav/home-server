#!/usr/bin/env node

const got = require('got');
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');

const Shell = require('node-powershell');

const {
  ubuntuCloudImageOvaName,
  ubuntuCloudImageOvaUrl,
  ubuntuTemplateVmName,
  vcenterPassword,
  vcenterServer,
  vcenterUsername,
} = require('../shared/constants');
const {
  createWriteStream,
  exists,
  readFile,
  writeFile,
} = require('../shared/fs');
const govc = require('../shared/govc');
const logger = require('../shared/logger');
const { waitForVmPoweredOff } = require('../shared/vm');

const pipeline = promisify(stream.pipeline);

const deploy = async () => {
  const ubuntuCloudImageOvaPath = path.join(__dirname, ubuntuCloudImageOvaName);

  logger.info(`Checking for Ova at path '${ubuntuCloudImageOvaPath}'`);
  if (!(await exists(ubuntuCloudImageOvaPath))) {
    logger.info(`Existing Ova not found; downloading Ova from '${ubuntuCloudImageOvaUrl}'`);
    await pipeline(
      got.stream(ubuntuCloudImageOvaUrl),
      createWriteStream(ubuntuCloudImageOvaPath),
    );
  }

  logger.info(`Checking for existing Vm with name '${ubuntuTemplateVmName}'`);
  const templateVmInfoResponse = await govc(`vm.info -json ${ubuntuTemplateVmName}`);
  const templateVmInfo = JSON.parse(templateVmInfoResponse);
  if (templateVmInfo.VirtualMachines && templateVmInfo.VirtualMachines.length > 0) {
    logger.info(`Existing Vm with name '${ubuntuTemplateVmName}' found; deleting`);
    await govc(`vm.destroy ${ubuntuTemplateVmName}`);
  }

  const cloudInitData = await readFile(path.join(__dirname, 'cloud-config.yml'));
  const base64CloudInitData = cloudInitData.toString('base64');

  logger.info(`Exporting spec from Ova '${ubuntuCloudImageOvaPath}'`);
  const ubuntuCloudImageOvaSpecResponse = await govc(`import.spec ${ubuntuCloudImageOvaPath}`);
  const ubuntuCloudImageOvaSpec = JSON.parse(ubuntuCloudImageOvaSpecResponse);
  ubuntuCloudImageOvaSpec.Name = ubuntuTemplateVmName;
  ubuntuCloudImageOvaSpec.PropertyMapping.find((p) => p.Key === 'hostname').Value = '';
  ubuntuCloudImageOvaSpec.PropertyMapping.find((p) => p.Key === 'user-data').Value = base64CloudInitData;
  ubuntuCloudImageOvaSpec.NetworkMapping.find((p) => p.Name === 'VM Network').Network = 'VM Network';

  const ubuntuCloudImageOvaSpecPath = `${ubuntuCloudImageOvaPath}.json`;
  await writeFile(ubuntuCloudImageOvaSpecPath, JSON.stringify(ubuntuCloudImageOvaSpec, null, 2));

  logger.info(`Creating Vm with name '${ubuntuTemplateVmName}' using Ova ${ubuntuCloudImageOvaPath} and spec '${ubuntuCloudImageOvaSpecPath}'`);
  await govc(`import.ova -options=${ubuntuCloudImageOvaSpecPath} ${ubuntuCloudImageOvaPath}`);

  logger.info(`Upgrading version for Vm with name '${ubuntuTemplateVmName}' to '15'`);
  await govc(`vm.upgrade -vm ${ubuntuTemplateVmName} -version=15`);

  logger.info(`Updating settings for Vm with name '${ubuntuTemplateVmName}'`);
  await govc(`vm.change -vm ${ubuntuTemplateVmName} -c 4 -m 4096 -e="disk.enableUUID=1"`);
  await govc(`vm.disk.change -vm ${ubuntuTemplateVmName} -disk.label "Hard disk 1" -size 60G`);

  logger.info(`Powering on Vm with name '${ubuntuTemplateVmName}'`);
  await govc(`vm.power -on=true ${ubuntuTemplateVmName}`);

  logger.info(`Waiting for Vm with name '${ubuntuTemplateVmName}' to power off`);
  await waitForVmPoweredOff(ubuntuTemplateVmName);

  logger.info(`Marking Vm with name '${ubuntuTemplateVmName}' as template`);
  await govc(`vm.markastemplate ${ubuntuTemplateVmName}`);

  const ps = new Shell({
    executionPolicy: 'Bypass',
  });

  logger.info(`Connecting to VCenter server at '${vcenterServer}'`);
  ps.addCommand('Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false');
  ps.addCommand(`Connect-VIServer ${vcenterServer} -User ${vcenterUsername} -Password ${vcenterPassword}`);
  await ps.invoke();

  const ubuntuOsCustomisationSpecName = 'Ubuntu';

  ps.addCommand(`Get-OSCustomizationSpec ${ubuntuOsCustomisationSpecName} -ErrorAction SilentlyContinue | ConvertTo-Json`);
  const ubuntuOsCustomisationSpec = await ps.invoke();
  if (ubuntuOsCustomisationSpec) {
    logger.info(`Existing Os customisation spec with name '${ubuntuOsCustomisationSpecName}' found; deleting`);
    ps.addCommand(`Remove-OSCustomizationSpec ${ubuntuOsCustomisationSpecName} -Confirm:$false`);
  }

  logger.info(`Creating Os customisation spec with name '${ubuntuOsCustomisationSpecName}'`);
  ps.addCommand('New-OSCustomizationSpec -Name Ubuntu -OSType Linux -DnsServer 192.168.225.251,192.168.225.1 -DnsSuffix fdavidson.net -Domain fdavidson.net -NamingScheme vm');
  await ps.invoke();

  logger.info(`Disconnecting from VCenter server at '${vcenterServer}'`);
  ps.addCommand(`Disconnect-VIServer -Server ${vcenterServer} -Confirm:$false -Force`);
  await ps.invoke();
};

deploy()
  .then(() => process.exit())
  .catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
