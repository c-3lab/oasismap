# app 層の state を参照する。keycloak-realm 実行前に app を適用済みであること。

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
