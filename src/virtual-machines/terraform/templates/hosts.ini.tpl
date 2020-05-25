[kube_master]
${kube_master.name} ansible_host=${kube_master.default_ip_address}

[kube_workers]
%{ for kube_worker in kube_workers ~}
${kube_worker.name} ansible_host=${kube_worker.default_ip_address}
%{ endfor ~}

[kube_cluster:children]
kube_master
kube_workers
