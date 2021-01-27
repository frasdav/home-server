provider "vsphere" {
  user           = var.vcenter_username
  password       = var.vcenter_password
  vsphere_server = var.vcenter_server

  allow_unverified_ssl = true

  version = "~> 1.18"
}

resource "vsphere_resource_pool" "kubernetes" {
  name                    = "Kubernetes"
  parent_resource_pool_id = data.vsphere_host.main.resource_pool_id
}

resource "vsphere_folder" "kubernetes" {
  path          = "Kubernetes"
  type          = "datastore"
  datacenter_id = data.vsphere_datacenter.main.id
}

resource "vsphere_virtual_machine" "kube_master" {
  name             = "kube-master01"
  resource_pool_id = vsphere_resource_pool.kubernetes.id
  datastore_id     = data.vsphere_datastore.main.id

  guest_id = "ubuntu64Guest"

  num_cpus         = 4
  memory           = 8192
  enable_disk_uuid = true

  network_interface {
    network_id = data.vsphere_network.main.id
  }

  disk {
    label            = "disk0"
    size             = 10
    thin_provisioned = false
  }

  cdrom {
    client_device = true
  }

  clone {
    template_uuid = data.vsphere_virtual_machine.ubuntu.id

    customize {
      linux_options {
        host_name = "kube-master01"
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

  lifecycle {
    ignore_changes = [
      disk,
      vapp
    ]
  }
}

resource "vsphere_virtual_machine" "kube_worker" {
  name             = "kube-worker0${count.index + 1}"
  resource_pool_id = vsphere_resource_pool.kubernetes.id
  datastore_id     = data.vsphere_datastore.main.id

  guest_id = "ubuntu64Guest"

  num_cpus         = 4
  memory           = 16384
  enable_disk_uuid = true

  network_interface {
    network_id = data.vsphere_network.main.id
  }

  disk {
    label            = "disk0"
    size             = 10
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
        ipv4_address = cidrhost(var.network_cidr, 21 + count.index)
        ipv4_netmask = split("/", var.network_cidr)[1]
      }

      ipv4_gateway    = var.network_default_gateway
      dns_server_list = var.network_dns_servers
    }
  }

  lifecycle {
    ignore_changes = [
      disk,
      vapp
    ]
  }

  count = var.kube_worker_count
}
