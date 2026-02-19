# Application Gateway v2 / WAF. Backends point to App Service FQDNs.
# Certificate for HTTPS: add Key Vault reference or upload manually; listener is HTTP only in this template.

resource "azurerm_public_ip" "agw" {
  name                = "${var.prefix}-AGWIP"
  location            = var.location
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_application_gateway" "main" {
  name                              = "${var.prefix}-AGW"
  resource_group_name               = data.terraform_remote_state.platform.outputs.resource_group_name
  location                          = var.location
  enable_http2                      = true
  zones                             = null
  force_firewall_policy_association = false

  sku {
    name     = var.agw_sku
    tier     = var.agw_sku
    capacity = var.agw_min_capacity
  }

  autoscale_configuration {
    min_capacity = var.agw_min_capacity
    max_capacity = var.agw_max_capacity
  }

  gateway_ip_configuration {
    name      = "gateway-ip"
    subnet_id = data.terraform_remote_state.platform.outputs.subnet_dmz_id
  }

  frontend_port {
    name = "http"
    port = 80
  }

  # HTTPS: add frontend_port 443 and frontend_ip_configuration; certificate from Key Vault or file.
  # frontend_port { name = "https"; port = 443 }

  frontend_ip_configuration {
    name                 = "frontend-ip"
    public_ip_address_id = azurerm_public_ip.agw.id
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

  request_routing_rule {
    name                       = "default-rule"
    rule_type                  = "Basic"
    http_listener_name         = "http"
    backend_address_pool_name  = "frontend-pool"
    backend_http_settings_name = "default-settings"
    priority                   = 100
  }
  # Add path-based rules for /api -> backend-pool, /keycloak -> keycloak-pool as needed.
}
