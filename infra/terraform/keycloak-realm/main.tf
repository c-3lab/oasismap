# Keycloak レルム層。app 層の後に適用する。
# keycloak プロバイダーでレルム、クライアント、アイデンティティプロバイダー、ユーザープロファイルを管理する。

terraform {
  required_version = ">= 1.14.5"

  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "5.7.0"
    }

    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.61.0, < 5.0.0"
    }
  }
}

provider "azurerm" {
  features {}
}

provider "keycloak" {
  url                      = data.terraform_remote_state.app.outputs.keycloak_url
  realm                    = "master"
  client_id                = "admin-cli"
  username                 = var.app_keycloak_admin
  password                 = var.app_keycloak_admin_password
  tls_insecure_skip_verify = var.acme_server_url == "https://acme-staging-v02.api.letsencrypt.org/directory"
}
