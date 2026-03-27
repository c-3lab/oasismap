# Terraform 設定と Azure プロバイダー（app 層）。
# platform 層の後に適用する。

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

    # AGW 用サーバー証明書の ACME（Let's Encrypt）。Azure DNS による DNS-01 チャレンジ。
    acme = {
      source  = "vancluever/acme"
      version = "~> 2.0"
    }

    tls = {
      source  = "hashicorp/tls"
      version = ">= 4.0.0, < 5.0.0"
    }

    random = {
      source  = "hashicorp/random"
      version = ">= 3.8.0, < 4.0.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# ACME プロバイダー。server_url で Let's Encrypt（本番またはステージング）を指定する。
# 開発時は variables.tf の acme_server_url をステージング URL に変更すること:
#   https://acme-staging-v02.api.letsencrypt.org/directory
# ACME 失敗時（DNS 未委任・レート制限など）は Terraform がエラーで停止する。修正後に再適用する。
provider "acme" {
  server_url = var.acme_server_url
}
