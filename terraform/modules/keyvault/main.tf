###############################################################################
# Module: Azure Key Vault
###############################################################################

resource "azurerm_key_vault" "poc-vault" {
  name                       = "kv-${var.resource_suffix}"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  tenant_id                  = var.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  enable_rbac_authorization  = true

  tags = var.tags
}

###############################################################################
# RBAC: Allow Terraform deployer to manage secrets
###############################################################################

resource "azurerm_role_assignment" "deployer_keyvault_admin" {
  scope                = azurerm_key_vault.poc-vault.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = var.deployer_object_id
}

###############################################################################
# Example Secrets
###############################################################################

resource "azurerm_key_vault_secret" "db_connection_string" {
  name         = "db-connection-string"
  value        = "Server=tcp:myserver.database.windows.net;Database=mydb;Encrypt=true;"
  key_vault_id = azurerm_key_vault.poc-vault.id

  depends_on = [azurerm_role_assignment.deployer_keyvault_admin]
  tags       = var.tags
}

resource "azurerm_key_vault_secret" "api_key" {
  name         = "api-key"
  value        = "REPLACE_WITH_ACTUAL_API_KEY"
  key_vault_id = azurerm_key_vault.poc-vault.id

  depends_on = [azurerm_role_assignment.deployer_keyvault_admin]
  tags       = var.tags
}
