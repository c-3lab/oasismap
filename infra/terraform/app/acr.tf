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
