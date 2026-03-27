# Application Gateway のメトリックアラート（08_alerts.template.json に整合）。
# プラットフォームのアクショングループが存在する場合のみ作成（alert_mail_dest_address 設定時）。

resource "azurerm_monitor_metric_alert" "agw_unhealthy_hosts" {
  count               = length(data.terraform_remote_state.platform.outputs.action_group_id) > 0 ? 1 : 0
  name                = "${azurerm_application_gateway.main.name}-ALERT-UnHealthyHosts"
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  scopes              = [azurerm_application_gateway.main.id]
  description         = "Application Gateway Unhealthy Host Count greater than 0"
  severity            = 1
  enabled             = true
  auto_mitigate       = true
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Network/applicationGateways"
    metric_name      = "UnhealthyHostCount"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 0
  }

  action {
    action_group_id = data.terraform_remote_state.platform.outputs.action_group_id
  }
}
