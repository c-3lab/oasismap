# Keycloak レルム設定（keycloak-realm レイヤー）
# app レイヤー適用後に実行。Keycloak URL・root_domain_name は app の state から取得。
# 認証フロー「general user browser」およびユーザープロファイルは本ファイルで実装。

locals {
  prefecture_options       = jsondecode(file("./prefectures.json")).prefectures
  city_options             = jsondecode(file("./cities.json")).cities
  general_user_theme       = (var.keycloak_google_client_id != "" && var.keycloak_google_client_secret != "") ? var.keycloak_realm_login_theme : var.keycloak_general_user_keycloak_login_theme
}

# -----------------------------------------------------------------------------
# レルム
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
}

# -----------------------------------------------------------------------------
# グループ
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
# クライアントスコープ: audience
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

  depends_on = [keycloak_realm_default_client_scopes.default]
}

# -----------------------------------------------------------------------------
# プロファイルスコープへの protocol mapper 追加
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
# Google Identity Provider（Google アイデンティティプロバイダー）
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
# OpenID クライアント（client secret は app レイヤーで KV に保存済みのものを data で参照）
# -----------------------------------------------------------------------------
resource "keycloak_openid_client" "general_user_client" {
  realm_id                     = keycloak_realm.oasismap.id
  client_id                    = "general-user-client"
  name                         = "general-user-client"
  enabled                      = true
  access_type                  = "CONFIDENTIAL"
  standard_flow_enabled        = true
  direct_access_grants_enabled = true
  client_secret_wo             = local.general_user_client_secret
  client_secret_wo_version     = 1
  valid_redirect_uris = [
    "${local.keycloak_client_base_url}/api/auth/callback/general-user-keycloak-client"
  ]
  web_origins = [local.keycloak_client_base_url]

  login_theme  = local.general_user_theme

  dynamic "authentication_flow_binding_overrides" {
    for_each = (var.keycloak_google_client_id != "" && var.keycloak_google_client_secret != "") ? [1] : []
    content {
      browser_id = keycloak_authentication_flow.general_user_browser.id
    }
  }

  extra_config = {
    "policyUri" = "${local.keycloak_client_base_url}/terms/privacy-policy"
    "tosUri"    = "${local.keycloak_client_base_url}/terms/use"
  }

  depends_on = [keycloak_realm_optional_client_scopes.optional]
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

resource "keycloak_openid_client" "admin_client" {
  realm_id                     = keycloak_realm.oasismap.id
  client_id                    = "admin-client"
  name                         = "admin-client"
  enabled                      = true
  access_type                  = "CONFIDENTIAL"
  standard_flow_enabled        = true
  direct_access_grants_enabled = true
  client_secret_wo             = local.admin_client_secret
  client_secret_wo_version     = 1
  valid_redirect_uris = [
    "${local.keycloak_client_base_url}/api/auth/callback/admin-keycloak-client"
  ]
  web_origins = [local.keycloak_client_base_url]

  authentication_flow_binding_overrides {
    browser_id = keycloak_authentication_flow.admin_browser.id
  }

  depends_on = [keycloak_realm_optional_client_scopes.optional]
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

# -----------------------------------------------------------------------------
# Role: admin role
# -----------------------------------------------------------------------------
resource "keycloak_role" "admin_role" {
  realm_id    = keycloak_realm.oasismap.id
  name        = "admin-role"
  description = "Role for users with admin privileges"
}

# -----------------------------------------------------------------------------
# 認証フロー: general user browser
# -----------------------------------------------------------------------------
resource "keycloak_authentication_flow" "general_user_browser" {
  realm_id    = keycloak_realm.oasismap.id
  alias       = "general user browser"
  description = "\tBrowser based authentication"
}

resource "keycloak_authentication_execution" "general_user_browser_cookie" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_flow.general_user_browser.alias
  authenticator     = "auth-cookie"
  requirement       = "ALTERNATIVE"
  priority          = 10
}

resource "keycloak_authentication_execution" "general_user_browser_kerberos" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_flow.general_user_browser.alias
  authenticator     = "auth-spnego"
  requirement       = "DISABLED"
  priority          = 20
}

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

