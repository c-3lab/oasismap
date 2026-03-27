# コンテナ用 App Service: Frontend, Backend, Keycloak。
# アプリ設定で環境変数を設定する（シークレットは Key Vault 参照でも可）。
# FQDN は Application Gateway のバックエンドで使用する。

resource "azurerm_linux_web_app" "frontend" {
  name                            = var.app_frontend_name
  location                        = var.location
  resource_group_name             = data.terraform_remote_state.platform.outputs.resource_group_name
  service_plan_id                 = azurerm_service_plan.main.id
  key_vault_reference_identity_id = data.azurerm_user_assigned_identity.frontend.id
  site_config {
    application_stack {
      docker_registry_url = "https://${azurerm_container_registry.main.login_server}"
      docker_image_name   = var.app_frontend_image_tag
    }

    container_registry_managed_identity_client_id = data.azurerm_user_assigned_identity.frontend.client_id
    container_registry_use_managed_identity       = true
    health_check_path                             = "/"
    health_check_eviction_time_in_min             = 2
  }
  identity {
    type         = "UserAssigned"
    identity_ids = [data.azurerm_user_assigned_identity.frontend.id]
  }

  app_settings = {
    NEXTAUTH_URL                                  = "https://${var.root_domain_name}"
    NEXTAUTH_SECRET                               = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault.main.vault_uri}secrets/${azurerm_key_vault_secret.nextauth_secret.name})"
    NEXT_PUBLIC_MAP_DEFAULT_LATITUDE              = var.map_default_latitude
    NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE             = var.map_default_longitude
    NEXT_PUBLIC_MAP_DEFAULT_ZOOM                  = var.map_default_zoom
    NEXT_PUBLIC_DEFAULT_ZOOM_FOR_COLLECTION_RANGE = var.default_zoom_for_collection_range
    NEXT_PUBLIC_DATASET_LIST_BY                   = var.dataset_list_by
    NEXT_PUBLIC_BACKEND_URL                       = "https://backend.${var.root_domain_name}"
    GENERAL_USER_KEYCLOAK_CLIENT_ID               = "general-user-client"
    GENERAL_USER_KEYCLOAK_CLIENT_SECRET           = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault.main.vault_uri}secrets/${azurerm_key_vault_secret.kc_general_user_client_secret.name})"
    ADMIN_KEYCLOAK_CLIENT_ID                      = "admin-client"
    ADMIN_KEYCLOAK_CLIENT_SECRET                  = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault.main.vault_uri}secrets/${azurerm_key_vault_secret.kc_admin_client_secret.name})"
    KEYCLOAK_CLIENT_ISSUER                        = "https://keycloak.${var.root_domain_name}/realms/oasismap"
    NEXT_PUBLIC_MAX_CLUSTER_RADIUS                = var.next_public_max_cluster_radius
  }

  https_only                = true
  virtual_network_subnet_id = data.terraform_remote_state.platform.outputs.subnet_dmz_id

  lifecycle {
    action_trigger {
      events  = [before_create]
      actions = [action.local_command.build_frontend]
    }
  }

  depends_on = [azurerm_role_assignment.acr_rbac_frontend_pull]
}

