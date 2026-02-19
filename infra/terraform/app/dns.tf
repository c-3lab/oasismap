# DNS-dedicated resource group and Azure DNS zone (aligned with 06_create_dns-A-record).
# Zone and A records (@, backend, keycloak) point to Application Gateway public IP.

resource "azurerm_resource_group" "dns" {
  name     = var.dns_resource_group_name
  location = var.location
}

resource "azurerm_dns_zone" "main" {
  name                = var.root_domain_name
  resource_group_name = azurerm_resource_group.dns.name
}

resource "azurerm_dns_a_record" "root" {
  name                = "@"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.dns.name
  ttl                 = 300
  records             = [azurerm_public_ip.agw.ip_address]
}

resource "azurerm_dns_a_record" "backend" {
  name                = "backend"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.dns.name
  ttl                 = 300
  records             = [azurerm_public_ip.agw.ip_address]
}

resource "azurerm_dns_a_record" "keycloak" {
  name                = "keycloak"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.dns.name
  ttl                 = 300
  records             = [azurerm_public_ip.agw.ip_address]
}
