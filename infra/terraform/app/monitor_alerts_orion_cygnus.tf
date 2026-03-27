# Log Analytics スケジュールクエリアラート: Orion（Cygnus 通知経路）と Cygnus（PostgreSQL 永続化）。
# プラットフォームのアクショングループが存在する場合のみ作成（monitor_alerts.tf と同様）。

locals {
  orion_cygnus_alert_count = length(data.terraform_remote_state.platform.outputs.action_group_id) > 0 ? 1 : 0
}

resource "azurerm_monitor_scheduled_query_rules_alert_v2" "orion_history_notify_failure" {
  count = local.orion_cygnus_alert_count

  name                 = "${azurerm_container_group.orion.name}-ALERT-HistoryNotifyFailure"
  resource_group_name  = data.terraform_remote_state.platform.outputs.resource_group_name
  location             = data.azurerm_log_analytics_workspace.main.location
  description          = "Orion: notification to Cygnus failed or non-numeric HTTP response on Notif delivered (history pipeline)."
  display_name         = "${azurerm_container_group.orion.name} History notify failure"
  severity             = 1
  enabled              = true
  evaluation_frequency = "PT5M"
  window_duration      = "PT10M"
  scopes               = [data.azurerm_log_analytics_workspace.main.id]

  criteria {
    query = <<-KQL
      ContainerInstanceLog_CL
      | where TimeGenerated > ago(10m)
      | where ContainerName_s == 'orion'
      | where Message has 'notification failure'
        or (Message has 'Notif delivered' and not(Message matches regex @".*response code:\s*\d{3}\s*$"))
        or (Message has 'NotificationError' and not(Message has 'Releasing alarm'))
      | summarize count()
    KQL

    time_aggregation_method = "Count"
    threshold               = 0
    operator                = "GreaterThan"

    failing_periods {
      minimum_failing_periods_to_trigger_alert = 1
      number_of_evaluation_periods             = 1
    }
  }

  action {
    action_groups = [data.terraform_remote_state.platform.outputs.action_group_id]
  }

  auto_mitigation_enabled = true
}

resource "azurerm_monitor_scheduled_query_rules_alert_v2" "cygnus_history_persistence_failure" {
  count = local.orion_cygnus_alert_count

  name                 = "${azurerm_container_group.cygnus.name}-ALERT-HistoryPersistenceFailure"
  resource_group_name  = data.terraform_remote_state.platform.outputs.resource_group_name
  location             = data.azurerm_log_analytics_workspace.main.location
  description          = "Cygnus: PostgreSQL persistence error (CygnusPersistenceError / connection error) on history sink."
  display_name         = "${azurerm_container_group.cygnus.name} History persistence failure"
  severity             = 1
  enabled              = true
  evaluation_frequency = "PT5M"
  window_duration      = "PT10M"
  scopes               = [data.azurerm_log_analytics_workspace.main.id]

  criteria {
    query = <<-KQL
      ContainerInstanceLog_CL
      | where TimeGenerated > ago(10m)
      | where ContainerName_s == 'cygnus'
      | where Message has 'CygnusPersistenceError' or Message has 'POSTGRESQL Connection error'
      | summarize count()
    KQL

    time_aggregation_method = "Count"
    threshold               = 0
    operator                = "GreaterThan"

    failing_periods {
      minimum_failing_periods_to_trigger_alert = 1
      number_of_evaluation_periods             = 1
    }
  }

  action {
    action_groups = [data.terraform_remote_state.platform.outputs.action_group_id]
  }

  auto_mitigation_enabled = true
}