resource "azurerm_linux_web_app" "backend" {
  name                            = var.app_backend_name
  location                        = var.location
  resource_group_name             = data.terraform_remote_state.platform.outputs.resource_group_name
  service_plan_id                 = azurerm_service_plan.main.id
  key_vault_reference_identity_id = data.azurerm_user_assigned_identity.backend.id
  site_config {
    application_stack {
      docker_registry_url = "https://${azurerm_container_registry.main.login_server}"
      docker_image_name   = var.app_backend_image_tag
    }

    container_registry_managed_identity_client_id = data.azurerm_user_assigned_identity.backend.client_id
    container_registry_use_managed_identity       = true
    health_check_path                             = "/"
    health_check_eviction_time_in_min             = 2
  }
  identity {
    type         = "UserAssigned"
    identity_ids = [data.azurerm_user_assigned_identity.backend.id]
  }

  app_settings = {
    API_PORT                  = "4000"
    ORION_URI                 = "http://${azurerm_container_group.orion.ip_address}:1026"
    ORION_FIWARE_SERVICE      = var.orion_fiware_service
    ORION_FIWARE_SERVICE_PATH = var.orion_fiware_service_path
    ADMIN_KEYCLOAK_CLIENT_ID  = "admin-client"
    KEYCLOAK_CLIENT_ISSUER    = "https://keycloak.${var.root_domain_name}/realms/oasismap"
    FRONTEND_URL              = "https://${var.root_domain_name}"
    POSTGRES_HOST             = data.azurerm_postgresql_flexible_server.main.fqdn
    POSTGRES_PORT             = "5432"
    POSTGRES_USER             = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault.main.vault_uri}secrets/${azurerm_key_vault_secret.kc_db_username.name})"
    POSTGRES_PASSWORD         = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault.main.vault_uri}secrets/${data.azurerm_key_vault_secret.cygnus_postgres_password.name})"
    POSTGRES_DATABASE         = "cygnus"
    REVERSE_GEOCODING_URL     = var.reverse_geocoding_url
  }

  https_only                = true
  virtual_network_subnet_id = data.terraform_remote_state.platform.outputs.subnet_dmz_id

  lifecycle {
    action_trigger {
      events  = [before_create]
      actions = [action.local_command.build_backend]
    }
  }

  depends_on = [
    azurerm_container_group.orion,
    azurerm_role_assignment.acr_rbac_backend_pull,
  ]
}

resource "azurerm_linux_web_app" "keycloak" {
  name                            = var.app_keycloak_name
  location                        = var.location
  resource_group_name             = data.terraform_remote_state.platform.outputs.resource_group_name
  service_plan_id                 = azurerm_service_plan.main.id
  key_vault_reference_identity_id = data.azurerm_user_assigned_identity.keycloak.id
  site_config {
    application_stack {
      docker_registry_url = "https://${azurerm_container_registry.main.login_server}"
      docker_image_name   = var.app_keycloak_image_tag
    }

    container_registry_managed_identity_client_id = data.azurerm_user_assigned_identity.keycloak.client_id
    container_registry_use_managed_identity       = true
    health_check_path                             = "/realms/master/.well-known/openid-configuration" # Keycloak health check alternative path
    health_check_eviction_time_in_min             = 2
  }
  identity {
    type         = "UserAssigned"
    identity_ids = [data.azurerm_user_assigned_identity.keycloak.id]
  }

  app_settings = {
    # KC_HOSTNAME_URL, KEYCLOAK_CLIENT_SECRET など。シークレットは Key Vault 参照
    KC_HOSTNAME             = "https://keycloak.${var.root_domain_name}"
    KC_HOSTNAME_ADMIN       = "https://keycloak.${var.root_domain_name}"
    KC_HTTPS_PORT           = "443"
    KEYCLOAK_ADMIN          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault.main.vault_uri}secrets/${azurerm_key_vault_secret.keycloak_admin.name})"
    KEYCLOAK_ADMIN_PASSWORD = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault.main.vault_uri}secrets/${azurerm_key_vault_secret.keycloak_admin_password.name})"
    KC_DB                   = "postgres"
    KC_DB_URL               = "jdbc:postgresql://${data.azurerm_postgresql_flexible_server.main.fqdn}:5432/postgres"
    KC_DB_USERNAME          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault.main.vault_uri}secrets/${azurerm_key_vault_secret.kc_db_username.name})"
    KC_DB_PASSWORD          = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault.main.vault_uri}secrets/${data.azurerm_key_vault_secret.cygnus_postgres_password.name})"
    KC_HOSTNAME_STRICT      = "false"
    KC_HTTP_ENABLED         = "true"
    KC_PROXY_HEADERS        = "xforwarded"
    TZ                      = "Asia/Tokyo"
  }

  client_affinity_enabled   = true
  https_only                = true
  virtual_network_subnet_id = data.terraform_remote_state.platform.outputs.subnet_dmz_id

  lifecycle {
    action_trigger {
      events  = [before_create]
      actions = [action.local_command.build_keycloak]
    }
  }

  depends_on = [
    azurerm_role_assignment.acr_rbac_keycloak_pull,
    azurerm_key_vault_secret.keycloak_admin,
    azurerm_key_vault_secret.keycloak_admin_password,
    azurerm_key_vault_secret.kc_db_username,
    data.azurerm_key_vault_secret.cygnus_postgres_password
  ]
}
