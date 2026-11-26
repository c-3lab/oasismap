# App Service の Private Endpoint（platform の SN-PE に静的 IP で配置）。
# AGW と Orion（ACI）は VNet 内の Private DNS 経由で *.azurewebsites.net をこの IP に解決する。
# App Service 側は public_network_access_enabled = false のため、インターネットからの直接アクセスは拒否される。

locals {
  app_private_endpoints = {
    frontend = {
      app_id = azurerm_linux_web_app.frontend.id
      ip     = data.terraform_remote_state.platform.outputs.pe_ip_frontend
    }
    backend = {
      app_id = azurerm_linux_web_app.backend.id
      ip     = data.terraform_remote_state.platform.outputs.pe_ip_backend
    }
    keycloak = {
      app_id = azurerm_linux_web_app.keycloak.id
      ip     = data.terraform_remote_state.platform.outputs.pe_ip_keycloak
    }
  }
}

resource "azurerm_private_endpoint" "app" {
  for_each = local.app_private_endpoints

  name                          = "${local.prefix}-PE-${each.key}"
  location                      = local.location
  resource_group_name           = local.resource_group_name
  subnet_id                     = data.terraform_remote_state.platform.outputs.subnet_pe_id
  custom_network_interface_name = "${local.prefix}-PE-${each.key}-nic"

  private_service_connection {
    name                           = "${local.prefix}-PSC-${each.key}"
    private_connection_resource_id = each.value.app_id
    subresource_names              = ["sites"]
    is_manual_connection           = false
  }

  ip_configuration {
    name               = "${each.key}-ipconfig"
    private_ip_address = each.value.ip
    subresource_name   = "sites"
    member_name        = "sites"
  }

  private_dns_zone_group {
    name                 = "default"
    private_dns_zone_ids = [data.terraform_remote_state.platform.outputs.private_dns_zone_webapp_id]
  }
}
