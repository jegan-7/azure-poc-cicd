output "id" {
  value = azurerm_container_registry.poc-acr.id
}

output "login_server" {
  value = azurerm_container_registry.poc-acr.login_server
}

output "name" {
  value = azurerm_container_registry.poc-acr.name
}

output "admin_username" {
  value = azurerm_container_registry.poc-acr.admin_username
}

output "admin_password" {
  value     = azurerm_container_registry.poc-acr.admin_password
  sensitive = true
}
