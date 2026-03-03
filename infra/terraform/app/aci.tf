# Azure Container Instances: Orion, Cygnus. VNet integration using platform subnet_app.

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
      events = [ before_create ]
      actions = [ action.local_command.build_orion ]
    }
  }

  depends_on = [
    azurerm_cosmosdb_mongo_collection.csubs,
    azurerm_cosmosdb_mongo_collection.entities,
    azurerm_role_assignment.acr_rbac_orion_pull
  ]
}

resource "azurerm_container_group" "cygnus" {
  name                = "${var.prefix}-aci-cygnus"
  location            = var.location
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  ip_address_type     = "Private"
  os_type             = "Linux"
  subnet_ids          = [data.terraform_remote_state.platform.outputs.subnet_app_id]

  container {
    name   = "cygnus"
    image  = var.aci_cygnus_image
    cpu    = "0.5"
    memory = "1"
    environment_variables = {
      # PostgreSQL etc.; use Key Vault or placeholders
    }
  }
}
