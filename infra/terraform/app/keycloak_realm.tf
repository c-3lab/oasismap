# Keycloak Realm 設定（Terraform keycloak provider）
# 元の Postman/Newman 手順を keycloak/keycloak provider 5.7 に写したもの。
# 利用時: keycloak_url 未設定時は URL は app_keycloak_name から組み立てる。
# 認証は app_keycloak_admin / app_keycloak_admin_password を設定すること（Key Vault から取得して TF_VAR_ 等で渡す運用を推奨）。
# 認証フロー「general user browser」およびユーザープロファイル（keycloak_realm_user_profile）は本ファイルで実装済み。

# -----------------------------------------------------------------------------
# Provider は main.tf の required_providers に keycloak を追加済み。
# 認証は Password Grant (admin-cli + username/password) を想定。
# keycloak_url 未設定時は app_keycloak_name から URL を組み立てる。
# 認証は app_keycloak_admin / app_keycloak_admin_password を使用（Key Vault から取得して TF_VAR_ や -var で渡す運用を推奨）。
# -----------------------------------------------------------------------------

# Keycloak 接続用。未設定時は provider で app_keycloak_name から URL を組み立てる。
variable "keycloak_url" {
  description = "Keycloak server URL (e.g. https://<app-name>.azurewebsites.net). When empty, provider builds URL from app_keycloak_name."
  type        = string
  default     = ""
}

variable "keycloak_realm_name" {
  description = "Realm name to create (oasismap)."
  type        = string
  default     = "oasismap"
}

variable "keycloak_realm_display_name" {
  description = "Realm display name."
  type        = string
  default     = "地域幸福度可視化アプリ"
}

variable "keycloak_realm_display_name_html" {
  description = "Realm display name HTML."
  type        = string
  default     = "地域幸福度可視化アプリ"
}

variable "keycloak_realm_login_theme" {
  description = "Realm login theme."
  type        = string
  default     = "custom-profile"
}

variable "keycloak_realm_ssl_required" {
  description = "Realm SSL required (none, external, all)."
  type        = string
  default     = "none"
}

variable "keycloak_realm_sso_session_idle_timeout" {
  description = "Realm SSO session idle timeout. ( Go duration string format: https://pkg.go.dev/time#Duration.String )"
  type        = string
  default     = "86400s"
}

variable "keycloak_realm_sso_session_max_lifespan" {
  description = "Realm SSO session max lifespan. ( Go duration string format: https://pkg.go.dev/time#Duration.String )"
  type        = string
  default     = "7776000s"
}

variable "keycloak_realm_municipal_group_name" {
  description = "Realm group name for municipal users (managers)."
  type        = string
  default     = "managers"
}

variable "keycloak_realm_event_group_name" {
  description = "Realm group name for event users."
  type        = string
  default     = "users"
}

locals {
  # keycloak_client_base_url を var.root_domain_name から組み立てる
  # (Base URL for OIDC clients (redirect URIs / web origins).)
  keycloak_client_base_url = "https://${var.root_domain_name}"

  # keycloak_realm_user_profile 用: cities.json から都道府県・市町村リストを取得
  _cities_json       = jsondecode(file("${path.module}/../../../keycloak/cities.json"))
  prefecture_options = keys(local._cities_json)
  city_options       = flatten(values(local._cities_json))
}

# Google IdP は未設定時はリソースをスキップする想定（count 等）
variable "keycloak_google_client_id" {
  description = "Google OAuth client ID for identity provider."
  type        = string
  default     = ""
  sensitive   = true
}

variable "keycloak_google_client_secret" {
  description = "Google OAuth client secret for identity provider."
  type        = string
  default     = ""
  sensitive   = true
}

