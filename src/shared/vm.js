const govc = require('./govc');

const govcVmInfoInterval = 5000;
const waitForVmInfoTimeout = 18000000;

const waitForVmPoweredOff = (vmName) => {
  const start = Date.now();
  function retryWaitForVmPoweredOff(resolve, reject) {
    govc(`vm.info -json ${vmName}`)
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
  waitForVmPoweredOff,
};
