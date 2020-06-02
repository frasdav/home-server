provider "vsphere" {
  user           = var.vcenter_username
  password       = var.vcenter_password
  vsphere_server = var.vcenter_server

  allow_unverified_ssl = true

  version = "~> 1.18"
}

provider "local" {
  version = "~>1.4"
}

resource "vsphere_virtual_machine" "kube_master" {
  name             = "kube-master"
  resource_pool_id = data.vsphere_resource_pool.kubernetes.id
  datastore_id     = data.vsphere_datastore.main.id

  guest_id = "ubuntu64Guest"

  num_cpus = 2
  memory   = 4096

  network_interface {
    network_id = data.vsphere_network.main.id
  }

  disk {
    label            = "disk0"
    size             = 15
    thin_provisioned = false
  }

  cdrom {
    client_device = true
  }

  clone {
    template_uuid = data.vsphere_virtual_machine.ubuntu.id

    customize {
      linux_options {
        host_name = "kube-master"
        domain    = var.domain
      }

      network_interface {
        ipv4_address = cidrhost(var.network_cidr, 20)
        ipv4_netmask = split("/", var.network_cidr)[1]
      }

      ipv4_gateway    = var.network_default_gateway
      dns_server_list = var.network_dns_servers
    }
  }

  wait_for_guest_net_timeout = -1

  lifecycle {
    ignore_changes = [
      vapp
    ]
  }
}

resource "vsphere_virtual_machine" "kube_worker" {
  name             = "kube-worker0${count.index + 1}"
  resource_pool_id = data.vsphere_resource_pool.kubernetes.id
  datastore_id     = data.vsphere_datastore.main.id

  guest_id = "ubuntu64Guest"

  num_cpus = 2
  memory   = 4096

  network_interface {
    network_id = data.vsphere_network.main.id
  }

  disk {
    label            = "disk0"
    size             = 15
    thin_provisioned = false
  }

  cdrom {
    client_device = true
  }

  clone {
    template_uuid = data.vsphere_virtual_machine.ubuntu.id

    customize {
      linux_options {
        host_name = "kube-worker0${count.index + 1}"
        domain    = var.domain
      }

      network_interface {
        ipv4_address = cidrhost(var.network_cidr, 30 + count.index)
        ipv4_netmask = split("/", var.network_cidr)[1]
      }

      ipv4_gateway    = var.network_default_gateway
      dns_server_list = var.network_dns_servers
    }
  }

  wait_for_guest_net_timeout = -1

  lifecycle {
    ignore_changes = [
      vapp
    ]
  }

  count = var.kube_worker_count
}