variable "keycloak_google_post_broker_login_flow_alias" {
  description = "Authentication flow alias to run after users have logged in via Google IdP (e.g. OTP). Empty string means none. Matches Postman variable PostBrokerLoginFlowAlias / keycloak README."
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# Provider 設定（keycloak_url 未設定時は app_keycloak_name、認証は app_keycloak_admin / app_keycloak_admin_password）
# -----------------------------------------------------------------------------
provider "keycloak" {
  url       = var.keycloak_url != "" ? var.keycloak_url : "https://${var.app_keycloak_name}.azurewebsites.net"
  realm     = "master"
  client_id = "admin-cli"
  username  = var.app_keycloak_admin
  password  = var.app_keycloak_admin_password
}

# -----------------------------------------------------------------------------
# Realm（Postman: レルムの追加 + レルム設定の変更）
# terraform_data.keycloak_ready に依存し、Keycloak が HTTP 200 を返すまで待ってから適用する。
# -----------------------------------------------------------------------------
resource "keycloak_realm" "oasismap" {
  realm                = var.keycloak_realm_name
  enabled              = true
  display_name         = var.keycloak_realm_display_name
  display_name_html    = var.keycloak_realm_display_name_html
  login_theme          = var.keycloak_realm_login_theme
  ssl_required         = var.keycloak_realm_ssl_required
  registration_allowed = true
  remember_me          = true

  internationalization {
    supported_locales = ["ja"]
    default_locale    = "ja"
  }

  sso_session_idle_timeout = var.keycloak_realm_sso_session_idle_timeout
  sso_session_max_lifespan = var.keycloak_realm_sso_session_max_lifespan

  depends_on = [terraform_data.keycloak_ready]
}

# -----------------------------------------------------------------------------
# Groups（Postman: 自治体向け / イベント参加者向けグループの追加）
# -----------------------------------------------------------------------------
resource "keycloak_group" "managers" {
  realm_id = keycloak_realm.oasismap.id
  name     = var.keycloak_realm_municipal_group_name
}

resource "keycloak_group" "users" {
  realm_id = keycloak_realm.oasismap.id
  name     = var.keycloak_realm_event_group_name
}

# -----------------------------------------------------------------------------
# Client Scope: audience（Postman: クライアントスコープ audience を追加）
# デフォルトの default スコープへの追加は keycloak_openid_default_client_scope 等で実施
# -----------------------------------------------------------------------------
resource "keycloak_openid_client_scope" "audience" {
  realm_id               = keycloak_realm.oasismap.id
  name                   = "audience"
  description            = ""
  include_in_token_scope = false
}

resource "keycloak_openid_audience_resolve_protocol_mapper" "audience" {
  realm_id        = keycloak_realm.oasismap.id
  client_scope_id = keycloak_openid_client_scope.audience.id
  name            = "audience resolve"
}

# Realm の default client scopes を上書き（audience を追加、email は default から外して optional に追加）。
# Postman: デフォルトクライアントスコープに audience 追加、email を optional に移動に相当。
resource "keycloak_realm_default_client_scopes" "default" {
  realm_id = keycloak_realm.oasismap.id
  default_scopes = [
    "acr",
    keycloak_openid_client_scope.audience.name,
    "basic",
    "profile",
    "role_list",
    "roles",
    "saml_organization",
    "web-origins"
  ]
}

# email を optional に追加（Postman: デフォルトクライアントスコープ optional に email を追加）
resource "keycloak_realm_optional_client_scopes" "optional" {
  realm_id = keycloak_realm.oasismap.id
  optional_scopes = [
    "address",
    "email",
    "microprofile-jwt",
    "offline_access",
    "organization",
    "phone"
  ]
}

# -----------------------------------------------------------------------------
# Profile スコープへの protocol mapper 追加（Postman: クライアントスコープ profile を修正）
# profile は組み込みスコープのため、data で参照して protocol mapper を追加
# -----------------------------------------------------------------------------
data "keycloak_openid_client_scope" "profile" {
  realm_id = keycloak_realm.oasismap.id
  name     = "profile"
}

resource "keycloak_openid_user_attribute_protocol_mapper" "profile_city" {
  realm_id            = keycloak_realm.oasismap.id
  client_scope_id     = data.keycloak_openid_client_scope.profile.id
  name                = "city"
  user_attribute      = "city"
  claim_name          = "city"
  add_to_id_token     = true
  add_to_access_token = true
  add_to_userinfo     = true
}

resource "keycloak_openid_user_attribute_protocol_mapper" "profile_prefecture" {
  realm_id            = keycloak_realm.oasismap.id
  client_scope_id     = data.keycloak_openid_client_scope.profile.id
  name                = "prefecture"
  user_attribute      = "prefecture"
  claim_name          = "prefecture"
  add_to_id_token     = true
  add_to_access_token = true
  add_to_userinfo     = true
}

resource "keycloak_openid_user_attribute_protocol_mapper" "profile_age" {
  realm_id            = keycloak_realm.oasismap.id
  client_scope_id     = data.keycloak_openid_client_scope.profile.id
  name                = "age"
  user_attribute      = "age"
  claim_name          = "age"
  add_to_id_token     = true
  add_to_access_token = true
  add_to_userinfo     = true
}

resource "keycloak_realm_user_profile" "userprofile" {
  realm_id                   = keycloak_realm.oasismap.id
  unmanaged_attribute_policy = "ENABLED"

  attribute {
    name         = "username"
    display_name = "$${username}"
    permissions {
      view = ["admin", "user"]
      edit = ["admin"]
    }
    validator {
      name   = "length"
      config = { min = 3, max = 255 }
    }
    validator {
      name = "username-prohibited-characters"
    }
    validator {
      name = "up-username-not-idn-homograph"
    }
  }

  attribute {
    name               = "email"
    display_name       = "$${email}"
    required_for_roles = ["user"]
    permissions {
      view = ["admin", "user"]
      edit = []
    }
    validator {
      name = "email"
    }
    validator {
      name   = "length"
      config = { max = 255 }
    }
  }

  attribute {
    name         = "firstName"
    display_name = "$${firstName}"
    permissions {
      view = ["admin", "user"]
      edit = []
    }
    validator {
      name   = "length"
      config = { max = 255 }
    }
    validator {
      name = "person-name-prohibited-characters"
    }
  }

  attribute {
    name         = "lastName"
    display_name = "$${lastName}"
    permissions {
      view = ["admin", "user"]
      edit = []
    }
    validator {
      name   = "length"
      config = { max = 255 }
    }
    validator {
      name = "person-name-prohibited-characters"
    }
  }

  attribute {
    name               = "nickname"
    display_name       = "$${profile.attribute.nickname}"
    required_for_roles = ["admin", "user"]
    permissions {
      view = []
      edit = ["admin", "user"]
    }
    # Java Pattern 構文: 文字クラス内のハイフンは先頭または末尾に置く（末尾でリテラル指定）
    validator {
      name   = "pattern"
      config = { pattern = "^[a-zA-Z0-9_-]+$", "error-message" = "profile.error.nickname" }
    }
  }

  attribute {
    name               = "prefecture"
    display_name       = "$${profile.attribute.prefecture}"
    required_for_roles = ["user"]
    permissions {
      view = []
      edit = ["user"]
    }
    validator {
      name   = "options"
      config = { options = jsonencode(local.prefecture_options) }
    }
    annotations = { inputType = "select" }
  }

  attribute {
    name               = "city"
    display_name       = "$${profile.attribute.city}"
    required_for_roles = ["user"]
    permissions {
      view = []
      edit = ["user"]
    }
    validator {
      name   = "options"
      config = { options = jsonencode(local.city_options) }
    }
    annotations = { inputType = "select" }
  }

  attribute {
    name               = "age"
    display_name       = "$${profile.attribute.age}"
    required_for_roles = ["user"]
    permissions {
      view = []
      edit = ["user"]
    }
    validator {
      name   = "options"
      config = { options = jsonencode(["10代以下", "20代", "30代", "40代", "50代", "60代以上", "その他"]) }
    }
    annotations = { inputType = "select" }
  }

  attribute {
    name               = "gender"
    display_name       = "$${profile.attribute.gender}"
    required_for_roles = ["user"]
    permissions {
      view = []
      edit = ["user"]
    }
    validator {
      name   = "options"
      config = { options = jsonencode(["男性", "女性", "その他", "回答しない"]) }
    }
    annotations = { inputType = "select" }
  }
}

# -----------------------------------------------------------------------------
# Google Identity Provider（Postman: Google アイデンティティプロバイダーを追加）
# keycloak 5.7 では keycloak_oidc_google_identity_provider を使用。
# postBrokerLoginFlowAlias は変数 keycloak_google_post_broker_login_flow_alias で指定。
# -----------------------------------------------------------------------------
resource "keycloak_oidc_google_identity_provider" "google" {
  count = (var.keycloak_google_client_id != "" && var.keycloak_google_client_secret != "") ? 1 : 0

  realm                                   = keycloak_realm.oasismap.realm
  client_id                               = var.keycloak_google_client_id
  client_secret                           = var.keycloak_google_client_secret
  alias                                   = "google"
  enabled                                 = true
  trust_email                             = false
  store_token                             = false
  add_read_token_role_on_create           = false
  link_only                               = false
  first_broker_login_flow_alias           = "first broker login"
  post_broker_login_flow_alias            = var.keycloak_google_post_broker_login_flow_alias
  hide_on_login_page                      = false
  accepts_prompt_none_forward_from_client = false
  disable_user_info                       = false
  sync_mode                               = "IMPORT"
  default_scopes                          = "openid"

  extra_config = {
    "updateProfileFirstLoginMode" = "on"
  }
}

# -----------------------------------------------------------------------------
# OpenID Clients
# イベント参加者向け: general-user-client（Postman: イベント参加者向けクライアントの追加）
# 認証フロー「general user browser」を keycloak_authentication_flow + execution で定義し、当クライアントの browser_id にバインドしている。
# Client secret は key_vault.tf の ephemeral.random_password で生成し Key Vault に保存、client_secret_wo で参照。
# -----------------------------------------------------------------------------
resource "keycloak_openid_client" "general_user_client" {
  realm_id                     = keycloak_realm.oasismap.id
  client_id                    = "general-user-client"
  name                         = "general-user-client"
  enabled                      = true
  access_type                  = "CONFIDENTIAL"
  standard_flow_enabled        = true
  direct_access_grants_enabled = true
  valid_redirect_uris = [
    "${local.keycloak_client_base_url}/api/auth/callback/general-user-keycloak-client"
  ]
  web_origins = [local.keycloak_client_base_url]

  authentication_flow_binding_overrides {
    browser_id = keycloak_authentication_flow.general_user_browser.id
  }
}

resource "keycloak_openid_hardcoded_claim_protocol_mapper" "general_user_client_usertype" {
  realm_id            = keycloak_realm.oasismap.id
  client_id           = keycloak_openid_client.general_user_client.id
  name                = "userType"
  claim_name          = "userType"
  claim_value         = "general"
  add_to_id_token     = true
  add_to_access_token = true
  add_to_userinfo     = true
}

# 自治体向け: admin-client（Postman: 自治体向けクライアントの追加）
resource "keycloak_openid_client" "admin_client" {
  realm_id                     = keycloak_realm.oasismap.id
  client_id                    = "admin-client"
  name                         = "admin-client"
  enabled                      = true
  access_type                  = "CONFIDENTIAL"
  standard_flow_enabled        = true
  direct_access_grants_enabled = true
  valid_redirect_uris = [
    "${local.keycloak_client_base_url}/api/auth/callback/admin-keycloak-client"
  ]
  web_origins = [local.keycloak_client_base_url]
}

resource "keycloak_openid_hardcoded_claim_protocol_mapper" "admin_client_usertype" {
  realm_id            = keycloak_realm.oasismap.id
  client_id           = keycloak_openid_client.admin_client.id
  name                = "userType"
  claim_name          = "userType"
  claim_value         = "admin"
  add_to_id_token     = true
  add_to_access_token = true
  add_to_userinfo     = true
}

# イベント参加者向け: general-user-browser（Postman: イベント参加者向け認証フローの追加）
resource "keycloak_authentication_flow" "general_user_browser" {
  realm_id    = keycloak_realm.oasismap.id
  alias       = "general user browser"
  description = "	Browser based authentication"
}

# -----------------------------------------------------------------------------
# general user browser: サブフローと execution（コピー元 JSON の level/priority に準拠）
# -----------------------------------------------------------------------------

# --- Level 0: ルートフロー直下の execution（3つ）---
# Cookie; displayName: Cookie, level 0, priority 10
resource "keycloak_authentication_execution" "general_user_browser_cookie" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_flow.general_user_browser.alias
  authenticator     = "auth-cookie"
  requirement       = "ALTERNATIVE"
  priority          = 10
}

