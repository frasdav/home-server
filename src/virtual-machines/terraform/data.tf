data "vsphere_datacenter" "main" {
  name = "Home"
}

data "vsphere_datastore" "main" {
  name          = "Local VMFS"
  datacenter_id = "${data.vsphere_datacenter.main.id}"
}

data "vsphere_resource_pool" "kubernetes" {
  name          = "Kubernetes"
  datacenter_id = "${data.vsphere_datacenter.main.id}"
}

data "vsphere_network" "main" {
  name          = "VM Network"
  datacenter_id = "${data.vsphere_datacenter.main.id}"
}

data "vsphere_virtual_machine" "ubuntu" {
  name          = "Ubuntu 20.04"
  datacenter_id = "${data.vsphere_datacenter.main.id}"
}
