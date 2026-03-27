# app 層向け出力（terraform_remote_state）。app 側を更新せずに名前や型を変更しないこと。

output "resource_group_name" {
  description = "Main resource group name for app deployment."
  value       = azurerm_resource_group.main.name
}

output "resource_group_id" {
  description = "Main resource group ID (e.g. for uniqueString)."
  value       = azurerm_resource_group.main.id
}

output "vnet_id" {
  description = "VNet ID for ACI VNet integration and App Service VNet integration."
  value       = azurerm_virtual_network.main.id
}

output "vnet_name" {
  description = "VNet name (e.g. prefix-VNET)."
  value       = azurerm_virtual_network.main.name
}

output "subnet_dmz_id" {
  description = "DMZ subnet ID (App Service VNet integration)."
  value       = azurerm_subnet.dmz.id
}

output "subnet_agw_id" {
  description = "Application Gateway dedicated subnet ID (app layer AGW references this)."
  value       = azurerm_subnet.agw.id
}

output "subnet_app_id" {
  description = "App subnet ID for ACI VNet integration and Cosmos DB service endpoint."
  value       = azurerm_subnet.app.id
}

output "subnet_db_id" {
  description = "DB subnet ID (e.g. PostgreSQL delegation)."
  value       = azurerm_subnet.db.id
}

output "key_vault_id" {
  description = "Key Vault ID for Key Vault Reference and data source."
  value       = azurerm_key_vault.main.id
}

output "key_vault_name" {
  description = "Key Vault name for secret reference."
  value       = azurerm_key_vault.main.name
}

output "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID for app diagnostic settings."
  value       = azurerm_log_analytics_workspace.main.id
}

output "log_analytics_workspace_name" {
  description = "Log Analytics workspace name (e.g. prefix-LOG)."
  value       = azurerm_log_analytics_workspace.main.name
}

output "cosmosdb_account_name" {
  description = "Cosmos DB account name (e.g. for connection string from Key Vault)."
  value       = azurerm_cosmosdb_account.mongo.name
}

output "cosmosdb_database_name" {
  description = "Cosmos DB MongoDB database name (e.g. oriondb-government)."
  value       = azurerm_cosmosdb_mongo_database.orion.name
}

output "postgres_server_name" {
  description = "PostgreSQL Flexible Server name."
  value       = azurerm_postgresql_flexible_server.main.name
}

output "postgres_fqdn" {
  description = "PostgreSQL FQDN for connection strings (password from Key Vault)."
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "user_assigned_identity_orion_name" {
  description = "User Assigned Identity Name for orion."
  value       = azurerm_user_assigned_identity.orion.name
}

output "user_assigned_identity_mongo_cli_name" {
  description = "User Assigned Identity Name for mongo-cli."
  value       = azurerm_user_assigned_identity.mongo_cli.name
}

output "user_assigned_identity_postgres_cli_name" {
  description = "User Assigned Identity Name for postgres-cli."
  value       = azurerm_user_assigned_identity.postgres_cli.name
}

output "user_assigned_identity_cygnus_name" {
  description = "User Assigned Identity Name for cygnus."
  value       = azurerm_user_assigned_identity.cygnus.name
}

output "user_assigned_identity_keycloak_name" {
  description = "User Assigned Identity Name for keycloak."
  value       = azurerm_user_assigned_identity.keycloak.name
}

output "user_assigned_identity_backend_name" {
  description = "User Assigned Identity Name for backend."
  value       = azurerm_user_assigned_identity.backend.name
}

output "user_assigned_identity_frontend_name" {
  description = "User Assigned Identity Name for frontend."
  value       = azurerm_user_assigned_identity.frontend.name
}

output "user_assigned_identity_agw_name" {
  description = "User Assigned Identity Name for application gateway."
  value       = azurerm_user_assigned_identity.agw.name
}

output "action_group_id" {
  description = "Monitor Action Group ID for alert notifications (empty when alert_mail_dest_address is not set)."
  value       = length(azurerm_monitor_action_group.main) > 0 ? azurerm_monitor_action_group.main[0].id : ""
}
