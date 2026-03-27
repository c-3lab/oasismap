# アクショングループとメトリックアラート。
# alert_mail_dest_address が設定されている場合のみ作成。

resource "azurerm_monitor_action_group" "main" {
  count               = length(var.alert_mail_dest_address) > 0 ? 1 : 0
  name                = "${var.prefix}-ALERT-AG"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = var.action_group_short_name

  email_receiver {
    name                    = "destinationEmail"
    email_address           = var.alert_mail_dest_address
    use_common_alert_schema = true
  }
}

# Cosmos DB: ServiceAvailability < 100（重大度 1）
resource "azurerm_monitor_metric_alert" "cosmosdb_availability" {
  count               = length(var.alert_mail_dest_address) > 0 ? 1 : 0
  name                = "${azurerm_cosmosdb_account.mongo.name}-ALERT-Availability"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_cosmosdb_account.mongo.id]
  description         = "Cosmos DB Service Availability below 100%"
  severity            = 1
  enabled             = true
  auto_mitigate       = true
  frequency           = "PT1M"
  window_size         = "PT1H"

  criteria {
    metric_namespace = "Microsoft.DocumentDB/databaseAccounts"
    metric_name      = "ServiceAvailability"
    aggregation      = "Average"
    operator         = "LessThan"
    threshold        = 100
  }

  action {
    action_group_id = azurerm_monitor_action_group.main[0].id
  }
}

# PostgreSQL: cpu_percent > 70（重大度 2）
resource "azurerm_monitor_metric_alert" "postgres_cpu" {
  count               = length(var.alert_mail_dest_address) > 0 ? 1 : 0
  name                = "${azurerm_postgresql_flexible_server.main.name}-ALERT-CPU"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_postgresql_flexible_server.main.id]
  description         = "PostgreSQL CPU percent above 70%"
  severity            = 2
  enabled             = true
  auto_mitigate       = true
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "cpu_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 70
  }

  action {
    action_group_id = azurerm_monitor_action_group.main[0].id
  }
}

# PostgreSQL: memory_percent > 70（重大度 2）
resource "azurerm_monitor_metric_alert" "postgres_memory" {
  count               = length(var.alert_mail_dest_address) > 0 ? 1 : 0
  name                = "${azurerm_postgresql_flexible_server.main.name}-ALERT-MEM"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_postgresql_flexible_server.main.id]
  description         = "PostgreSQL memory percent above 70%"
  severity            = 2
  enabled             = true
  auto_mitigate       = true
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "memory_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 70
  }

  action {
    action_group_id = azurerm_monitor_action_group.main[0].id
  }
}

# PostgreSQL: storage_percent > 70（重大度 2）
resource "azurerm_monitor_metric_alert" "postgres_storage" {
  count               = length(var.alert_mail_dest_address) > 0 ? 1 : 0
  name                = "${azurerm_postgresql_flexible_server.main.name}-ALERT-DISK"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_postgresql_flexible_server.main.id]
  description         = "PostgreSQL storage percent above 70%"
  severity            = 2
  enabled             = true
  auto_mitigate       = true
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "storage_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 70
  }

  action {
    action_group_id = azurerm_monitor_action_group.main[0].id
  }
}
