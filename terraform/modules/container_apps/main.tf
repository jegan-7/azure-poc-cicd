###############################################################################
# Module: Container Apps (Environment + App + RBAC)
###############################################################################

# ── Log Analytics Workspace ────────────────────────────────────────────────

resource "azurerm_log_analytics_workspace" "poc" {
  name                = "log-poc-app-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = var.tags
}

# ── Container Apps Environment ─────────────────────────────────────────────

resource "azurerm_container_app_environment" "poc" {
  name                       = "cae-poc-app-${var.environment}"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.poc.id

  tags = var.tags
}

# ── Container App ──────────────────────────────────────────────────────────
# Uses a public placeholder image for initial provisioning.
# Once your real image is pushed to ACR, update the image + re-enable
# registry auth, secrets, and health probes.

resource "azurerm_container_app" "poc" {
  name                         = "poc-app-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.poc.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Multiple"

  identity {
    type = "SystemAssigned"
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    revision_suffix = "v${var.image_tag}"   # 👈 track revisions clearly
    min_replicas    = var.min_replicas
    max_replicas    = var.max_replicas

    container {
      name   = var.project_name
      image  = "${var.acr_login_server}/${var.project_name}:${var.image_tag}"
      cpu    = var.container_app_cpu
      memory = var.container_app_memory

      env {
        name  = "KEY_VAULT_URI"
        value = var.key_vault_uri
      }

      env {
        name  = "NODE_ENV"
        value = var.environment
      }
    }
  }

  tags = var.tags

  lifecycle {
    ignore_changes = [
       # CI/CD owns the image tag
    ]
  }
}
# ── RBAC: Container App → ACR (AcrPull) ───────────────────────────────────

resource "azurerm_role_assignment" "app_acr_pull" {
  scope                = var.acr_id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_container_app.poc.identity[0].principal_id
}

# ── RBAC: Container App → Key Vault (Secrets User) ────────────────────────

resource "azurerm_role_assignment" "app_keyvault_reader" {
  scope                = var.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_container_app.poc.identity[0].principal_id
}
