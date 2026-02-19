# App layer outputs (URLs, FQDNs for documentation and app settings).

output "app_frontend_fqdn" {
  description = "Frontend App Service default hostname (for AGW backend)."
  value       = azurerm_linux_web_app.frontend.default_hostname
}

output "app_backend_fqdn" {
  description = "Backend App Service default hostname (for AGW backend)."
  value       = azurerm_linux_web_app.backend.default_hostname
}

output "app_keycloak_fqdn" {
  description = "Keycloak App Service default hostname (for AGW backend)."
  value       = azurerm_linux_web_app.keycloak.default_hostname
}

output "agw_public_ip" {
  description = "Application Gateway public IP (for DNS A records and root/backend/keycloak URLs)."
  value       = azurerm_public_ip.agw.ip_address
}

output "dns_resource_group_name" {
  description = "DNS-dedicated resource group name."
  value       = azurerm_resource_group.dns.name
}

output "dns_zone_name" {
  description = "DNS zone name (root_domain_name)."
  value       = azurerm_dns_zone.main.name
}

output "root_url" {
  description = "Root URL (https://root_domain_name) for NEXTAUTH_URL etc."
  value       = "https://${var.root_domain_name}"
}

output "backend_url" {
  description = "Backend URL for app settings."
  value       = "https://backend.${var.root_domain_name}"
}

output "keycloak_url" {
  description = "Keycloak URL for KC_HOSTNAME_URL etc."
  value       = "https://keycloak.${var.root_domain_name}"
}
