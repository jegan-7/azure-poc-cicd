output "fqdn" {
  value = azurerm_container_app.poc.latest_revision_fqdn
}

output "environment_id" {
  value = azurerm_container_app_environment.poc.id
}

output "app_identity_principal_id" {
  value = azurerm_container_app.poc.identity[0].principal_id
}
