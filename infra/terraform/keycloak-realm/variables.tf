# keycloak-realm 層の変数。バックエンドと Keycloak 接続、レルム／クライアント／IdP の設定。

variable "backend_resource_group_name" {
  description = "Resource group name of the storage account holding Terraform state (app and keycloak-realm)."
  type        = string
}

variable "backend_storage_account_name" {
  description = "Storage account name for Terraform state (must match app layer)."
  type        = string
}

variable "app_keycloak_admin" {
  description = "Keycloak admin username (admin-cli). Use same value as app layer."
  type        = string
  sensitive   = true
}

variable "app_keycloak_admin_password" {
  description = "Keycloak admin password. Use same value as app layer."
  type        = string
  sensitive   = true
}

variable "acme_server_url" {
  description = "ACME directory URL. When staging, tls_insecure_skip_verify is enabled for Keycloak provider."
  type        = string
  default     = "https://acme-v02.api.letsencrypt.org/directory"
}

# --- レルム ---
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
  description = "Realm SSO session idle timeout (Go duration, e.g. 86400s)."
  type        = string
  default     = "86400s"
}

variable "keycloak_realm_sso_session_max_lifespan" {
  description = "Realm SSO session max lifespan (Go duration, e.g. 7776000s)."
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

# --- Google IdP（Google 連携）---
variable "keycloak_google_client_id" {
  description = "Google OAuth client ID for identity provider. Empty to skip."
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
  description = "Authentication flow alias after Google IdP login (e.g. OTP). Empty means none."
  type        = string
  default     = ""
}
