# Cosmos DB for MongoDB (aligned with 02_cosmosdb-mongodb).
# Account name: prefix-mongo-<unique suffix> for global uniqueness.

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
}

resource "azurerm_cosmosdb_mongo_database" "orion" {
  name                = var.cosmosdb_database_name
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.mongo.name
}

# Optional: Orion collections (csubs, entities). Uncomment and adjust if needed.
# resource "azurerm_cosmosdb_mongo_collection" "csubs" {
#   name                = "csubs"
#   resource_group_name = azurerm_resource_group.main.name
#   account_name        = azurerm_cosmosdb_account.mongo.name
#   database_name       = azurerm_cosmosdb_mongo_database.orion.name
# }
# resource "azurerm_cosmosdb_mongo_collection" "entities" {
#   name                = "entities"
#   resource_group_name = azurerm_resource_group.main.name
#   account_name        = azurerm_cosmosdb_account.mongo.name
#   database_name       = azurerm_cosmosdb_mongo_database.orion.name
# }
