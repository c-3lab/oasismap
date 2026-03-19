# Keycloak-realm layer outputs.

output "realm_id" {
  description = "Keycloak realm id (oasismap)."
  value       = keycloak_realm.oasismap.id
}
