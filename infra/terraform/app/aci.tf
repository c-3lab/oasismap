# Azure Container Instances: Orion。platform の subnet_app を使った VNet 統合。

resource "azurerm_container_group" "orion" {
  name                                = "${local.prefix}-aci-orion"
  location                            = local.location
  resource_group_name                 = local.resource_group_name
  ip_address_type                     = "Private"
  os_type                             = "Linux"
  subnet_ids                          = [data.terraform_remote_state.platform.outputs.subnet_app_id]
  key_vault_user_assigned_identity_id = data.azurerm_user_assigned_identity.orion.id

  image_registry_credential {
    server                    = azurerm_container_registry.main.login_server
    user_assigned_identity_id = data.azurerm_user_assigned_identity.orion.id
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [data.azurerm_user_assigned_identity.orion.id]
  }

  container {
    name   = "orion"
    image  = "${azurerm_container_registry.main.login_server}/${var.aci_orion_image_tag}"
    cpu    = "0.5"
    memory = "1"

    ports {
      port     = 1026
      protocol = "TCP"
    }

    # ORION_TRACE（-t）は orion_trace_levels が空でない場合のみ設定する。
    environment_variables = merge(
      {
        ORION_MONGO_DB      = data.terraform_remote_state.platform.outputs.cosmosdb_database_name
        ORION_PORT          = "1026"
        ORION_MULTI_SERVICE = "true"
        ORION_LOG_LEVEL     = var.orion_log_level
      },
      var.orion_trace_levels != "" ? { ORION_TRACE = var.orion_trace_levels } : {}
    )

    secure_environment_variables = {
      ORION_MONGO_URI = data.azurerm_key_vault_secret.orion_mongo_uri.value
    }

    readiness_probe {
      initial_delay_seconds = 15
      period_seconds        = 30
      timeout_seconds       = 10
      success_threshold     = 1
      failure_threshold     = 3
      http_get {
        path   = "/version"
        port   = 1026
        scheme = "http"
      }
    }

    liveness_probe {
      initial_delay_seconds = 15
      period_seconds        = 30
      timeout_seconds       = 10
      success_threshold     = 1
      failure_threshold     = 3
      http_get {
        path   = "/version"
        port   = 1026
        scheme = "http"
      }
    }
  }

  diagnostics {
    log_analytics {
      workspace_id  = data.azurerm_log_analytics_workspace.main.workspace_id
      workspace_key = data.azurerm_log_analytics_workspace.main.primary_shared_key
    }
  }

  lifecycle {
    action_trigger {
      events  = [before_create]
      actions = [action.local_command.build_orion]
    }
  }

  depends_on = [
    azurerm_cosmosdb_mongo_collection.csubs,
    azurerm_cosmosdb_mongo_collection.entities,
    azurerm_role_assignment.acr_rbac_orion_pull
  ]
}

# ワンショット: MongoDB インデックス作成（location.coords の 2dsphere 含む）後に終了。
# 注: ACI の要件でコンテナポートを公開する必要がある。ダミーポートは 65534。
resource "azurerm_container_group" "mongo_cli" {
  name                                = "${local.prefix}-aci-mongo-cli"
  location                            = local.location
  resource_group_name                 = local.resource_group_name
  ip_address_type                     = "Private"
  os_type                             = "Linux"
  restart_policy                      = "Never"
  subnet_ids                          = [data.terraform_remote_state.platform.outputs.subnet_app_id]
  key_vault_user_assigned_identity_id = data.azurerm_user_assigned_identity.mongo_cli.id

  image_registry_credential {
    server                    = azurerm_container_registry.main.login_server
    user_assigned_identity_id = data.azurerm_user_assigned_identity.mongo_cli.id
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [data.azurerm_user_assigned_identity.mongo_cli.id]
  }

  container {
    name   = "mongo-cli"
    image  = "${azurerm_container_registry.main.login_server}/${var.aci_mongo_cli_image_tag}"
    cpu    = "0.25"
    memory = "0.5"

    ports {
      port     = 65534
      protocol = "TCP"
    }

    environment_variables = {
      MONGO_DATABASE = format("%s-%s", data.terraform_remote_state.platform.outputs.cosmosdb_database_name, lower(var.orion_fiware_service))
    }

    secure_environment_variables = {
      ORION_MONGO_URI = data.azurerm_key_vault_secret.orion_mongo_uri.value
    }
  }

  diagnostics {
    log_analytics {
      workspace_id  = data.azurerm_log_analytics_workspace.main.workspace_id
      workspace_key = data.azurerm_log_analytics_workspace.main.primary_shared_key
    }
  }

  lifecycle {
    action_trigger {
      events  = [before_create]
      actions = [action.local_command.build_mongo_cli]
    }
  }

  depends_on = [
    azurerm_cosmosdb_mongo_collection.entities,
    azurerm_role_assignment.acr_rbac_mongo_cli_pull
  ]
}

