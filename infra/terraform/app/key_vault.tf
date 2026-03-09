data "azurerm_key_vault" "main" {
  name                = data.terraform_remote_state.platform.outputs.key_vault_name
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
}

# To retrieve Key Vault secrets using Terraform and pass them to ACI's secure_environment_variables.
# Note: The values ​​are stored in the Terraform state, so state encryption and access control are required.
data "azurerm_key_vault_secret" "orion_mongo_uri" {
  name         = "orion-mongo-uri"
  key_vault_id = data.azurerm_key_vault.main.id
}

data "azurerm_key_vault_secret" "cygnus_postgres_password" {
  name         = "cygnus-postgres-password"
  key_vault_id = data.azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "keycloak_admin" {
  name             = "keycloak-admin"
  value_wo         = var.app_keycloak_admin
  value_wo_version = 1
  key_vault_id     = data.azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "keycloak_admin_password" {
  name             = "keycloak-admin-password"
  value_wo         = var.app_keycloak_admin_password
  value_wo_version = 1
  key_vault_id     = data.azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "kc_db_username" {
  name             = "kc-db-username"
  value_wo         = data.azurerm_postgresql_flexible_server.main.administrator_login
  value_wo_version = 2
  key_vault_id     = data.azurerm_key_vault.main.id
}
