# Log Analytics ワークスペース。

resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.prefix}-LOG"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = var.log_analytics_sku
  retention_in_days   = var.log_analytics_retention_in_days
}
