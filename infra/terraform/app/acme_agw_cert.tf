# Application Gateway 用サーバー証明書: Terraform ACME provider で Let's Encrypt を取得し、
# PFX（certificate_p12）で Azure Key Vault にインポートする。
# ACME 失敗時（DNS 未委任・レート制限など）は Terraform がエラーで停止する想定。作業者が修正後に再適用する。

# ACME アカウント用の鍵（Let's Encrypt 登録に使用）
resource "tls_private_key" "acme_account" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

# ACME アカウント登録（ステージングと本番で別アカウントになるため、server_url 切り替え時は state に注意）
resource "acme_registration" "agw" {
  account_key_pem = tls_private_key.acme_account.private_key_pem
  email_address   = var.acme_registration_email
}

# Let's Encrypt 証明書取得（DNS-01 チャレンジ / Azure DNS）
# 前提: ルートドメインの NS を Azure DNS に委任済みであること。
# 注: 旧 "azure" プロバイダは 2023 年非推奨のため "azuredns" を使用する。
# Azure 認証は ARM_CLIENT_ID, ARM_CLIENT_SECRET, ARM_TENANT_ID, ARM_SUBSCRIPTION_ID を
# 環境変数または az login で用意する。
resource "acme_certificate" "agw" {
  account_key_pem = acme_registration.agw.account_key_pem
  common_name     = var.root_domain_name

  subject_alternative_names = [
    "keycloak.${var.root_domain_name}",
    "backend.${var.root_domain_name}",
  ]

  dns_challenge {
    provider = "azuredns"
    config = {
      # Azure DNS ゾーンが存在するリソースグループ（app 層の DNS 専用 RG）
      AZURE_RESOURCE_GROUP = azurerm_resource_group.dns.name
      # ゾーン名（省略時は common_name から解決される場合あり。明示すると確実）
      AZURE_ZONE_NAME = azurerm_dns_zone.main.name
      # その他 AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET は
      # 環境変数で渡す（azurerm プロバイダと同じ認証情報でよい）
    }
  }

  # Key Vault は PFX インポートを標準でサポート。パスワード空で P12 を生成し、そのままインポートする。
  certificate_p12_password = ""

  depends_on = [azurerm_dns_a_record.root, azurerm_dns_a_record.backend, azurerm_dns_a_record.keycloak]
}

# 取得した証明書を platform の Key Vault に PFX（certificate_p12）でインポートする。
# AGW はこの証明書の versionless_secret_id を参照する。
# certificate_p12 は ACME プロバイダが Base64 で出力するため、そのまま contents に渡す。
resource "azurerm_key_vault_certificate" "agw_ssl" {
  name         = var.agw_ssl_certificate_name
  key_vault_id = data.azurerm_key_vault.main.id

  certificate {
    contents = acme_certificate.agw.certificate_p12
    password = ""
  }
}
