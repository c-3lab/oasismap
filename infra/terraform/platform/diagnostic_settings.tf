# Log Analytics への診断設定。
# Cosmos DB と PostgreSQL のログをプラットフォームの Log Analytics ワークスペースへ送信する。

resource "azurerm_monitor_diagnostic_setting" "cosmosdb" {
  name                       = "${azurerm_cosmosdb_account.mongo.name}-diagSettings"
  target_resource_id         = azurerm_cosmosdb_account.mongo.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "MongoRequests"
  }
}

resource "azurerm_monitor_diagnostic_setting" "postgres" {
  name                       = "${azurerm_postgresql_flexible_server.main.name}-diagSettings"
  target_resource_id         = azurerm_postgresql_flexible_server.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "PostgreSQLLogs"
  }
  enabled_log {
    category = "PostgreSQLFlexSessions"
  }
  enabled_log {
    category = "PostgreSQLFlexQueryStoreRuntime"
  }
  enabled_log {
    category = "PostgreSQLFlexQueryStoreWaitStats"
  }
  enabled_log {
    category = "PostgreSQLFlexTableStats"
  }
  enabled_log {
    category = "PostgreSQLFlexDatabaseXacts"
  }
}
