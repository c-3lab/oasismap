data "azurerm_key_vault" "main" {
  name                = data.terraform_remote_state.platform.outputs.key_vault_name
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
}

# Terraform で Key Vault のシークレットを取得し、ACI の secure_environment_variables に渡すため。
# 注: 値は Terraform state に保存されるため、state の暗号化とアクセス制御が必要。
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

# Keycloak の general-user-client の Client Secret を生成する。
ephemeral "random_password" "kc_general_user_client_secret" {
  length  = 32
  special = false
}

resource "azurerm_key_vault_secret" "kc_general_user_client_secret" {
  name             = "kc-general-user-client-secret"
  value_wo         = ephemeral.random_password.kc_general_user_client_secret.result
  value_wo_version = 1
  key_vault_id     = data.azurerm_key_vault.main.id
}

# Keycloak の admin-client の Client Secret を生成する。
ephemeral "random_password" "kc_admin_client_secret" {
  length  = 32
  special = false
}

resource "azurerm_key_vault_secret" "kc_admin_client_secret" {
  name             = "kc-admin-client-secret"
  value_wo         = ephemeral.random_password.kc_admin_client_secret.result
  value_wo_version = 1
  key_vault_id     = data.azurerm_key_vault.main.id
}

# フロントエンド NextAuth のシークレット（NEXTAUTH_SECRET）。
resource "azurerm_key_vault_secret" "nextauth_secret" {
  name             = "nextauth-secret"
  value_wo         = var.app_frontend_nextauth_secret
  value_wo_version = 1
  key_vault_id     = data.azurerm_key_vault.main.id
}
