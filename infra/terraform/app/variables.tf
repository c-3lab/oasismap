# App layer variables. Platform outputs are read via data.tf (terraform_remote_state).

# Backend / remote_state: same storage as platform, used for terraform init and for reading platform state.
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
  default     = "Japan East"
}

# --- App Service Plan ---
variable "app_service_plan_sku" {
  description = "App Service Plan SKU (e.g. P1v2, B2)."
  type        = string
  default     = "P1v2"
}

# --- App Services (Frontend, Backend, Keycloak) ---
variable "app_frontend_name" {
  description = "App Service name for Frontend (globally unique)."
  type        = string
}

variable "app_backend_name" {
  description = "App Service name for Backend (globally unique)."
  type        = string
}

variable "app_keycloak_name" {
  description = "App Service name for Keycloak (globally unique)."
  type        = string
}

# --- ACI (Orion, Cygnus) ---
variable "aci_orion_image" {
  description = "Container image for Orion ACI."
  type        = string
  default     = "placeholder/orion:latest"
}

variable "aci_cygnus_image" {
  description = "Container image for Cygnus ACI."
  type        = string
  default     = "placeholder/cygnus:latest"
}

# --- Application Gateway ---
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

variable "agw_waf_mode" {
  description = "WAF mode: Prevention or Detection."
  type        = string
  default     = "Prevention"
}

# --- DNS (dedicated RG and zone in app layer) ---
variable "dns_resource_group_name" {
  description = "Name of the DNS-dedicated resource group (e.g. prefix-dns)."
  type        = string
}

variable "root_domain_name" {
  description = "Root domain name for the DNS zone and A records (e.g. example.com)."
  type        = string
}
