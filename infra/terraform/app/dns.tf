# DNS 専用リソースグループと Azure DNS ゾーン。
# ゾーンと A レコード（@, backend, keycloak）は Application Gateway のパブリック IP を指す。
# parent_domain_name 設定時は親ゾーンに NS レコードを作成する（旧 ARM 方式の委任）。

locals {
  # coalesce(null, "") は Terraform で失敗するため、try(trimspace(...), "") で null/空を安全に扱う。
  create_parent_delegation = try(trimspace(var.parent_domain_name), "") != ""
  # 親ゾーン内のサブドメインラベル（例: root_domain_name が app.example.com で親が example.com のとき "app"）
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

# 親ゾーンは Azure DNS に既に存在すること（同一サブスクリプション）。parent_domain_name 設定時のみ使用。
data "azurerm_dns_zone" "parent" {
  count               = local.create_parent_delegation ? 1 : 0
  name                = var.parent_domain_name
  resource_group_name = var.parent_zone_resource_group_name
}

# 親ゾーンでの NS 委任。親が root_domain_name を本ゾーンのネームサーバーに委任する。
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
