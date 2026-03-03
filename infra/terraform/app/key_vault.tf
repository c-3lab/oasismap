data "azurerm_key_vault" "main" {
  name                = data.terraform_remote_state.platform.outputs.key_vault_name
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
}

# To retrieve Key Vault secrets using Terraform and pass them to ACI's secure_environment_variables.
# Note: The values ​​are stored in the Terraform state, so state encryption and access control are required.
data "azurerm_key_vault_secret" "orion_mongo_uri" {
  name         = "orion-mongo-uri"
  key_vault_id = data.azurerm_key_vault.main.id
}
