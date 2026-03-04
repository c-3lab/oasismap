resource "azurerm_cosmosdb_mongo_collection" "csubs" {
  name                = "csubs"
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  account_name        = data.terraform_remote_state.platform.outputs.cosmosdb_account_name
  database_name       = data.terraform_remote_state.platform.outputs.cosmosdb_database_name

  index {
    keys   = ["_id"]
    unique = true
  }
}

resource "azurerm_cosmosdb_mongo_collection" "entities" {
  name                = "entities"
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  account_name        = data.terraform_remote_state.platform.outputs.cosmosdb_account_name
  database_name       = data.terraform_remote_state.platform.outputs.cosmosdb_database_name

  index {
    keys   = ["_id"]
    unique = true
  }

  index {
    keys   = ["creDate"]
    unique = false
  }

  index {
    keys   = ["expDate"]
    unique = false
  }
}
