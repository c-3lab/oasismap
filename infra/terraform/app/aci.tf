# Azure Container Instances: Orion, Cygnus。platform の subnet_app を使った VNet 統合。

resource "azurerm_container_group" "orion" {
  name                                = "${var.prefix}-aci-orion"
  location                            = var.location
  resource_group_name                 = data.terraform_remote_state.platform.outputs.resource_group_name
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

    environment_variables = {
      ORION_MONGO_DB      = data.terraform_remote_state.platform.outputs.cosmosdb_database_name
      ORION_PORT          = "1026"
      ORION_MULTI_SERVICE = "true"
      ORION_LOG_LEVEL     = "INFO"
    }

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
  name                                = "${var.prefix}-aci-mongo-cli"
  location                            = var.location
  resource_group_name                 = data.terraform_remote_state.platform.outputs.resource_group_name
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
  name                                = "${var.prefix}-aci-postgres-cli"
  location                            = var.location
  resource_group_name                 = data.terraform_remote_state.platform.outputs.resource_group_name
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
      POSTGRES_PASSWORD = data.azurerm_key_vault_secret.cygnus_postgres_password.value
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

resource "azurerm_container_group" "cygnus" {
  name                                = "${var.prefix}-aci-cygnus"
  location                            = var.location
  resource_group_name                 = data.terraform_remote_state.platform.outputs.resource_group_name
  ip_address_type                     = "Private"
  os_type                             = "Linux"
  subnet_ids                          = [data.terraform_remote_state.platform.outputs.subnet_app_id]
  key_vault_user_assigned_identity_id = data.azurerm_user_assigned_identity.cygnus.id

  image_registry_credential {
    server                    = azurerm_container_registry.main.login_server
    user_assigned_identity_id = data.azurerm_user_assigned_identity.cygnus.id
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [data.azurerm_user_assigned_identity.cygnus.id]
  }

  container {
    name   = "cygnus"
    image  = "${azurerm_container_registry.main.login_server}/${var.aci_cygnus_image_tag}"
    cpu    = "0.5"
    memory = "4"

    ports {
      port     = 5055
      protocol = "TCP"
    }

    ports {
      port     = 5080
      protocol = "TCP"
    }

    environment_variables = {
      CYGNUS_POSTGRESQL_ENABLE_CACHE     = "true"
      CYGNUS_POSTGRESQL_SERVICE_PORT     = "5055"
      CYGNUS_POSTGRESQL_DATABASE         = "cygnus"
      CYGNUS_POSTGRESQL_DATA_MODEL       = "dm-by-service-path"
      CYGNUS_POSTGRESQL_ATTR_PERSISTENCE = "column"
      CYGNUS_LOG_LEVEL                   = "INFO"
      CYGNUS_SERVICE_PORT                = "5055"
      CYGNUS_API_PORT                    = "5080"
    }

    secure_environment_variables = {
      CYGNUS_POSTGRESQL_HOST = data.azurerm_postgresql_flexible_server.main.fqdn
      CYGNUS_POSTGRESQL_PORT = "5432"
      CYGNUS_POSTGRESQL_USER = data.azurerm_postgresql_flexible_server.main.administrator_login
      CYGNUS_POSTGRESQL_PASS = data.azurerm_key_vault_secret.cygnus_postgres_password.value
    }

    readiness_probe {
      initial_delay_seconds = 30
      period_seconds        = 10
      timeout_seconds       = 5
      success_threshold     = 1
      failure_threshold     = 3
      http_get {
        path   = "/v1/version"
        port   = 5080
        scheme = "http"
      }
    }

    liveness_probe {
      initial_delay_seconds = 30
      period_seconds        = 10
      timeout_seconds       = 5
      success_threshold     = 1
      failure_threshold     = 3
      http_get {
        path   = "/v1/version"
        port   = 5080
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
      actions = [action.local_command.build_cygnus]
    }
  }

  depends_on = [
    azurerm_container_group.postgres_cli,
    azurerm_role_assignment.acr_rbac_cygnus_pull
  ]
}

# ワンショット: Orion サブスクリプション登録（happiness エンティティ変更 → Cygnus 通知）。
# VNet 内で実行し、プライベート IP で Orion / Cygnus に到達する。パブリックイメージのみ使用。
resource "azurerm_container_group" "orion_subscription" {
  name                = "${var.prefix}-aci-orion-subscription"
  location            = var.location
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  ip_address_type     = "Private"
  os_type             = "Linux"
  restart_policy      = "Never"
  subnet_ids          = [data.terraform_remote_state.platform.outputs.subnet_app_id]

  container {
    name   = "orion-subscription"
    image  = "curlimages/curl:latest"
    cpu    = "0.25"
    memory = "0.5"

    ports {
      port     = 65534
      protocol = "TCP"
    }

    environment_variables = {
      ORION_IP            = azurerm_container_group.orion.ip_address
      CYGNUS_IP           = azurerm_container_group.cygnus.ip_address
      FIWARE_SERVICE      = var.orion_fiware_service
      FIWARE_SERVICE_PATH = var.orion_fiware_service_path
      SUBSCRIPTION_BODY = jsonencode({
        description = "Notice of entities change"
        subject = {
          entities  = [{ idPattern = ".*", type = "happiness" }]
          condition = { attrs = [] }
        }
        notification = {
          http = {
            url = "http://${azurerm_container_group.cygnus.ip_address}:5055/notify"
          }
        }
      })
    }

    commands = ["/bin/sh", "-c", "echo \"$SUBSCRIPTION_BODY\" > /tmp/body.json && curl -f -sS -X POST -H 'Content-Type: application/json' -H \"Fiware-Service: $FIWARE_SERVICE\" -H \"Fiware-ServicePath: $FIWARE_SERVICE_PATH\" -d @/tmp/body.json \"http://$ORION_IP:1026/v2/subscriptions\""]
  }

  depends_on = [
    azurerm_container_group.orion,
    azurerm_container_group.cygnus
  ]
}
