# app 層の変数。プラットフォームの出力は data.tf（terraform_remote_state）で読み取る。

# バックエンド / remote_state: platform と同じストレージ。terraform init および platform state の読み取りに使用。
variable "backend_resource_group_name" {
  description = "Resource group name of the storage account holding Terraform state (platform and app)."
  type        = string
}

variable "backend_storage_account_name" {
  description = "Storage account name for Terraform state."
  type        = string
}

variable "prefix" {
  description = "Prefix for resource names (must match platform)."
  type        = string
}

variable "location" {
  description = "Azure region (must match platform)."
  type        = string
  default     = "japaneast"
}

# --- App Service プラン ---
variable "app_service_plan_sku" {
  description = "App Service Plan SKU (e.g. P1v3, B2)."
  type        = string
  default     = "P1v3"
}

# --- App Services（Frontend, Backend, Keycloak）---
variable "app_frontend_name" {
  description = "App Service name for Frontend (globally unique)."
  type        = string
  validation {
    condition     = length(var.app_frontend_name) < 60 && can(regex("^[a-zA-Z0-9-]+$", var.app_frontend_name))
    error_message = "App Service name for Frontend must be less than 60 characters and only contain alphanumeric characters and dashes."
  }
}

variable "app_frontend_image_tag" {
  description = "App Service image tag for Frontend."
  type        = string
  default     = "frontend:latest"
}

variable "map_default_latitude" {
  description = "Default map center latitude for frontend (e.g. NEXT_PUBLIC_MAP_DEFAULT_LATITUDE)."
  type        = string
  default     = "35.6812"
}

variable "map_default_longitude" {
  description = "Default map center longitude for frontend (e.g. NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE)."
  type        = string
  default     = "139.7671"
}

variable "map_default_zoom" {
  description = "Default map zoom level for frontend (e.g. NEXT_PUBLIC_MAP_DEFAULT_ZOOM)."
  type        = string
  default     = "10"
}

variable "default_zoom_for_collection_range" {
  description = "Default zoom for collection range (e.g. NEXT_PUBLIC_DEFAULT_ZOOM_FOR_COLLECTION_RANGE)."
  type        = string
  default     = "14"
}

variable "dataset_list_by" {
  description = "Dataset list sort key for frontend (e.g. NEXT_PUBLIC_DATASET_LIST_BY: menu, createdAt)."
  type        = string
  default     = "createdAt"
}

variable "next_public_max_cluster_radius" {
  description = "Max cluster radius for map clustering (e.g. NEXT_PUBLIC_MAX_CLUSTER_RADIUS)."
  type        = string
  default     = "50"
}

variable "app_frontend_nextauth_secret" {
  description = "NextAuth secret for frontend (NEXTAUTH_SECRET). Stored in Key Vault."
  type        = string
  sensitive   = true
}

variable "terms_municipality_name" {
  description = "Municipality name for terms of use page (NEXT_PUBLIC_TERMS_MUNICIPALITY_NAME). Set per event in tfvars."
  type        = string
  default     = "【自治体名】"
}

variable "terms_date" {
  description = "Terms of use date for terms page (NEXT_PUBLIC_TERMS_DATE). Set per event in tfvars, e.g. 2025年3月1日."
  type        = string
  default     = "yyyy年mm月dd日"
}

variable "terms_title_suffix" {
  description = "Optional title suffix for terms page (NEXT_PUBLIC_TERMS_TITLE_SUFFIX). Use empty string for production, default shows (雛形)."
  type        = string
  default     = "（雛形）"
}

variable "app_backend_name" {
  description = "App Service name for Backend (globally unique)."
  type        = string
  validation {
    condition     = length(var.app_backend_name) < 60 && can(regex("^[a-zA-Z0-9-]+$", var.app_backend_name))
    error_message = "App Service name for Backend must be less than 60 characters and only contain alphanumeric characters and dashes."
  }
}

variable "app_backend_image_tag" {
  description = "App Service image tag for Backend."
  type        = string
  default     = "backend:latest"
}

variable "orion_fiware_service" {
  description = "Fiware service name for Orion."
  type        = string
  default     = "Government"
}

variable "orion_fiware_service_path" {
  description = "Fiware service path for Orion (e.g. /Happiness)."
  type        = string
  default     = "/Happiness"
}

variable "reverse_geocoding_url" {
  description = "Optional reverse geocoding API URL for backend."
  type        = string
  default     = "https://nominatim.openstreetmap.org/reverse"
}

variable "app_keycloak_name" {
  description = "App Service name for Keycloak (globally unique)."
  type        = string
  validation {
    condition     = length(var.app_keycloak_name) < 60 && can(regex("^[a-zA-Z0-9-]+$", var.app_keycloak_name))
    error_message = "App Service name for Keycloak must be less than 60 characters and only contain alphanumeric characters and dashes."
  }
}

