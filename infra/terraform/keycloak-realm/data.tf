# app 層の state を参照する。keycloak-realm 実行前に app を適用済みであること。

data "terraform_remote_state" "platform" {
  backend = "azurerm"
  config = {
    resource_group_name  = var.backend_resource_group_name
    storage_account_name = var.backend_storage_account_name
    container_name       = "platform"
    key                  = "terraform.tfstate"
  }
}

data "terraform_remote_state" "app" {
  backend = "azurerm"
  config = {
    resource_group_name  = var.backend_resource_group_name
    storage_account_name = var.backend_storage_account_name
    container_name       = "app"
    key                  = "terraform.tfstate"
  }
}

data "azurerm_key_vault_secret" "kc_general_user_client_secret" {
  name         = "kc-general-user-client-secret"
  key_vault_id = data.terraform_remote_state.app.outputs.key_vault_id
}

data "azurerm_key_vault_secret" "kc_admin_client_secret" {
  name         = "kc-admin-client-secret"
  key_vault_id = data.terraform_remote_state.app.outputs.key_vault_id
}

# 頻繁に使用するplatformのstateのエイリアス
locals {
  root_domain_name            = data.terraform_remote_state.platform.outputs.root_domain_name
  app_keycloak_admin          = data.terraform_remote_state.app.outputs.app_keycloak_admin
  app_keycloak_admin_password = data.terraform_remote_state.app.outputs.app_keycloak_admin_password
  acme_server_url             = data.terraform_remote_state.app.outputs.acme_server_url
  general_user_client_secret  = data.azurerm_key_vault_secret.kc_general_user_client_secret.value
  admin_client_secret         = data.azurerm_key_vault_secret.kc_admin_client_secret.value
  keycloak_client_base_url    = "https://${data.terraform_remote_state.platform.outputs.root_domain_name}"
}
