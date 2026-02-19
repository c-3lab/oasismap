# Azure Container Instances: Orion, Cygnus. VNet integration using platform subnet_app.

resource "azurerm_container_group" "orion" {
  name                = "${var.prefix}-aci-orion"
  location            = var.location
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  ip_address_type     = "Private"
  os_type             = "Linux"
  subnet_ids          = [data.terraform_remote_state.platform.outputs.subnet_app_id]

  container {
    name   = "orion"
    image  = var.aci_orion_image
    cpu    = "0.5"
    memory = "1"
    environment_variables = {
      # Set Orion/Cosmos connection etc.; use Key Vault or placeholders
    }
  }
}

resource "azurerm_container_group" "cygnus" {
  name                = "${var.prefix}-aci-cygnus"
  location            = var.location
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  ip_address_type     = "Private"
  os_type             = "Linux"
  subnet_ids          = [data.terraform_remote_state.platform.outputs.subnet_app_id]

  container {
    name   = "cygnus"
    image  = var.aci_cygnus_image
    cpu    = "0.5"
    memory = "1"
    environment_variables = {
      # PostgreSQL etc.; use Key Vault or placeholders
    }
  }
}