# Kerberos; displayName: Kerberos, level 0, priority 20
resource "keycloak_authentication_execution" "general_user_browser_kerberos" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_flow.general_user_browser.alias
  authenticator     = "auth-spnego"
  requirement       = "DISABLED"
  priority          = 20
}

# Identity Provider Redirector; displayName: Identity Provider Redirector, level 0, priority 25
resource "keycloak_authentication_execution" "general_user_browser_identity_provider_redirector" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_flow.general_user_browser.alias
  authenticator     = "identity-provider-redirector"
  requirement       = "ALTERNATIVE"
  priority          = 25
}

resource "keycloak_authentication_execution_config" "general_user_browser_identity_provider_redirector_config" {
  realm_id     = keycloak_realm.oasismap.id
  execution_id = keycloak_authentication_execution.general_user_browser_identity_provider_redirector.id
  alias        = "general user browser google"
  config = {
    "defaultProvider" = "google"
  }
}

# --- Level 0: ルートフロー直下のサブフロー（2）---
# Organization; displayName: Organization, level 0, priority 26 (authenticationFlow: true)
resource "keycloak_authentication_subflow" "general_user_browser_organization" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "general user browser - organization"
  parent_flow_alias = keycloak_authentication_flow.general_user_browser.alias
  provider_id       = "basic-flow"
  requirement       = "ALTERNATIVE"
  priority          = 26
}

