output "kube_master" {
  value = vsphere_virtual_machine.kube_master
}

output "kube_workers" {
  value = vsphere_virtual_machine.kube_worker.*
}
