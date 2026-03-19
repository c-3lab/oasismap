# State for keycloak-realm layer. Same storage account as app; different key.
# Run: terraform init -backend-config=backend.tfvars
#      (or -backend-config="resource_group_name=..." -backend-config="storage_account_name=...")

terraform {
  backend "azurerm" {
    container_name = "app"
    key            = "keycloak-realm.tfstate"
  }
}
