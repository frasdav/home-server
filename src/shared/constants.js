const {
  VCENTER_DATACENTER: vcenterDatacenter,
  VCENTER_DATASTORE: vcenterDatastore,
  VCENTER_NETWORK: vcenterNetwork,
  VCENTER_PASSWORD: vcenterPassword,
  VCENTER_RESOURCE_POOL: vcenterResourcePool,
  VCENTER_SERVER: vcenterServer,
  VCENTER_USERNAME: vcenterUsername,
} = process.env;

const govcEnv = {
  GOVC_INSECURE: '1',
  GOVC_URL: vcenterServer,
  GOVC_USERNAME: vcenterUsername,
  GOVC_PASSWORD: vcenterPassword,
  GOVC_DATASTORE: vcenterDatastore,
  GOVC_NETWORK: vcenterNetwork,
  GOVC_RESOURCE_POOL: vcenterResourcePool,
  GOVC_DATACENTER: vcenterDatacenter,
};
const ubuntuVersion = '20.04';
const ubuntuTemplateVmName = `Ubuntu${ubuntuVersion.replace('.', '')}Template`;
const ubuntuCloudImageOvaName = `ubuntu-${ubuntuVersion}-server-cloudimg-amd64.ova`;
const ubuntuCloudImageOvaUrl = `https://cloud-images.ubuntu.com/releases/${ubuntuVersion}/release/${ubuntuCloudImageOvaName}`;

module.exports = {
  govcEnv,
  ubuntuCloudImageOvaName,
  ubuntuCloudImageOvaUrl,
  ubuntuTemplateVmName,
  vcenterPassword,
  vcenterServer,
  vcenterUsername,
};
