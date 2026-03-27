# プラットフォーム層の変数。

variable "resource_group_name" {
  description = "Name of the resource group for all platform resources (main RG)."
  type        = string
}

variable "prefix" {
  description = "Prefix attached to each resource name (e.g. oasismap)."
  type        = string
}

variable "location" {
  description = "Azure region for resources."
  type        = string
  default     = "japaneast"
}

# --- VNet ---
variable "vnet_address_prefix" {
  description = "VNet address prefix."
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_dmz_prefix" {
  description = "DMZ subnet address prefix."
  type        = string
  default     = "10.0.0.0/24"
}

variable "subnet_app_prefix" {
  description = "App subnet address prefix."
  type        = string
  default     = "10.0.1.0/24"
}

variable "subnet_db_prefix" {
  description = "DB subnet address prefix."
  type        = string
  default     = "10.0.2.0/24"
}

variable "subnet_agw_prefix" {
  description = "Application Gateway dedicated subnet address prefix."
  type        = string
  default     = "10.0.3.0/26"
}

# --- Cosmos DB ---
variable "mongo_api_version" {
  description = "MongoDB API version for Cosmos DB."
  type        = string
  default     = "6.0"
}

variable "cosmosdb_database_name" {
  description = "Cosmos DB MongoDB database name (e.g. oriondb)."
  type        = string
  default     = "oriondb"
  validation {
    condition     = length(var.cosmosdb_database_name) < 11
    error_message = "Cosmos DB database name must be less than 11 characters (e.g. oriondb)."
  }
}

# --- PostgreSQL ---
variable "postgres_admin_login" {
  description = "PostgreSQL administrator login name."
  type        = string
  default     = "postgres"
}

# 管理者パスワード: 初回の適用のみプレースホルダーを使用し、その後ローテーションして Key Vault に保存すること。実値をコミットしないこと。
variable "postgres_admin_password" {
  description = "PostgreSQL administrator password (placeholder for template; replace via tfvars or rotate after create)."
  type        = string
  sensitive   = true
  default     = "CHANGE_ME_PLACEHOLDER"
  validation {
    condition     = can(regex("^[a-zA-Z0-9]+$", var.postgres_admin_password))
    error_message = "PostgreSQL administrator password must only contain alphanumeric characters."
  }
}


variable "postgres_sku_name" {
  description = "Azure Database for PostgreSQL SKU name (e.g. GP_Standard_D2ds_v4)."
  type        = string
  default     = "GP_Standard_D2ds_v4"
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage size in MB (min 32768 = 32GB)."
  type        = number
  default     = 32768
}

variable "postgres_version" {
  description = "PostgreSQL version (14, 15, 16)."
  type        = string
  default     = "16"
}

variable "postgres_backup_retention_days" {
  description = "PostgreSQL backup retention days."
  type        = number
  default     = 7
}

variable "postgres_geo_redundant_backup" {
  description = "PostgreSQL geo-redundant backup: Enabled or Disabled."
  type        = string
  default     = "Disabled"
}

# --- モニタリング / アラート ---
variable "alert_mail_dest_address" {
  description = "Destination email address for alert notifications (README ALERT_MAIL_DEST_ADDRESS equivalent)."
  type        = string
  default     = ""
}

variable "action_group_short_name" {
  description = "Short name for the Action Group (up to 12 characters)."
  type        = string
  default     = "ActionGroup"
  validation {
    condition     = length(var.action_group_short_name) <= 12
    error_message = "Action group short name must be at most 12 characters."
  }
}

# --- Log Analytics ---
variable "log_analytics_sku" {
  description = "Log Analytics workspace SKU (e.g. PerGB2018)."
  type        = string
  default     = "PerGB2018"
}

variable "log_analytics_retention_in_days" {
  description = "Log Analytics retention in days."
  type        = number
  default     = 30
}

# --- Key Vault ---
variable "key_vault_sku" {
  description = "Key Vault SKU: standard or premium."
  type        = string
  default     = "standard"
}
