variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "resource_suffix" {
  type = string
}



variable "container_app_cpu" {
  type    = number
  default = 0.5
}

variable "container_app_memory" {
  type    = string
  default = "1Gi"
}

variable "min_replicas" {
  type    = number
  default = 1
}

variable "max_replicas" {
  type    = number
  default = 3
}



variable "key_vault_id" {
  type = string
}

variable "acr_id" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "key_vault_uri" {
  description = "URI of the Azure Key Vault"
  type        = string
}