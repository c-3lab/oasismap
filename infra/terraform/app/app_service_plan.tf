# App Service Plan (Linux) for Frontend, Backend, Keycloak.

resource "azurerm_service_plan" "main" {
  name                = "${var.prefix}-asp"
  location            = var.location
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku
}