resource "keycloak_authentication_subflow" "general_user_browser_organization" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "general user browser - organization"
  parent_flow_alias = keycloak_authentication_flow.general_user_browser.alias
  provider_id       = "basic-flow"
  requirement       = "ALTERNATIVE"
  priority          = 26
}

resource "keycloak_authentication_subflow" "general_user_browser_forms" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "general user browser - forms"
  parent_flow_alias = keycloak_authentication_flow.general_user_browser.alias
  provider_id       = "basic-flow"
  requirement       = "ALTERNATIVE"
  priority          = 30
}

resource "keycloak_authentication_subflow" "general_user_browser_browser_conditional_organization" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "general user browser - browser conditional organization"
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_organization.alias
  provider_id       = "basic-flow"
  requirement       = "CONDITIONAL"
  priority          = 10
}

resource "keycloak_authentication_execution" "general_user_browser_bco_condition_user_configured" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_organization.alias
  authenticator     = "conditional-user-configured"
  requirement       = "REQUIRED"
  priority          = 10
}

resource "keycloak_authentication_execution" "general_user_browser_bco_organization_identity_first_login" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_organization.alias
  authenticator     = "organization"
  requirement       = "ALTERNATIVE"
  priority          = 20
}

resource "keycloak_authentication_execution" "general_user_browser_forms_username_password_form" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_forms.alias
  authenticator     = "auth-username-password-form"
  requirement       = "REQUIRED"
  priority          = 10
}

resource "keycloak_authentication_subflow" "general_user_browser_browser_conditional_2fa" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "general user browser - browser conditional 2fa"
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_forms.alias
  provider_id       = "basic-flow"
  requirement       = "CONDITIONAL"
  priority          = 20
}

resource "keycloak_authentication_execution" "general_user_browser_2fa_condition_user_configured" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_2fa.alias
  authenticator     = "conditional-user-configured"
  requirement       = "REQUIRED"
  priority          = 10
}

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

resource "keycloak_authentication_execution" "general_user_browser_2fa_otp_form" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_2fa.alias
  authenticator     = "auth-otp-form"
  requirement       = "ALTERNATIVE"
  priority          = 30
}

resource "keycloak_authentication_execution" "general_user_browser_2fa_webauthn" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_2fa.alias
  authenticator     = "webauthn-authenticator"
  requirement       = "DISABLED"
  priority          = 40
}

resource "keycloak_authentication_execution" "general_user_browser_2fa_recovery_code_form" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.general_user_browser_browser_conditional_2fa.alias
  authenticator     = "auth-recovery-authn-code-form"
  requirement       = "DISABLED"
  priority          = 50
}

# -----------------------------------------------------------------------------
# 認証フロー: admin browser
# -----------------------------------------------------------------------------
resource "keycloak_authentication_flow" "admin_browser" {
  realm_id    = keycloak_realm.oasismap.id
  alias       = "admin browser"
  description = "Browser based authentication for users with admin privileges"
}

resource "keycloak_authentication_execution" "admin_browser_cookie" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_flow.admin_browser.alias
  authenticator     = "auth-cookie"
  requirement       = "ALTERNATIVE"
  priority          = 10
}

resource "keycloak_authentication_execution" "admin_browser_kerberos" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_flow.admin_browser.alias
  authenticator     = "auth-spnego"
  requirement       = "DISABLED"
  priority          = 20
}

resource "keycloak_authentication_execution" "admin_browser_identity_provider_redirector" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_flow.admin_browser.alias
  authenticator     = "identity-provider-redirector"
  requirement       = "ALTERNATIVE"
  priority          = 25
}

resource "keycloak_authentication_subflow" "admin_browser_organization" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "admin browser - organization"
  parent_flow_alias = keycloak_authentication_flow.admin_browser.alias
  provider_id       = "basic-flow"
  requirement       = "ALTERNATIVE"
  priority          = 26
}

resource "keycloak_authentication_subflow" "admin_browser_forms" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "admin browser - forms"
  parent_flow_alias = keycloak_authentication_flow.admin_browser.alias
  provider_id       = "basic-flow"
  requirement       = "ALTERNATIVE"
  priority          = 30
}

resource "keycloak_authentication_subflow" "admin_browser_browser_conditional_organization" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "admin browser - browser conditional organization"
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_organization.alias
  provider_id       = "basic-flow"
  requirement       = "CONDITIONAL"
  priority          = 10
}

