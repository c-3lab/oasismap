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
  rbac_authorization_enabled = true
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

resource "azurerm_user_assigned_identity" "orion" {
  location            = var.location
  name                = "${var.prefix}-uai-orion"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_role_assignment" "kv_rbac_orion" {
  principal_id         = azurerm_user_assigned_identity.orion.principal_id
  role_definition_name = "Key Vault Secrets User"
  scope                = azurerm_key_vault.main.id
}

resource "azurerm_user_assigned_identity" "cygnus" {
  location            = var.location
  name                = "${var.prefix}-uai-cygnus"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_role_assignment" "kv_rbac_cygnus" {
  principal_id         = azurerm_user_assigned_identity.cygnus.principal_id
  role_definition_name = "Key Vault Secrets User"
  scope                = azurerm_key_vault.main.id
}

# Do NOT create azurerm_key_vault_secret here. Secrets (e.g. postgres_password, pfx_password)
# are populated by script or manual step; Terraform only references them.
