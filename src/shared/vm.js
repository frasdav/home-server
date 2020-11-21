const govc = require('./govc');

const govcVmInfoInterval = 5000;
const waitForVmInfoTimeout = 18000000;

const templateVmExists = async (templateVmName, config) => {
  const templateVmInfoResponse = await govc(`vm.info -json "${templateVmName}"`, config);
  const templateVmInfo = JSON.parse(templateVmInfoResponse);
  return templateVmInfo.VirtualMachines && templateVmInfo.VirtualMachines.length > 0;
};

const waitForVmPoweredOff = (vmName, config) => {
  const start = Date.now();
  function retryWaitForVmPoweredOff(resolve, reject) {
    govc(`vm.info -json "${vmName}"`, config)
      .then((vmInfoResponse) => {
        const vmInfo = JSON.parse(vmInfoResponse);
        if (vmInfo.VirtualMachines[0].Runtime.PowerState === 'poweredOff') {
          return resolve();
        }
        if ((Date.now() - start) >= waitForVmInfoTimeout) {
          return reject(new Error(`Timeout exceeded waiting for power state 'poweredOff' from Vm with name '${vmName}'`));
        }
        return setTimeout(
          retryWaitForVmPoweredOff.bind(this, resolve, reject),
          govcVmInfoInterval,
        );
      })
      .catch(reject);
  }
  return new Promise(retryWaitForVmPoweredOff);
};

module.exports = {
  templateVmExists,
  waitForVmPoweredOff,
};
