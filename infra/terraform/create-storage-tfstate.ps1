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

# リソース未存在（exit code 3）は継続、それ以外のエラーは中断する
function Invoke-AzIgnoreNotFound {
    param([scriptblock]$Command)
    $prevErrorAction = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'
    $result = & $Command
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $prevErrorAction
    if ($exitCode -ne 0 -and $exitCode -ne 3) {
        Write-Error "Unexpected error from az command (exit code: $exitCode)"
    }
    return $result
}

# Azure CLIを使用してAzureへログインする
try {
    az login --tenant $env:AZURE_TENANT_ID
} catch {
    Write-Error "Failed to login to Azure"
}

# Azure CLIを使用してリソースグループを作成する
$resourceGroupExists = Invoke-AzIgnoreNotFound { az group show --name $env:TF_STATE_RESOURCE_GROUP_NAME 2>$null }
if (-not $resourceGroupExists) {
    az group create --name $env:TF_STATE_RESOURCE_GROUP_NAME --location $env:TF_STATE_LOCATION
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
Write-Host "Creating storage account... $storageAccountName"

# Azure CLI を使用して、tfstate を保存するストレージアカウントを作成する
try {
    az storage account create `
        --name $storageAccountName `
        --resource-group $env:TF_STATE_RESOURCE_GROUP_NAME `
        --location $env:TF_STATE_LOCATION `
        --sku "Standard_LRS" `
        --kind "StorageV2" `
        --allow-blob-public-access "false" `
        --min-tls-version "TLS1_2" `
        --https-only "true"
} catch {
    Write-Error "Failed to create storage account"
}

# コンテナ `platform`、`app` を作成する
# データプレーン（アカウントキー）ではなく管理プレーン（ARM）経由で操作するため container-rm を使用する
foreach ($containerName in @("platform", "app")) {
    $containerExists = az storage container-rm exists `
        --name $containerName `
        --storage-account $storageAccountName `
        --resource-group $env:TF_STATE_RESOURCE_GROUP_NAME `
        --query exists -o tsv
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to check $containerName container (exit code: $LASTEXITCODE)"
    }
    if ($containerExists -ne "true") {
        try {
            az storage container-rm create `
                --name $containerName `
                --storage-account $storageAccountName `
                --resource-group $env:TF_STATE_RESOURCE_GROUP_NAME
        } catch {
            Write-Error "Failed to create $containerName container"
        }
    }
}

# backend の設定ファイルを作成する
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$platformBackendPath = Join-Path $scriptDir "platform\config.azurerm.tfbackend"
$appBackendPath = Join-Path $scriptDir "app\config.azurerm.tfbackend"
$keycloakRealmBackendPath = Join-Path $scriptDir "keycloak-realm\config.azurerm.tfbackend"

$platformBackendContent = @"
resource_group_name  = "$env:TF_STATE_RESOURCE_GROUP_NAME"
storage_account_name = "$storageAccountName"
"@

$appBackendContent = @"
resource_group_name  = "$env:TF_STATE_RESOURCE_GROUP_NAME"
storage_account_name = "$storageAccountName"
"@

$keycloakRealmBackendContent = @"
resource_group_name  = "$env:TF_STATE_RESOURCE_GROUP_NAME"
storage_account_name = "$storageAccountName"
"@

Set-Content -Path $platformBackendPath -Value $platformBackendContent -Encoding UTF8
Set-Content -Path $appBackendPath -Value $appBackendContent -Encoding UTF8
Set-Content -Path $keycloakRealmBackendPath -Value $keycloakRealmBackendContent -Encoding UTF8

Write-Host "Backend configuration files created:"
Write-Host "  - $platformBackendPath"
Write-Host "  - $appBackendPath"
Write-Host "  - $keycloakRealmBackendPath"

# 存在しない場合はplatform、app、keycloak-realmのterraform.tfvarsを作成する
$platformTfvarsExamplePath = Join-Path $scriptDir "platform\terraform.tfvars.example"
$appTfvarsExamplePath = Join-Path $scriptDir "app\terraform.tfvars.example"
$keycloakRealmTfvarsExamplePath = Join-Path $scriptDir "keycloak-realm\terraform.tfvars.example"
$platformTfvarsPath = Join-Path $scriptDir "platform\terraform.tfvars"
$appTfvarsPath = Join-Path $scriptDir "app\terraform.tfvars"
$keycloakRealmTfvarsPath = Join-Path $scriptDir "keycloak-realm\terraform.tfvars"

if (-not (Test-Path $platformTfvarsPath)) {
  Copy-Item $platformTfvarsExamplePath $platformTfvarsPath
}

if (-not (Test-Path $appTfvarsPath)) {
  Copy-Item $appTfvarsExamplePath $appTfvarsPath
}

if (-not (Test-Path $keycloakRealmTfvarsPath)) {
  Copy-Item $keycloakRealmTfvarsExamplePath $keycloakRealmTfvarsPath
}

# appとkeycloak-realmのterraform.tfvarsにtfstateの情報を書き込む
if (Test-Path $appTfvarsPath) {
  (Get-Content $appTfvarsPath) -replace 'backend_resource_group_name\s*=\s*".*"', "backend_resource_group_name   = `"$env:TF_STATE_RESOURCE_GROUP_NAME`"" | Set-Content $appTfvarsPath
  (Get-Content $appTfvarsPath) -replace 'backend_storage_account_name\s*=\s*".*"', "backend_storage_account_name  = `"$storageAccountName`"" | Set-Content $appTfvarsPath
}

if (Test-Path $keycloakRealmTfvarsPath) {
  (Get-Content $keycloakRealmTfvarsPath) -replace 'backend_resource_group_name\s*=\s*".*"', "backend_resource_group_name   = `"$env:TF_STATE_RESOURCE_GROUP_NAME`"" | Set-Content $keycloakRealmTfvarsPath
  (Get-Content $keycloakRealmTfvarsPath) -replace 'backend_storage_account_name\s*=\s*".*"', "backend_storage_account_name  = `"$storageAccountName`"" | Set-Content $keycloakRealmTfvarsPath
}

