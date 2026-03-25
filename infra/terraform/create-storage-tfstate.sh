#!/bin/bash
set -euo pipefail

# Azure CLI を使用して、tfstate を保存するリソースグループとストレージアカウントを作成するスクリプト

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

# リソース未存在（exit code 3）は継続、それ以外のエラーは中断する
az_ignore_not_found() {
  local output
  local exit_code
  set +e
  output=$("$@" 2>/dev/null)
  exit_code=$?
  set -e
  if [ "$exit_code" -ne 0 ] && [ "$exit_code" -ne 3 ]; then
    echo "Unexpected error from az command (exit code: $exit_code)" >&2
    exit 1
  fi
  echo "$output"
}

# Azure CLI を使用して、tfstate を保存するリソースグループを作成する
az login --tenant "${AZURE_TENANT_ID}" ||
  (echo "Failed to login to Azure" >&2 && exit 1)

resource_group_exists=$(az_ignore_not_found az group show --name "${TF_STATE_RESOURCE_GROUP_NAME}")
if [ -z "$resource_group_exists" ]; then
  az group create --name "${TF_STATE_RESOURCE_GROUP_NAME}" --location "${TF_STATE_LOCATION}"
fi

# Azure CLI を使用して、tfstate を保存するストレージアカウントを作成する
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

# Azure CLI を使用して、ストレージアカウントを作成する
az storage account create \
  --name "${STORAGE_ACCOUNT_NAME}" \
  --resource-group "${TF_STATE_RESOURCE_GROUP_NAME}" \
  --location "${TF_STATE_LOCATION}" \
  --sku "Standard_LRS" \
  --kind "StorageV2" \
  --enable-https-traffic-only "true" \
  --allow-nested-items-to-be-public "false" \
  --min-tls-version "TLS1_2" \
  --https-only "true" ||
  (echo "Failed to create storage account" >&2 && exit 1)

# コンテナ `platform`、`app` を作成する
platform_container_exists=$(az_ignore_not_found az storage container show --name "platform" --account-name "${STORAGE_ACCOUNT_NAME}")
if [ -z "$platform_container_exists" ]; then
  az storage container create --name "platform" --account-name "${STORAGE_ACCOUNT_NAME}" ||
    (echo "Failed to create platform container" >&2 && exit 1)
fi

app_container_exists=$(az_ignore_not_found az storage container show --name "app" --account-name "${STORAGE_ACCOUNT_NAME}")
if [ -z "$app_container_exists" ]; then
  az storage container create --name "app" --account-name "${STORAGE_ACCOUNT_NAME}" ||
    (echo "Failed to create app container" >&2 && exit 1)
fi

# backend の設定ファイルを作成する
cat <<EOF > platform/config.azurerm.tfbackend
resource_group_name = "${TF_STATE_RESOURCE_GROUP_NAME}"
storage_account_name = "${STORAGE_ACCOUNT_NAME}"
EOF

cat <<EOF > app/config.azurerm.tfbackend
resource_group_name = "${TF_STATE_RESOURCE_GROUP_NAME}"
storage_account_name = "${STORAGE_ACCOUNT_NAME}"
EOF

cat <<EOF > keycloak-realm/config.azurerm.tfbackend
resource_group_name = "${TF_STATE_RESOURCE_GROUP_NAME}"
storage_account_name = "${STORAGE_ACCOUNT_NAME}"
EOF
