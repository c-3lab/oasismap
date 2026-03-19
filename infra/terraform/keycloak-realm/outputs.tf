# Keycloak-realm layer outputs.

output "realm_id" {
  description = "Keycloak realm id (oasismap)."
  value       = keycloak_realm.oasismap.id
}

output "general_user_client_redirect_uris" {
  description = "General user client redirect URIs."
  value       = keycloak_openid_client.general_user_client.redirect_uris
}

output "admin_client_redirect_uris" {
  description = "Admin client redirect URIs."
  value       = keycloak_openid_client.admin_client.redirect_uris
}
