###############################################################################
# DEV Environment — Variables
###############################################################################

variable "location" {
  description = "Azure region"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}


variable "deployer_object_id" {
  description = "Object ID of the service principal that deploys resources"
  type        = string
}

variable "acr_sku" {
  description = "ACR SKU"
  type        = string
  default     = "Basic"
}

variable "container_app_cpu" {
  type    = number
  default = 0.25
}

variable "container_app_memory" {
  type    = string
  default = "0.5Gi"
}

variable "min_replicas" {
  type    = number
  default = 1
}

variable "max_replicas" {
  type    = number
  default = 2
}

variable "image_tag" {
  description = "Docker image tag deployed by CI/CD"
  type        = string
  default     = "latest"
}

variable "revision_number" {
  description = "GitHub Actions run number used for revision naming"
  type        = string
  default     = "1"
}