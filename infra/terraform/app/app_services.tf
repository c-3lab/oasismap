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
  name                = var.app_keycloak_name
  location            = var.location
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  service_plan_id     = azurerm_service_plan.main.id
  site_config {
    application_stack {
      docker_image     = "placeholder/keycloak"
      docker_image_tag = "latest"
    }
  }
  app_settings = {
    # KC_HOSTNAME_URL, KEYCLOAK_CLIENT_SECRET etc. Key Vault Reference for secrets
  }
}