resource "keycloak_authentication_execution" "admin_browser_bco_condition_user_configured" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_browser_conditional_organization.alias
  authenticator     = "conditional-user-configured"
  requirement       = "REQUIRED"
  priority          = 10
}

resource "keycloak_authentication_execution" "admin_browser_bco_organization_identity_first_login" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_browser_conditional_organization.alias
  authenticator     = "organization"
  requirement       = "ALTERNATIVE"
  priority          = 20
}

resource "keycloak_authentication_execution" "admin_browser_forms_username_password_form" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_forms.alias
  authenticator     = "auth-username-password-form"
  requirement       = "REQUIRED"
  priority          = 10
}

resource "keycloak_authentication_subflow" "admin_browser_conditional_role_based_restriction" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "admin browser - role based restriction"
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_forms.alias
  provider_id       = "basic-flow"
  requirement       = "CONDITIONAL"
  priority          = 15
}

resource "keycloak_authentication_execution" "admin_browser_role_condition" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_conditional_role_based_restriction.alias
  authenticator     = "conditional-user-role"
  requirement       = "REQUIRED"
  priority          = 10
}

resource "keycloak_authentication_execution_config" "admin_browser_role_condition_config" {
  realm_id          = keycloak_realm.oasismap.id
  execution_id = keycloak_authentication_execution.admin_browser_role_condition.id
  alias        = "auth-role-condition-config"
  config = {
    "condUserRole" = keycloak_role.admin_role.name
    "role" = keycloak_role.admin_role.name
    "negate" = "true"
  }
}

resource "keycloak_authentication_execution" "admin_browser_deny_access" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_conditional_role_based_restriction.alias
  authenticator     = "deny-access-authenticator"
  requirement       = "REQUIRED"
  priority          = 20
}

resource "keycloak_authentication_subflow" "admin_browser_browser_conditional_2fa" {
  realm_id          = keycloak_realm.oasismap.id
  alias             = "admin browser - browser conditional 2fa"
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_forms.alias
  provider_id       = "basic-flow"
  requirement       = "CONDITIONAL"
  priority          = 20
}

resource "keycloak_authentication_execution" "admin_browser_2fa_condition_user_configured" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_browser_conditional_2fa.alias
  authenticator     = "conditional-user-configured"
  requirement       = "REQUIRED"
  priority          = 10
}

resource "keycloak_authentication_execution" "admin_browser_2fa_condition_credential" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_browser_conditional_2fa.alias
  authenticator     = "conditional-credential"
  requirement       = "REQUIRED"
  priority          = 20
}

resource "keycloak_authentication_execution_config" "admin_browser_2fa_condition_credential_config" {
  realm_id     = keycloak_realm.oasismap.id
  execution_id = keycloak_authentication_execution.admin_browser_2fa_condition_credential.id
  alias        = "admin-browser-conditional-credential"
  config = {
    "credentials" : "webauthn-passwordless"
  }
}

resource "keycloak_authentication_execution" "admin_browser_2fa_otp_form" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_browser_conditional_2fa.alias
  authenticator     = "auth-otp-form"
  requirement       = "ALTERNATIVE"
  priority          = 30
}

resource "keycloak_authentication_execution" "admin_browser_2fa_webauthn" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_browser_conditional_2fa.alias
  authenticator     = "webauthn-authenticator"
  requirement       = "DISABLED"
  priority          = 40
}

resource "keycloak_authentication_execution" "admin_browser_2fa_recovery_code_form" {
  realm_id          = keycloak_realm.oasismap.id
  parent_flow_alias = keycloak_authentication_subflow.admin_browser_browser_conditional_2fa.alias
  authenticator     = "auth-recovery-authn-code-form"
  requirement       = "DISABLED"
  priority          = 50
}

# -----------------------------------------------------------------------------
# ログイン時に必要なアクション
# -----------------------------------------------------------------------------
resource "keycloak_required_action" "verify_profile" {
  realm_id = keycloak_realm.oasismap.id
  alias    = "VERIFY_PROFILE"
  name     = "Verify Profile"
  enabled  = false
  priority = 100
}