variable "app_keycloak_image_tag" {
  description = "App Service image tag for Keycloak."
  type        = string
  default     = "keycloak:latest"
}

variable "app_keycloak_admin" {
  description = "App Service admin username for Keycloak."
  type        = string
  sensitive   = true
}

variable "app_keycloak_admin_password" {
  description = "App Service admin password for Keycloak."
  type        = string
  sensitive   = true
}

# --- ACI（Orion, Cygnus）---
variable "aci_orion_image_tag" {
  description = "Container image tag for Orion ACI."
  type        = string
  default     = "orion:latest"
}

variable "aci_cygnus_image_tag" {
  description = "Container image tag for Cygnus ACI."
  type        = string
  default     = "cygnus:latest"
}

# --- ACI mongo-cli（ワンショット MongoDB インデックス作成）---
variable "aci_mongo_cli_image_tag" {
  description = "Container image tag for mongo-cli ACI (one-shot MongoDB index creation)."
  type        = string
  default     = "mongo-cli:latest"
}

# --- ACI postgres-cli（ワンショット PostgreSQL DB 初期化）---
variable "aci_postgres_cli_image_tag" {
  description = "Container image tag for postgres-cli ACI (one-shot PostgreSQL database initialization)."
  type        = string
  default     = "postgres-cli:latest"
}

# --- Application Gateway（アプリケーションゲートウェイ）---
variable "agw_sku" {
  description = "Application Gateway SKU (e.g. WAF_v2)."
  type        = string
  default     = "WAF_v2"
}

variable "agw_min_capacity" {
  description = "AGW min capacity (instance count)."
  type        = number
  default     = 1
}

variable "agw_max_capacity" {
  description = "AGW max capacity (instance count)."
  type        = number
  default     = 2
}

variable "agw_waf_enabled" {
  description = "WAF state: Enabled or Disabled (ARM wafEnabled)."
  type        = string
  default     = "Enabled"
  validation {
    condition     = contains(["Enabled", "Disabled"], var.agw_waf_enabled)
    error_message = "agw_waf_enabled must be Enabled or Disabled."
  }
}

variable "agw_waf_mode" {
  description = "WAF mode: Prevention or Detection."
  type        = string
  default     = "Prevention"
}

# --- ACME（Let's Encrypt）AGW 用サーバー証明書 ---
# 本番: https://acme-v02.api.letsencrypt.org/directory
# 開発時（レート制限を避けたい場合）: Let's Encrypt ステージング URL を使用する。
#   https://acme-staging-v02.api.letsencrypt.org/directory
# ステージングで発行された証明書はブラウザで信頼されないため、動作確認後に本番 URL に切り替えること。
variable "acme_server_url" {
  description = "ACME directory URL. Use staging for development to avoid rate limits."
  type        = string
  default     = "https://acme-v02.api.letsencrypt.org/directory"
}

variable "acme_registration_email" {
  description = "Email address for Let's Encrypt account registration (used for expiry notices)."
  type        = string
}

variable "agw_ssl_certificate_name" {
  description = "Key Vault certificate name for Application Gateway HTTPS listener."
  type        = string
  default     = "agw-ssl"
}

# --- DNS（app 層の専用 RG とゾーン）---
variable "dns_resource_group_name" {
  description = "Name of the DNS-dedicated resource group (e.g. prefix-dns)."
  type        = string
}

variable "root_domain_name" {
  description = "Root domain name for the DNS zone and A records (e.g. example.com)."
  type        = string
}

# 任意: 設定時は親ゾーンに NS 委任を作成する（旧 ARM 方式の子ゾーン）。
variable "parent_domain_name" {
  description = "Parent DNS zone name (e.g. example.com). When set, an NS record is created in the parent zone to delegate this root_domain_name. Leave null or empty for standalone zone only."
  type        = string
  default     = null

  validation {
    condition     = var.parent_domain_name == null || trimspace(var.parent_domain_name) == "" || (var.root_domain_name != var.parent_domain_name && endswith(var.root_domain_name, ".${var.parent_domain_name}"))
    error_message = "When parent_domain_name is set, root_domain_name must be a subdomain of it (e.g. app.example.com when parent is example.com)."
  }
}

variable "parent_zone_resource_group_name" {
  description = "Resource group name where the parent DNS zone exists. Required when parent_domain_name is set. May be the same as dns_resource_group_name if the parent zone is in the same RG."
  type        = string
  default     = null

  validation {
    condition     = var.parent_domain_name == null || trimspace(var.parent_domain_name) == "" || (var.parent_zone_resource_group_name != null && trimspace(var.parent_zone_resource_group_name) != "")
    error_message = "parent_zone_resource_group_name must be set when parent_domain_name is set and non-empty."
  }
}
