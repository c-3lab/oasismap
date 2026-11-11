#Requires -Version 5.1
$ErrorActionPreference = "Stop"

# Azure CLI を使用して、tfstate を保存するリソースグループとストレージアカウントを作成するスクリプト（Windows/PowerShell版）

# 環境変数名の定義
$requiredEnvVars = @(
    "TF_STATE_RESOURCE_GROUP_NAME",
    "TF_STATE_LOCATION",
    "TF_STATE_PREFIX",
    "AZURE_TENANT_ID"
)

foreach ($varName in $requiredEnvVars) {
    if (-not (Test-Path "env:$varName") -or [string]::IsNullOrEmpty((Get-Item "env:$varName").Value)) {
        Write-Error "$varName is not set"
    }
}

# Azure CLI の存在確認
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI could not be found"
}

# Azure CLIを使用してAzureへログインする
try {
    az login --tenant $env:AZURE_TENANT_ID
} catch {
    Write-Error "Failed to login to Azure"
}

# リソースグループ名から MD5 ハッシュを生成し、ストレージ名の suffix として使用する
$bytes = [System.Text.Encoding]::UTF8.GetBytes($env:TF_STATE_RESOURCE_GROUP_NAME)
$hash = [System.Security.Cryptography.MD5]::Create().ComputeHash($bytes)
$storageAccountNameSuffix = [BitConverter]::ToString($hash).Replace("-", "").ToLower()

# ストレージ名は `prefix` + `st` + `リソースグループ ID`
# ストレージ名の長さは 3 文字から 24 文字まで
# ストレージ名は英小文字・数字のみ
# ストレージ名はグローバル一意
# ストレージ名は DNS 名として適合していること
function Get-GeneratedStorageAccountName {
    param(
        [string]$Prefix,
        [string]$ResourceGroupMd5Hash
    )

    $prefixLength = $Prefix.Length
    $resourceGroupMd5HashLength = $ResourceGroupMd5Hash.Length
    $totalLength = $prefixLength + $resourceGroupMd5HashLength + 2
    # 最大24文字を超える場合、ハッシュを末尾から切り詰める
    if ($totalLength -gt 24) {
        $hashMaxLength = 24 - $prefixLength - 2
        $ResourceGroupMd5Hash = $ResourceGroupMd5Hash.Substring(0, $hashMaxLength)
    }

    return "${Prefix}st${ResourceGroupMd5Hash}"
}
$storageAccountName = Get-GeneratedStorageAccountName -Prefix $env:TF_STATE_PREFIX -ResourceGroupMd5Hash $storageAccountNameSuffix

# コンテナ `platform`、`app` を削除する
# データプレーン（アカウントキー）ではなく管理プレーン（ARM）経由で操作するため container-rm を使用する
foreach ($containerName in @("app", "platform")) {
    try {
        az storage container-rm delete `
            --name $containerName `
            --storage-account $storageAccountName `
            --resource-group $env:TF_STATE_RESOURCE_GROUP_NAME `
            --yes
    } catch {
        Write-Error "Failed to delete $containerName container"
    }
}

# Azure CLI を使用して、ストレージアカウントを削除する
try {
    az storage account delete `
        --name $storageAccountName `
        --resource-group $env:TF_STATE_RESOURCE_GROUP_NAME `
        --yes
} catch {
    Write-Error "Failed to delete storage account"
}

az group delete --name $env:TF_STATE_RESOURCE_GROUP_NAME --yes

# backend の設定ファイルを削除する
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$platformBackendPath = Join-Path $scriptDir "platform\config.azurerm.tfbackend"
$appBackendPath = Join-Path $scriptDir "app\config.azurerm.tfbackend"
$keycloakRealmBackendPath = Join-Path $scriptDir "keycloak-realm\config.azurerm.tfbackend"

Remove-Item -Path $keycloakRealmBackendPath
Remove-Item -Path $appBackendPath
Remove-Item -Path $platformBackendPath

$platformDotTerraformPath = Join-Path $scriptDir "platform\.terraform"
$appDotTerraformPath = Join-Path $scriptDir "app\.terraform"
$keycloakRealmDotTerraformPath = Join-Path $scriptDir "keycloak-realm\.terraform"

Remove-Item -Path $keycloakRealmDotTerraformPath -Recurse -Force
Remove-Item -Path $appDotTerraformPath -Recurse -Force
Remove-Item -Path $platformDotTerraformPath -Recurse -Force




