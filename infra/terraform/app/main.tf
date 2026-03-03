# Terraform settings and Azure provider (app layer).
# Apply after platform layer.

terraform {
  required_version = ">= 1.14.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.61.0, < 5.0.0"
    }

    local = {
      source  = "hashicorp/local"
      version = ">= 2.7.0, < 3.0.0"
    }
  }
}

provider "azurerm" {
  features {}
}
