# App Service プラン（Linux）。Frontend, Backend, Keycloak 用。

# 注: 既定では Japan East に App Service プラン用クォータが付与されない場合がある。
# https://learn.microsoft.com/ja-jp/answers/questions/2112138/app-service-plan-validationforresourcefailed
resource "azurerm_service_plan" "main" {
  name                   = "${var.prefix}-asp"
  location               = var.location
  resource_group_name    = data.terraform_remote_state.platform.outputs.resource_group_name
  os_type                = "Linux"
  sku_name               = var.app_service_plan_sku
  zone_balancing_enabled = false
}
