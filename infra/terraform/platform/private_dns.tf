# App Service の Private Endpoint 用 Private DNS ゾーン。
# VNet にリンクし、VNet 内（AGW・ACI）から *.azurewebsites.net を Private Endpoint の IP に解決させる。

resource "azurerm_private_dns_zone" "webapp" {
  name                = "privatelink.azurewebsites.net"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "webapp" {
  name                  = "${var.prefix}-PDNSLINK-webapp"
  resource_group_name   = azurerm_resource_group.main.name
  private_dns_zone_name = azurerm_private_dns_zone.webapp.name
  virtual_network_id    = azurerm_virtual_network.main.id
  registration_enabled  = false
}
