# App Service Plan (Linux) for Frontend, Backend, Keycloak.

# Note: By default, no quotas for App Service plans are provided in Japan East.
# https://learn.microsoft.com/ja-jp/answers/questions/2112138/app-service-plan-validationforresourcefailed
resource "azurerm_service_plan" "main" {
  name                   = "${var.prefix}-asp"
  location               = var.location
  resource_group_name    = data.terraform_remote_state.platform.outputs.resource_group_name
  os_type                = "Linux"
  sku_name               = var.app_service_plan_sku
  zone_balancing_enabled = false
}
