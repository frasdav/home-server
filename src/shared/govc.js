const { exec } = require('./shell');

const govc = (cmd, config) => exec(`govc ${cmd}`, {
  env: {
    GOVC_INSECURE: '1',
    GOVC_URL: config.vcenter_server,
    GOVC_USERNAME: config.vcenter_username,
    GOVC_PASSWORD: config.vcenter_password,
    GOVC_DATASTORE: config.vcenter_datastore,
    GOVC_NETWORK: config.vcenter_network,
    GOVC_RESOURCE_POOL: config.vcenter_resource_pool,
    GOVC_DATACENTER: config.vcenter_datacenter,
  },
});

module.exports = govc;
