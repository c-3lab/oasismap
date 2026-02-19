# State for platform layer. Storage Account is created by a separate script.
# Run: terraform init -backend-config=backend.tfvars
#      (or -backend-config="resource_group_name=..." -backend-config="storage_account_name=...")

terraform {
  backend "azurerm" {
    container_name = "platform"
    key            = "terraform.tfstate"
    # resource_group_name  = provide via -backend-config
    # storage_account_name = provide via -backend-config
  }
}
