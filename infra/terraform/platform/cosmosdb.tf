# MongoDB 用 Cosmos DB。
# アカウント名: グローバル一意性のため prefix-mongo-<一意のサフィックス>。

resource "azurerm_cosmosdb_account" "mongo" {
  name                = "${var.prefix}-mongo-${substr(md5(azurerm_resource_group.main.id), 0, 8)}"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "MongoDB"

  capabilities {
    name = "EnableMongo"
  }
  capabilities {
    name = "EnableServerless"
  }

  consistency_policy {
    consistency_level       = "Session"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  geo_location {
    location          = var.location
    failover_priority = 0
  }

  mongo_server_version = var.mongo_api_version

  minimal_tls_version           = "Tls12"
  public_network_access_enabled = true

  capacity {
    total_throughput_limit = 4000
  }

  is_virtual_network_filter_enabled = true

  virtual_network_rule {
    id = azurerm_subnet.app.id
  }

  ip_range_filter = [
    "20.245.161.131",
    "20.253.192.12",
    "20.43.245.209",
    "20.66.22.66",
    "40.118.133.244",
    "57.154.182.51",
    "13.88.56.148",
    "13.91.105.215",
    "13.95.130.121",
    "20.245.81.54",
    "4.210.172.107",
    "40.118.23.126",
    "40.80.152.199",
    "40.91.218.243",
  ]
}

resource "azurerm_cosmosdb_mongo_database" "orion" {
  name                = var.cosmosdb_database_name
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.mongo.name
}
