# Terraform 設定と Azure プロバイダー（プラットフォーム層）。
# 適用順: 先に platform、その後 app。

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
  # 認証: Azure CLI（az login）または環境変数を使用する。
}
