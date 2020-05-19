data "vsphere_datacenter" "dc" {
  name = "ha-datacenter"
}

data "vsphere_datastore" "datastore" {
  name          = "Local VMFS"
  datacenter_id = "${data.vsphere_datacenter.dc.id}"
}

data "vsphere_resource_pool" "pool" {
  name          = "cluster1/Resources"
  datacenter_id = "${data.vsphere_datacenter.dc.id}"
}

data "vsphere_network" "network" {
  name          = "VM Network"
  datacenter_id = "${data.vsphere_datacenter.dc.id}"
}
