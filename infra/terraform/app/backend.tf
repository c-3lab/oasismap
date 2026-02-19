# State for app layer. Use same storage account as platform; different container/key.
# Run: terraform init -backend-config=backend.tfvars
#      (or -backend-config="resource_group_name=..." -backend-config="storage_account_name=...")

terraform {
  backend "azurerm" {
    container_name = "app"
    key            = "terraform.tfstate"
  }
}
