# Terraform settings and Azure provider (platform layer).
# Apply order: platform first, then app.

terraform {
  required_version = ">= 1.14.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.61.0, < 5.0.0"
    }
  }
}

provider "azurerm" {
  features {}
  # Authentication: use Azure CLI (az login) or environment variables.
}
