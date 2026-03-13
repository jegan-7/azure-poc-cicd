variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_suffix" {
  type = string
}

variable "tenant_id" {
  type = string
}

variable "deployer_object_id" {
  description = "Object ID of the Terraform deployer (for Key Vault admin role)"
  type        = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
