# Diagnostic settings to Log Analytics (aligned with 07_log-analytics).
# Application Gateway and App Services send logs to platform Log Analytics (via data source).

resource "azurerm_monitor_diagnostic_setting" "agw" {
  name                           = "${azurerm_application_gateway.main.name}-diagSettings"
  target_resource_id             = azurerm_application_gateway.main.id
  log_analytics_workspace_id     = data.azurerm_log_analytics_workspace.main.id
  log_analytics_destination_type = "Dedicated"

  enabled_log {
    category = "ApplicationGatewayAccessLog"
  }
  enabled_log {
    category = "ApplicationGatewayPerformanceLog"
  }
  enabled_log {
    category = "ApplicationGatewayFirewallLog"
  }
}

# App Service: Frontend, Backend, Keycloak (recommended per migration list)
resource "azurerm_monitor_diagnostic_setting" "frontend" {
  name                       = "${azurerm_linux_web_app.frontend.name}-diagSettings"
  target_resource_id         = azurerm_linux_web_app.frontend.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "AppServiceHTTPLogs"
  }
  enabled_log {
    category = "AppServiceConsoleLogs"
  }
}

resource "azurerm_monitor_diagnostic_setting" "backend" {
  name                       = "${azurerm_linux_web_app.backend.name}-diagSettings"
  target_resource_id         = azurerm_linux_web_app.backend.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "AppServiceHTTPLogs"
  }
  enabled_log {
    category = "AppServiceConsoleLogs"
  }
}

resource "azurerm_monitor_diagnostic_setting" "keycloak" {
  name                       = "${azurerm_linux_web_app.keycloak.name}-diagSettings"
  target_resource_id         = azurerm_linux_web_app.keycloak.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "AppServiceHTTPLogs"
  }
  enabled_log {
    category = "AppServiceConsoleLogs"
  }
}
