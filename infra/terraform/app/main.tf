# Terraform settings and Azure provider (app layer).
# Apply after platform layer.

terraform {
  required_version = ">= 1.14.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.61.0, < 5.0.0"
    }

    keycloak = {
      source  = "keycloak/keycloak"
      version = "5.7.0"
    }

    local = {
      source  = "hashicorp/local"
      version = ">= 2.7.0, < 3.0.0"
    }

    # ACME (Let's Encrypt) for AGW server certificate. DNS-01 challenge with Azure DNS.
    acme = {
      source  = "vancluever/acme"
      version = "~> 2.0"
    }

    tls = {
      source  = "hashicorp/tls"
      version = ">= 4.0.0, < 5.0.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# ACME provider. Uses server_url for Let's Encrypt (production or staging).
# 開発時は variables.tf の acme_server_url をステージング URL に変更すること:
#   https://acme-staging-v02.api.letsencrypt.org/directory
# ACME 失敗時（DNS 未委任・レート制限など）は Terraform がエラーで停止する。修正後に再 apply。
provider "acme" {
  server_url = var.acme_server_url
}
