# Azure Key Vault. Secrets are NOT created by Terraform; store them via Portal, CLI, or a one-off script.
# App layer uses Key Vault Reference or data source to reference secrets.

resource "azurerm_key_vault" "main" {
  name                       = "${var.prefix}-kv-${substr(md5(azurerm_resource_group.main.id), 0, 10)}"
  location                   = var.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = var.key_vault_sku
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
}

# Current client (Terraform runner) needs access to manage secrets / set policy.
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault_access_policy" "terraform" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id
  secret_permissions = [
    "Get", "List", "Set", "Delete", "Recover", "Backup", "Restore"
  ]
}

# Do NOT create azurerm_key_vault_secret here. Secrets (e.g. postgres_password, pfx_password)
# are populated by script or manual step; Terraform only references them.
