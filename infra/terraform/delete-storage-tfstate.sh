#!/bin/bash
set -euo pipefail

# Azure CLI を使用して、tfstate を保存するリソースグループとストレージアカウントを削除するスクリプト

# 環境変数名の定義
if [ -z "$TF_STATE_RESOURCE_GROUP_NAME" ]; then
  echo "TF_STATE_RESOURCE_GROUP_NAME is not set"
  exit 1
fi
if [ -z "$TF_STATE_LOCATION" ]; then
  echo "TF_STATE_LOCATION is not set"
  exit 1
fi
if [ -z "$TF_STATE_PREFIX" ]; then
  echo "TF_STATE_PREFIX is not set"
  exit 1
fi
if [ -z "$AZURE_TENANT_ID" ]; then
  echo "AZURE_TENANT_ID is not set"
  exit 1
fi

# Azure CLI の存在確認
if ! command -v az &> /dev/null; then
  echo "Azure CLI could not be found"
  exit 1
fi

# Azure CLIを使用してAzureへログインする
az login --tenant "${AZURE_TENANT_ID}" ||
  (echo "Failed to login to Azure" >&2 && exit 1)

# リソースグループ名から MD5 ハッシュを生成し、ストレージ名の suffix として使用する
STORAGE_ACCOUNT_NAME_SUFFIX=$(echo -n "${TF_STATE_RESOURCE_GROUP_NAME}" | md5sum | cut -d' ' -f1)

# ストレージ名は `prefix` + `st` + `リソースグループ ID`
# ストレージ名の長さは 3 文字から 24 文字まで
# ストレージ名は英小文字・数字のみ
# ストレージ名はグローバル一意
# ストレージ名は DNS 名として適合していること
generated_storage_account_name() {
    local prefix=$1
    local resource_group_md5_hash=$2

    # prefix の文字数を取得
    local prefix_length=${#prefix}
    # リソースグループ名ハッシュの文字数を取得
    local resource_group_md5_hash_length=${#resource_group_md5_hash}

    # prefix と "st" の文字数を取得
    local total_length=$((prefix_length + resource_group_md5_hash_length + 2))

    # 最大24文字を超える場合、ハッシュを末尾から切り詰める
    if [[ $total_length -gt 24 ]]; then
        local hash_max_length=$((24 - prefix_length - 2))
        resource_group_md5_hash=${resource_group_md5_hash:0:$hash_max_length}
    fi

    echo "${prefix}st${resource_group_md5_hash}"
}
STORAGE_ACCOUNT_NAME=$(generated_storage_account_name "${TF_STATE_PREFIX}" "${STORAGE_ACCOUNT_NAME_SUFFIX}")

# コンテナ `platform`、`app` を削除する
# データプレーン（アカウントキー）ではなく管理プレーン（ARM）経由で操作するため container-rm を使用する
for container_name in "app" "platform"; do
  az storage container-rm delete \
    --name "${container_name}" \
    --storage-account "${STORAGE_ACCOUNT_NAME}" \
    --resource-group "${TF_STATE_RESOURCE_GROUP_NAME}" \
    --yes ||
    (echo "Failed to delete ${container_name} container" >&2 && exit 1)
done

# Azure CLI を使用して、ストレージアカウントを削除する
az storage account delete \
  --name "${STORAGE_ACCOUNT_NAME}" \
  --resource-group "${TF_STATE_RESOURCE_GROUP_NAME}" \
  --yes ||
  (echo "Failed to delete storage account" >&2 && exit 1)

# Azure CLI を使用して、tfstate を保存するリソースグループを削除する
az group delete --name "${TF_STATE_RESOURCE_GROUP_NAME}" --yes

# backend の設定ファイルを削除する
rm keycloak-realm/config.azurerm.tfbackend
rm app/config.azurerm.tfbackend
rm platform/config.azurerm.tfbackend

rm -rf keycloak-realm/.terraform
rm -rf app/.terraform
rm -rf platform/.terraform

