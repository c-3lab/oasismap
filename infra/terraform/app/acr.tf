locals {
  acr_name = "${var.prefix}acr${substr(md5(data.terraform_remote_state.platform.outputs.resource_group_name), 0, 8)}"
}

resource "azurerm_container_registry" "main" {
  name                = local.acr_name
  location            = var.location
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  sku                 = "Basic"
  admin_enabled       = true
}

data "azurerm_user_assigned_identity" "orion" {
  name                = data.terraform_remote_state.platform.outputs.user_assigned_identity_orion_name
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
}

resource "azurerm_role_assignment" "acr_rbac_orion_pull" {
  principal_id         = data.azurerm_user_assigned_identity.orion.principal_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.main.id
}

action "local_command" "build_orion" {
  config {
    command   = "az"
    arguments = ["acr", "build", "-r", azurerm_container_registry.main.name, "-t", var.aci_orion_image_tag, "../../../fiware/orion"]
  }
}

data "azurerm_user_assigned_identity" "mongo_cli" {
  name                = data.terraform_remote_state.platform.outputs.user_assigned_identity_mongo_cli_name
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
}

resource "azurerm_role_assignment" "acr_rbac_mongo_cli_pull" {
  principal_id         = data.azurerm_user_assigned_identity.mongo_cli.principal_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.main.id
}

action "local_command" "build_mongo_cli" {
  config {
    command   = "az"
    arguments = ["acr", "build", "-r", azurerm_container_registry.main.name, "-t", var.aci_mongo_cli_image_tag, "../../../mongo-cli-azure"]
  }
}

data "azurerm_user_assigned_identity" "cygnus" {
  name                = data.terraform_remote_state.platform.outputs.user_assigned_identity_cygnus_name
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
}

resource "azurerm_role_assignment" "acr_rbac_cygnus_pull" {
  principal_id         = data.azurerm_user_assigned_identity.cygnus.principal_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.main.id
}

action "local_command" "build_cygnus" {
  config {
    command   = "az"
    arguments = ["acr", "build", "-r", azurerm_container_registry.main.name, "-t", var.aci_cygnus_image_tag, "../../../fiware/cygnus"]
  }
}

data "azurerm_user_assigned_identity" "postgres_cli" {
  name                = data.terraform_remote_state.platform.outputs.user_assigned_identity_postgres_cli_name
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
}

resource "azurerm_role_assignment" "acr_rbac_postgres_cli_pull" {
  principal_id         = data.azurerm_user_assigned_identity.postgres_cli.principal_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.main.id
}

action "local_command" "build_postgres_cli" {
  config {
    command   = "az"
    arguments = ["acr", "build", "-r", azurerm_container_registry.main.name, "-t", var.aci_postgres_cli_image_tag, "../../../postgres-cli-azure"]
  }
}
