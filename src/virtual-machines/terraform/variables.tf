variable "domain" {
  type = string
}

variable "kube_worker_count" {
  type = number
}

variable "network_cidr" {
  type = string
}

variable "network_default_gateway" {
  type = string
}

variable "network_dns_servers" {
  type = list(string)
}

variable "vcenter_password" {
  type = string
}

variable "vcenter_server" {
  type = string
}

variable "vcenter_username" {
  type = string
}
