# App Service for Containers: Frontend, Backend, Keycloak.
# Set environment variables via app settings (or Key Vault Reference for secrets).
# FQDN is used by Application Gateway backends.

resource "azurerm_linux_web_app" "frontend" {
  name                = var.app_frontend_name
  location            = var.location
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  service_plan_id     = azurerm_service_plan.main.id
  site_config {
    application_stack {
      docker_image     = "placeholder/frontend"
      docker_image_tag = "latest"
    }
  }
  app_settings = {
    # NEXTAUTH_URL etc. from Key Vault Reference or output
  }
}

resource "azurerm_linux_web_app" "backend" {
  name                = var.app_backend_name
  location            = var.location
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  service_plan_id     = azurerm_service_plan.main.id
  site_config {
    application_stack {
      docker_image     = "placeholder/backend"
      docker_image_tag = "latest"
    }
  }
  app_settings = {
    # BACKEND_URL, Orion/Cosmos/PostgreSQL etc. Key Vault Reference for secrets
  }
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
    # KC_HOSTNAME_URL, KEYCLOAK_CLIENT_SECRET etc. Key Vault Reference for secrets
    KC_HOSTNAME             = "https://${var.app_keycloak_name}.azurewebsites.net"
    KC_HOSTNAME_ADMIN       = "https://${var.app_keycloak_name}.azurewebsites.net"
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

# -----------------------------------------------------------------------------
# Keycloak 稼働待ち: /realms/master/.well-known/openid-configuration が
# HTTP 200 を返すまでリトライしてから keycloak_realm 等を適用するため。
# terraform_data は組み込みリソース（provider 不要）。provisioner のコンテナとして使用。
# 実行環境: Windows の場合は PowerShell。Linux/CI や Git Bash 利用時は
# 下記の Linux 向けコマンドを local-exec に差し替える想定。
# -----------------------------------------------------------------------------
# Linux (Bash/curl) で同じ待機を行う場合の例:
#   interpreter = ["/bin/sh", "-c"]
#   command     = "url=\"$KEYCLOAK_HEALTH_URL\"; max=60; int=5; i=0; while [ $i -lt $max ]; do code=$(curl -sf -o /dev/null -w '%{http_code}' \"$url\" 2>/dev/null || echo 000); [ \"$code\" = \"200\" ] && exit 0; i=$((i+1)); sleep $int; done; echo 'Timeout waiting for Keycloak'; exit 1"
# -----------------------------------------------------------------------------
resource "terraform_data" "keycloak_ready" {
  triggers_replace = [azurerm_linux_web_app.keycloak.id]

  provisioner "local-exec" {
    interpreter = ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command"]
    environment = {
      KEYCLOAK_HEALTH_URL = "https://${azurerm_linux_web_app.keycloak.default_hostname}/realms/master/.well-known/openid-configuration"
    }
    command = <<-EOT
      $url = $env:KEYCLOAK_HEALTH_URL
      $maxAttempts = 60
      $intervalSec = 5
      $timeoutSec = 15
      for ($i = 0; $i -lt $maxAttempts; $i++) {
        try {
          $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec $timeoutSec
          if ($r.StatusCode -eq 200) { exit 0 }
        } catch {}
        Start-Sleep -Seconds $intervalSec
      }
      Write-Error 'Timeout waiting for Keycloak health (HTTP 200)'; exit 1
    EOT
  }

  depends_on = [azurerm_linux_web_app.keycloak]
}
