resource "azurerm_cosmosdb_mongo_collection" "csubs" {
  name                = "csubs"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = data.terraform_remote_state.platform.outputs.cosmosdb_account_name
  database_name       = data.terraform_remote_state.platform.outputs.cosmosdb_database_name

  index {
    keys = ["_id"]
  }
}

resource "azurerm_cosmosdb_mongo_collection" "entities" {
  name                = "entities"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = data.terraform_remote_state.platform.outputs.cosmosdb_account_name
  database_name       = data.terraform_remote_state.platform.outputs.cosmosdb_database_name

  index {
    keys = ["_id"]
  }

  index {
    keys = ["creDate"]
  }
}
