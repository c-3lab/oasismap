# Application Gateway v2 / WAF。バックエンドは App Service の FQDN を指す。
# HTTPS リスナーは Key Vault の証明書を使用（acme_agw_cert.tf）。HTTP(80) は HTTPS(443) へリダイレクト。

resource "azurerm_public_ip" "agw" {
  name                = "${var.prefix}-AGWIP"
  location            = var.location
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  allocation_method   = "Static"
  sku                 = "Standard"
}

data "azurerm_user_assigned_identity" "agw" {
  name                = data.terraform_remote_state.platform.outputs.user_assigned_identity_agw_name
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
}

resource "azurerm_application_gateway" "main" {
  name                              = "${var.prefix}-AGW"
  resource_group_name               = data.terraform_remote_state.platform.outputs.resource_group_name
  location                          = var.location
  http2_enabled                     = true
  zones                             = null
  force_firewall_policy_association = true
  firewall_policy_id                = azurerm_web_application_firewall_policy.default.id

  identity {
    type         = "UserAssigned"
    identity_ids = [data.azurerm_user_assigned_identity.agw.id]
  }

  sku {
    name = var.agw_sku
    tier = var.agw_sku
    # autoscale_configuration 使用時は capacity を省略（Azure は capacity とオートスケールの併用不可）。
  }

  autoscale_configuration {
    min_capacity = var.agw_min_capacity
    max_capacity = var.agw_max_capacity
  }

  gateway_ip_configuration {
    name      = "gateway-ip"
    subnet_id = data.terraform_remote_state.platform.outputs.subnet_agw_id
  }

  frontend_port {
    name = "http"
    port = 80
  }

  frontend_port {
    name = "https"
    port = 443
  }

  frontend_ip_configuration {
    name                 = "frontend-ip"
    public_ip_address_id = azurerm_public_ip.agw.id
  }

  ssl_certificate {
    name                = "agw-ssl"
    key_vault_secret_id = azurerm_key_vault_certificate.agw_ssl.versionless_secret_id
  }

  backend_address_pool {
    name  = "frontend-pool"
    fqdns = [azurerm_linux_web_app.frontend.default_hostname]
  }
  backend_address_pool {
    name  = "backend-pool"
    fqdns = [azurerm_linux_web_app.backend.default_hostname]
  }
  backend_address_pool {
    name  = "keycloak-pool"
    fqdns = [azurerm_linux_web_app.keycloak.default_hostname]
  }

  backend_http_settings {
    name                                = "default-settings"
    cookie_based_affinity               = "Disabled"
    port                                = 443
    protocol                            = "Https"
    request_timeout                     = 30
    pick_host_name_from_backend_address = true
  }

  http_listener {
    name                           = "http"
    frontend_ip_configuration_name = "frontend-ip"
    frontend_port_name             = "http"
    protocol                       = "Http"
  }

  http_listener {
    name                           = "https-frontend"
    frontend_ip_configuration_name = "frontend-ip"
    frontend_port_name             = "https"
    protocol                       = "Https"
    ssl_certificate_name           = "agw-ssl"
    host_name                      = var.root_domain_name
  }

  http_listener {
    name                           = "https-backend"
    frontend_ip_configuration_name = "frontend-ip"
    frontend_port_name             = "https"
    protocol                       = "Https"
    ssl_certificate_name           = "agw-ssl"
    host_name                      = "backend.${var.root_domain_name}"
  }

  http_listener {
    name                           = "https-keycloak"
    frontend_ip_configuration_name = "frontend-ip"
    frontend_port_name             = "https"
    protocol                       = "Https"
    ssl_certificate_name           = "agw-ssl"
    host_name                      = "keycloak.${var.root_domain_name}"
    firewall_policy_id             = azurerm_web_application_firewall_policy.keycloak.id
  }

  redirect_configuration {
    name                 = "redirect-http-to-https"
    redirect_type        = "Permanent"
    target_listener_name = "https-frontend"
    include_path         = true
    include_query_string = true
  }

  request_routing_rule {
    name                        = "default-rule"
    rule_type                   = "Basic"
    http_listener_name          = "http"
    redirect_configuration_name = "redirect-http-to-https"
    priority                    = 100
  }

  request_routing_rule {
    name                       = "rule-frontend"
    rule_type                  = "Basic"
    http_listener_name         = "https-frontend"
    backend_address_pool_name  = "frontend-pool"
    backend_http_settings_name = "default-settings"
    priority                   = 110
  }

  request_routing_rule {
    name                       = "rule-backend"
    rule_type                  = "Basic"
    http_listener_name         = "https-backend"
    backend_address_pool_name  = "backend-pool"
    backend_http_settings_name = "default-settings"
    priority                   = 120
  }

  request_routing_rule {
    name                       = "rule-keycloak"
    rule_type                  = "Basic"
    http_listener_name         = "https-keycloak"
    backend_address_pool_name  = "keycloak-pool"
    backend_http_settings_name = "default-settings"
    priority                   = 130
  }

  depends_on = [
    azurerm_web_application_firewall_policy.default,
    azurerm_web_application_firewall_policy.keycloak,
  ]
}
