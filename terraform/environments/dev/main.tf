###############################################################################
# DEV Environment — Root Module
###############################################################################

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}

###############################################################################
# Data Sources
###############################################################################

data "azurerm_client_config" "current" {}

###############################################################################
# Random Suffix
###############################################################################

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

###############################################################################
# Locals
###############################################################################

locals {
  environment     = "dev"
  project_name    = var.project_name
  resource_suffix = "${local.project_name}${local.environment}${random_string.suffix.result}"

  common_tags = {
    project     = local.project_name
    environment = local.environment
    managed_by  = "terraform"
  }
}

###############################################################################
# Resource Group (use existing)
###############################################################################

data "azurerm_resource_group" "main" {
  name = "rg-app-devops_Jegan"
}

###############################################################################
# Module: ACR
###############################################################################

module "acr" {
  source = "../../modules/acr"

  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  resource_suffix     = local.resource_suffix
  acr_sku             = var.acr_sku
  tags                = local.common_tags
}

###############################################################################
# Module: Key Vault
###############################################################################

module "keyvault" {
  source = "../../modules/keyvault"

  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  resource_suffix     = local.resource_suffix
  tenant_id           = data.azurerm_client_config.current.tenant_id
  deployer_object_id  = var.deployer_object_id
  tags                = local.common_tags
}

###############################################################################
# Module: Container Apps
###############################################################################

module "container_apps" {
  source = "../../modules/container_apps"

  resource_group_name  = data.azurerm_resource_group.main.name
  location             = data.azurerm_resource_group.main.location
  project_name         = local.project_name
  environment          = local.environment
  resource_suffix      = local.resource_suffix
  container_app_cpu    = var.container_app_cpu
  container_app_memory = var.container_app_memory
  min_replicas         = var.min_replicas
  max_replicas         = var.max_replicas
  key_vault_id         = module.keyvault.id
  key_vault_uri        = module.keyvault.key_vault_uri 
  acr_id               = module.acr.id
  acr_login_server     = module.acr.login_server   # 👈 add this
  image_tag            = var.image_tag     
  tags                 = local.common_tags
}
