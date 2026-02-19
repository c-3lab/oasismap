# Main resource group for platform resources (aligned with 00_create_resource_group / ARM).

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}
