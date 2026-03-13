###############################################################################
# DEV Environment — Outputs
###############################################################################

output "resource_group_name" {
  value = data.azurerm_resource_group.main.name
}

output "acr_login_server" {
  value = module.acr.login_server
}

output "acr_name" {
  value = module.acr.name
}

output "key_vault_uri" {
  value = module.keyvault.key_vault_uri
}

output "key_vault_name" {
  value = module.keyvault.name
}

output "container_app_fqdn" {
  value = module.container_apps.fqdn
}

output "container_app_url" {
  value = "https://${module.container_apps.fqdn}"
}

output "environment" {
  value = local.environment
}
