# Reference platform layer state. Backend config (resource_group_name, storage_account_name)
# for remote_state must match where platform state is stored.
# Provide via -backend-config or backend config file when running app terraform.

data "terraform_remote_state" "platform" {
  backend = "azurerm"
  config = {
    resource_group_name  = var.backend_resource_group_name
    storage_account_name = var.backend_storage_account_name
    container_name       = "platform"
    key                  = "terraform.tfstate"
  }
}

# Example usage in other .tf files:
#   data.terraform_remote_state.platform.outputs.resource_group_name
#   data.terraform_remote_state.platform.outputs.vnet_id
#   data.terraform_remote_state.platform.outputs.subnet_dmz_id
#   data.terraform_remote_state.platform.outputs.subnet_app_id
#   data.terraform_remote_state.platform.outputs.key_vault_id
#   data.terraform_remote_state.platform.outputs.log_analytics_workspace_id
#   data.terraform_remote_state.platform.outputs.cosmosdb_account_name
#   data.terraform_remote_state.platform.outputs.postgres_fqdn
# etc.
