# Azure Key Vault。シークレットは Terraform では作成しない。ポータル、CLI、またはワンショットスクリプトで格納すること。
# app 層は Key Vault 参照または data ソースでシークレットを参照する。

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

# 現在のクライアント（Terraform 実行環境）がシークレット管理とポリシー設定のためにアクセスできる必要がある。
data "azurerm_client_config" "current" {}

resource "azurerm_role_assignment" "kv_rbac_terraform_admin" {
  principal_id         = data.azurerm_client_config.current.object_id
  role_definition_name = "Key Vault Administrator"
  scope                = azurerm_key_vault.main.id
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

resource "azurerm_user_assigned_identity" "mongo_cli" {
  location            = var.location
  name                = "${var.prefix}-uai-mongo-cli"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_role_assignment" "kv_rbac_mongo_cli" {
  principal_id         = azurerm_user_assigned_identity.mongo_cli.principal_id
  role_definition_name = "Key Vault Secrets User"
  scope                = azurerm_key_vault.main.id
}

resource "azurerm_user_assigned_identity" "postgres_cli" {
  location            = var.location
  name                = "${var.prefix}-uai-postgres-cli"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_role_assignment" "kv_rbac_postgres_cli" {
  principal_id         = azurerm_user_assigned_identity.postgres_cli.principal_id
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

resource "azurerm_key_vault_secret" "orion_mongo_uri" {
  name             = "orion-mongo-uri"
  value_wo         = azurerm_cosmosdb_account.mongo.primary_mongodb_connection_string
  value_wo_version = 1
  key_vault_id     = azurerm_key_vault.main.id

  depends_on = [
    azurerm_role_assignment.kv_rbac_terraform_admin
  ]
}

resource "azurerm_key_vault_secret" "cygnus_postgres_password" {
  name             = "cygnus-postgres-password"
  value_wo         = azurerm_postgresql_flexible_server.main.administrator_password
  value_wo_version = 1
  key_vault_id     = azurerm_key_vault.main.id

  depends_on = [
    azurerm_role_assignment.kv_rbac_terraform_admin
  ]
}

resource "azurerm_user_assigned_identity" "keycloak" {
  location            = var.location
  name                = "${var.prefix}-uai-keycloak"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_role_assignment" "kv_rbac_keycloak" {
  principal_id         = azurerm_user_assigned_identity.keycloak.principal_id
  role_definition_name = "Key Vault Secrets User"
  scope                = azurerm_key_vault.main.id
}

resource "azurerm_user_assigned_identity" "backend" {
  location            = var.location
  name                = "${var.prefix}-uai-backend"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_role_assignment" "kv_rbac_backend" {
  principal_id         = azurerm_user_assigned_identity.backend.principal_id
  role_definition_name = "Key Vault Secrets User"
  scope                = azurerm_key_vault.main.id
}

resource "azurerm_user_assigned_identity" "frontend" {
  location            = var.location
  name                = "${var.prefix}-uai-frontend"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_role_assignment" "kv_rbac_frontend" {
  principal_id         = azurerm_user_assigned_identity.frontend.principal_id
  role_definition_name = "Key Vault Secrets User"
  scope                = azurerm_key_vault.main.id
}

# --- Application Gateway（アプリケーションゲートウェイ）---
# Application Gateway が Key Vault から SSL 証明書を取得するための User Assigned Identity
resource "azurerm_user_assigned_identity" "agw" {
  name                = "${var.prefix}-uai-agw"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
}

resource "azurerm_role_assignment" "kv_rbac_agw" {
  principal_id         = azurerm_user_assigned_identity.agw.principal_id
  role_definition_name = "Key Vault Secrets User"
  scope                = azurerm_key_vault.main.id
}

# ここでは azurerm_key_vault_secret を作成しない。シークレット（例: postgres_password, pfx_password）は
# スクリプトまたは手作業で投入し、Terraform は参照のみ行う。
