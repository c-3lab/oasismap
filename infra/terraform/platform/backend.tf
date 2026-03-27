# プラットフォーム層の state。ストレージアカウントは別スクリプトで作成する。
# 実行: terraform init -backend-config=config.azurerm.tfbackend
#      （config.azurerm.tfbackend に resource_group_name / storage_account_name を記載するか、
#       -backend-config="resource_group_name=..." -backend-config="storage_account_name=..." で指定）

terraform {
  backend "azurerm" {
    container_name = "platform"
    key            = "terraform.tfstate"
    # resource_group_name  = -backend-config で指定
    # storage_account_name = -backend-config で指定
  }
}
