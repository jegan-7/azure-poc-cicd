###############################################################################
# DEV Environment — Backend Configuration
###############################################################################

terraform {
  backend "azurerm" {
    resource_group_name  = "rg-app-devops_Jegan"
    storage_account_name = "devstterraformstate"       
    container_name       = "tfstate"
    key                  = "dev.tfstate"
    use_azuread_auth     = true
  }
}
