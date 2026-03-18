# DNS-dedicated resource group and Azure DNS zone (aligned with 06_create_dns-A-record).
# Zone and A records (@, backend, keycloak) point to Application Gateway public IP.
# When parent_domain_name is set, an NS record is created in the parent zone (old ARM-style delegation).

locals {
  # coalesce(null, "") fails in Terraform; use try(trimspace(...), "") so null/empty is safe.
  create_parent_delegation = try(trimspace(var.parent_domain_name), "") != ""
  # Subdomain label in parent zone (e.g. "app" when root_domain_name is app.example.com and parent is example.com)
  parent_ns_record_name = local.create_parent_delegation ? replace(var.root_domain_name, ".${var.parent_domain_name}", "") : null
}

resource "azurerm_resource_group" "dns" {
  name     = var.dns_resource_group_name
  location = var.location
}

resource "azurerm_dns_zone" "main" {
  name                = var.root_domain_name
  resource_group_name = azurerm_resource_group.dns.name
}

# Parent zone must already exist in Azure DNS (same subscription). Used only when parent_domain_name is set.
data "azurerm_dns_zone" "parent" {
  count               = local.create_parent_delegation ? 1 : 0
  name                = var.parent_domain_name
  resource_group_name = var.parent_zone_resource_group_name
}

# NS delegation in parent zone so that the parent delegates root_domain_name to this zone's name servers.
resource "azurerm_dns_ns_record" "parent_delegation" {
  count               = local.create_parent_delegation ? 1 : 0
  name                = local.parent_ns_record_name
  zone_name           = data.azurerm_dns_zone.parent[0].name
  resource_group_name = data.azurerm_dns_zone.parent[0].resource_group_name
  ttl                 = 3600
  records             = azurerm_dns_zone.main.name_servers
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
