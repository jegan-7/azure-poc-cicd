###############################################################################
# Module: Azure Container Registry
###############################################################################

resource "azurerm_container_registry" "poc-acr" {
  name                = "acr${var.resource_suffix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.acr_sku
  admin_enabled       = true

  tags = var.tags
}