# ワンショット: PostgreSQL データベース初期化後に終了。
# 注: ACI の要件でコンテナポートを公開する必要がある。ダミーポートは 65534。
resource "azurerm_container_group" "postgres_cli" {
  name                                = "${local.prefix}-aci-postgres-cli"
  location                            = local.location
  resource_group_name                 = local.resource_group_name
  ip_address_type                     = "Private"
  os_type                             = "Linux"
  restart_policy                      = "Never"
  subnet_ids                          = [data.terraform_remote_state.platform.outputs.subnet_app_id]
  key_vault_user_assigned_identity_id = data.azurerm_user_assigned_identity.postgres_cli.id

  image_registry_credential {
    server                    = azurerm_container_registry.main.login_server
    user_assigned_identity_id = data.azurerm_user_assigned_identity.postgres_cli.id
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [data.azurerm_user_assigned_identity.postgres_cli.id]
  }

  container {
    name   = "postgres-cli"
    image  = "${azurerm_container_registry.main.login_server}/${var.aci_postgres_cli_image_tag}"
    cpu    = "0.25"
    memory = "0.5"

    ports {
      port     = 65534
      protocol = "TCP"
    }
    secure_environment_variables = {
      POSTGRES_HOST     = data.azurerm_postgresql_flexible_server.main.fqdn
      POSTGRES_PORT     = "5432"
      POSTGRES_USER     = data.azurerm_postgresql_flexible_server.main.administrator_login
      POSTGRES_PASSWORD = data.azurerm_key_vault_secret.oasismap_context_data_postgres_password.value
      POSTGRES_DB       = "postgres"
    }
  }

  diagnostics {
    log_analytics {
      workspace_id  = data.azurerm_log_analytics_workspace.main.workspace_id
      workspace_key = data.azurerm_log_analytics_workspace.main.primary_shared_key
    }
  }

  lifecycle {
    action_trigger {
      events  = [before_create]
      actions = [action.local_command.build_postgres_cli]
    }
  }

  depends_on = [
    azurerm_role_assignment.acr_rbac_postgres_cli_pull
  ]
}

# ワンショット: Orion サブスクリプション登録（happiness エンティティ変更 → Backend 通知）。
# VNet 内で実行し、プライベート IP で Orion に到達する。パブリックイメージのみ使用。
# 通知先は backend の Private Endpoint（*.azurewebsites.net を VNet 内の Private DNS で解決）。
# Orion の再作成などで再実行されても重複しないよう、登録後に同じ description の既存サブスクリプションを削除する。
resource "azurerm_container_group" "orion_subscription" {
  name                = "${local.prefix}-aci-orion-subscription"
  location            = local.location
  resource_group_name = local.resource_group_name
  ip_address_type     = "Private"
  os_type             = "Linux"
  restart_policy      = "Never"
  subnet_ids          = [data.terraform_remote_state.platform.outputs.subnet_app_id]

  container {
    name   = "orion-subscription"
    image  = "alpine:3.22"
    cpu    = "0.25"
    memory = "0.5"

    ports {
      port     = 65534
      protocol = "TCP"
    }

    environment_variables = {
      ORION_IP                 = azurerm_container_group.orion.ip_address
      FIWARE_SERVICE           = var.orion_fiware_service
      FIWARE_SERVICE_PATH      = var.orion_fiware_service_path
      SUBSCRIPTION_DESCRIPTION = local.orion_subscription_description
      SUBSCRIPTION_BODY = jsonencode({
        description = local.orion_subscription_description
        subject = {
          entities  = [{ idPattern = ".*", type = "happiness" }]
          condition = { attrs = [] }
        }
        notification = {
          http = {
            url = "https://${azurerm_linux_web_app.backend.default_hostname}/change-histories/notify"
          }
        }
      })
    }

    commands = ["/bin/sh", "-c", local.orion_subscription_script]
  }

  lifecycle {
    # Orion の ACI が正常に稼働していないと ip_address が 0.0.0.0 になる。その値で登録処理を作らないよう失敗させる。
    precondition {
      condition     = azurerm_container_group.orion.ip_address != "0.0.0.0"
      error_message = "Orion container group has no valid private IP (0.0.0.0). Check that Orion is running (az container show / az container logs) before applying."
    }
  }

  depends_on = [
    azurerm_container_group.orion,
    azurerm_linux_web_app.backend,
    azurerm_private_endpoint.app
  ]
}

locals {
  orion_subscription_description = "Notice of entities change"

  orion_subscription_script = <<-EOT
    set -euo pipefail
    apk add --no-cache curl jq > /dev/null
    URL="http://$ORION_IP:1026/v2/subscriptions"
    old_ids=$(curl -f -sS -H "Fiware-Service: $FIWARE_SERVICE" -H "Fiware-ServicePath: $FIWARE_SERVICE_PATH" "$URL?limit=1000" \
      | jq -r --arg d "$SUBSCRIPTION_DESCRIPTION" '.[] | select(.description == $d) | .id')
    printf '%s' "$SUBSCRIPTION_BODY" | curl -f -sS -X POST -H 'Content-Type: application/json' \
      -H "Fiware-Service: $FIWARE_SERVICE" -H "Fiware-ServicePath: $FIWARE_SERVICE_PATH" --data-binary @- "$URL"
    echo "created subscription"
    for id in $old_ids; do
      curl -f -sS -X DELETE -H "Fiware-Service: $FIWARE_SERVICE" -H "Fiware-ServicePath: $FIWARE_SERVICE_PATH" "$URL/$id"
      echo "deleted old subscription: $id"
    done
  EOT
}