# forms; displayName: forms, level 0, priority 30 (authenticationFlow: true)
resource "keycloak_authentication_subflow" "general_user_browser_forms" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "general user browser - forms"
  parent_flow_alias = keycloak_authentication_flow.general_user_browser.alias
  provider_id       = "basic-flow"
  requirement       = "ALTERNATIVE"
  priority          = 30
}

# --- Level 1: Organization 内サブフロー（1）---
# Browser - Conditional Organization; displayName: Browser - Conditional Organization, level 1, priority 10
resource "keycloak_authentication_subflow" "general_user_browser_browser_conditional_organization" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "general user browser - browser conditional organization"
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_organization.alias
  provider_id       = "basic-flow"
  requirement       = "CONDITIONAL"
  priority          = 10
}

# --- Level 2: Browser - Conditional Organization 内 execution（2）---
# Condition - user configured; displayName: Condition - user configured, level 2, priority 10
resource "keycloak_authentication_execution" "general_user_browser_bco_condition_user_configured" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_organization.alias
  authenticator     = "conditional-user-configured"
  requirement       = "REQUIRED"
  priority          = 10
}

# Organization Identity-First Login; displayName: Organization Identity-First Login, level 2, priority 20
resource "keycloak_authentication_execution" "general_user_browser_bco_organization_identity_first_login" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_organization.alias
  authenticator     = "organization"
  requirement       = "ALTERNATIVE"
  priority          = 20
}

