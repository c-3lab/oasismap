# keycloak-realm 層の state。ストレージアカウントは app と同じ。キーは別。
# 実行: terraform init -backend-config=config.azurerm.tfbackend
#      （config.azurerm.tfbackend に resource_group_name / storage_account_name を記載するか、
#       -backend-config="resource_group_name=..." -backend-config="storage_account_name=..." で指定）

terraform {
  backend "azurerm" {
    container_name = "app"
    key            = "keycloak-realm.tfstate"
  }
}
