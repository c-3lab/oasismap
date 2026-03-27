# Azure Database for PostgreSQL フレキシブルサーバー。
# プライベートアクセス用のプライベート DNS ゾーンと VNet リンク。DB サブネットへの委任。

locals {
  postgres_server_name   = "${var.prefix}-postgres-${substr(md5(azurerm_resource_group.main.id), 0, 8)}"
  postgres_dns_zone_name = "${local.postgres_server_name}.private.postgres.database.azure.com"
}

resource "azurerm_private_dns_zone" "postgres" {
  name                = local.postgres_dns_zone_name
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = azurerm_virtual_network.main.name
  resource_group_name   = azurerm_resource_group.main.name
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  virtual_network_id    = azurerm_virtual_network.main.id
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = local.postgres_server_name
  resource_group_name    = azurerm_resource_group.main.name
  location               = var.location
  version                = var.postgres_version
  administrator_login    = var.postgres_admin_login
  administrator_password = var.postgres_admin_password

  sku_name   = var.postgres_sku_name
  storage_mb = var.postgres_storage_mb

  backup_retention_days        = var.postgres_backup_retention_days
  geo_redundant_backup_enabled = (var.postgres_geo_redundant_backup == "Enabled")

  delegated_subnet_id           = azurerm_subnet.db.id
  private_dns_zone_id           = azurerm_private_dns_zone.postgres.id
  public_network_access_enabled = false

  lifecycle {
    ignore_changes = [
      zone
    ]
  }
}

# 任意: 初回セットアップ時にセキュアトランスポートを OFF にできるようにする（ARM の require_secure_transport に整合）。
resource "azurerm_postgresql_flexible_server_configuration" "require_secure_transport" {
  name      = "require_secure_transport"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "off"
}