# --- Level 1: forms 内 execution（1）---
# Username Password Form; displayName: Username Password Form, level 1, priority 10
resource "keycloak_authentication_execution" "general_user_browser_forms_username_password_form" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_forms.alias
  authenticator     = "auth-username-password-form"
  requirement       = "REQUIRED"
  priority          = 10
}

# --- Level 1: forms 内サブフロー（1）---
# Browser - Conditional 2FA; displayName: Browser - Conditional 2FA, level 1, priority 20
resource "keycloak_authentication_subflow" "general_user_browser_browser_conditional_2fa" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "general user browser - browser conditional 2fa"
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_forms.alias
  provider_id       = "basic-flow"
  requirement       = "CONDITIONAL"
  priority          = 20
}

# --- Level 2: Browser - Conditional 2FA 内 execution（5）---
# Condition - user configured; displayName: Condition - user configured, level 2, priority 10
resource "keycloak_authentication_execution" "general_user_browser_2fa_condition_user_configured" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_2fa.alias
  authenticator     = "conditional-user-configured"
  requirement       = "REQUIRED"
  priority          = 10
}

# Condition - credential (alias: browser-conditional-credential)s
resource "keycloak_authentication_execution" "general_user_browser_2fa_condition_credential" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_2fa.alias
  authenticator     = "conditional-credential"
  requirement       = "REQUIRED"
  priority          = 20
}

resource "keycloak_authentication_execution_config" "general_user_browser_2fa_condition_credential_config" {
  realm_id     = keycloak_realm.oasismap.id
  execution_id = keycloak_authentication_execution.general_user_browser_2fa_condition_credential.id
  alias        = "general-user-browser-conditional-credential"
  config = {
    "credentials" : "webauthn-passwordless"
  }
}

# OTP Form; displayName: OTP Form, level 2, priority 30
resource "keycloak_authentication_execution" "general_user_browser_2fa_otp_form" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_2fa.alias
  authenticator     = "auth-otp-form"
  requirement       = "ALTERNATIVE"
  priority          = 30
}

# WebAuthn Authenticator; displayName: WebAuthn Authenticator, level 2, priority 40
resource "keycloak_authentication_execution" "general_user_browser_2fa_webauthn" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_2fa.alias
  authenticator     = "webauthn-authenticator"
  requirement       = "DISABLED"
  priority          = 40
}

# Recovery Authentication Code Form; displayName: Recovery Authentication Code Form, level 2, priority 50
resource "keycloak_authentication_execution" "general_user_browser_2fa_recovery_code_form" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_2fa.alias
  authenticator     = "auth-recovery-authn-code-form"
  requirement       = "DISABLED"
  priority          = 50
}

# Verify Profile 必須アクション（無効化。必要に応じて enabled = true に変更可能）
resource "keycloak_required_action" "verify_profile" {
  realm_id = keycloak_realm.oasismap.id
  alias    = "VERIFY_PROFILE"
  name     = "Verify Profile"
  enabled  = false
  priority = 100
}

# -----------------------------------------------------------------------------
# メモ: 認証フロー first broker login の Review Profile を REQUIRED に変更する件について、
# Keycloak Version 26.5.1 では Review Profile が標準で必須化されているため、本 Terraform での対応は不要（本項目は対応済み）。
# -----------------------------------------------------------------------------
