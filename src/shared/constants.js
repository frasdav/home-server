const {
  VSPHERE_PASSWORD: vspherePassword,
  VSPHERE_SERVER: vsphereServer,
  VSPHERE_USERNAME: vsphereUsername,
} = process.env;

module.exports = {
  vspherePassword,
  vsphereServer,
  vsphereUsername,
};
