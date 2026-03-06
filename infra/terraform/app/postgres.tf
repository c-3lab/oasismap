data "azurerm_postgresql_flexible_server" "main" {
  name                = data.terraform_remote_state.platform.outputs.postgres_server_name
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
}
