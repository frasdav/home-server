data "vsphere_datacenter" "main" {
  name = "${var.vcenter_datacenter}"
}

data "vsphere_datastore" "main" {
  name          = "${var.vcenter_datastore}"
  datacenter_id = "${data.vsphere_datacenter.main.id}"
}

data "vsphere_network" "main" {
  name          = "${var.vcenter_network}"
  datacenter_id = "${data.vsphere_datacenter.main.id}"
}

data "vsphere_host" "main" {
  name          = "192.168.225.2"
  datacenter_id = "${data.vsphere_datacenter.main.id}"
}

data "vsphere_virtual_machine" "ubuntu" {
  name          = "Ubuntu 20.04"
  datacenter_id = "${data.vsphere_datacenter.main.id}"
}
