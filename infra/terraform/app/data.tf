# プラットフォーム層の state を参照する。remote_state 用のバックエンド設定（resource_group_name, storage_account_name）は
# platform の state が保存されている場所と一致させること。
# app 層の terraform 実行時は -backend-config またはバックエンド設定ファイルで指定する。

data "terraform_remote_state" "platform" {
  backend = "azurerm"
  config = {
    resource_group_name  = var.backend_resource_group_name
    storage_account_name = var.backend_storage_account_name
    container_name       = "platform"
    key                  = "terraform.tfstate"
  }
}

# 他の .tf での記述例:
#   data.terraform_remote_state.platform.outputs.resource_group_name
#   data.terraform_remote_state.platform.outputs.vnet_id
#   data.terraform_remote_state.platform.outputs.subnet_dmz_id
#   data.terraform_remote_state.platform.outputs.subnet_app_id
#   data.terraform_remote_state.platform.outputs.key_vault_id
#   data.terraform_remote_state.platform.outputs.log_analytics_workspace_id
#   data.terraform_remote_state.platform.outputs.cosmosdb_account_name
#   data.terraform_remote_state.platform.outputs.postgres_fqdn
# など。
