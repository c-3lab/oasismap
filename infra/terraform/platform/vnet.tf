# 仮想ネットワークとサブネット。
# 命名: prefix-VNET, prefix-SN-DMZ, prefix-SN-App, prefix-SN-DB, prefix-NSG-*。

resource "azurerm_network_security_group" "dmz" {
  name                = "${var.prefix}-NSG-DMZ"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_network_security_rule" "dmz_gateway_manager" {
  name                        = "AllowGateWayManagerAnyInbound"
  priority                    = 210
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "*"
  source_port_range           = "*"
  destination_port_range      = "65200-65535"
  source_address_prefix       = "GatewayManager"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.main.name
  network_security_group_name = azurerm_network_security_group.dmz.name
}

resource "azurerm_network_security_group" "app" {
  name                = "${var.prefix}-NSG-App"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_network_security_rule" "app_http_from_dmz" {
  name                        = "AllowPrivateHTTPInbound"
  priority                    = 200
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "80"
  source_address_prefix       = var.subnet_dmz_prefix
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.main.name
  network_security_group_name = azurerm_network_security_group.app.name
}

resource "azurerm_network_security_group" "agw" {
  name                = "${var.prefix}-NSG-AGW"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_network_security_rule" "agw_https" {
  name                        = "AllowInternetHTTPSInbound"
  priority                    = 200
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "443"
  source_address_prefix       = "Internet"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.main.name
  network_security_group_name = azurerm_network_security_group.agw.name
}

resource "azurerm_network_security_rule" "agw_gateway_manager" {
  name                        = "AllowGateWayManagerAnyInbound"
  priority                    = 210
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "*"
  source_port_range           = "*"
  destination_port_range      = "65200-65535"
  source_address_prefix       = "GatewayManager"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.main.name
  network_security_group_name = azurerm_network_security_group.agw.name
}

resource "azurerm_network_security_group" "db" {
  name                = "${var.prefix}-NSG-DB"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_network_security_rule" "db_postgres_from_app" {
  name                        = "AllowPrivatePostgresInbound"
  priority                    = 200
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "*"
  source_port_range           = "*"
  destination_port_range      = "5432"
  source_address_prefix       = var.subnet_app_prefix
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.main.name
  network_security_group_name = azurerm_network_security_group.db.name
}

resource "azurerm_virtual_network" "main" {
  name                = "${var.prefix}-VNET"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = [var.vnet_address_prefix]
}

resource "azurerm_subnet" "dmz" {
  name                                          = "${var.prefix}-SN-DMZ"
  resource_group_name                           = azurerm_resource_group.main.name
  virtual_network_name                          = azurerm_virtual_network.main.name
  address_prefixes                              = [var.subnet_dmz_prefix]
  private_endpoint_network_policies             = "Enabled"
  private_link_service_network_policies_enabled = true

  delegation {
    name = "dlg-MicrosoftWeb-serverFarms"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

resource "azurerm_subnet_network_security_group_association" "dmz" {
  subnet_id                 = azurerm_subnet.dmz.id
  network_security_group_id = azurerm_network_security_group.dmz.id
}

resource "azurerm_subnet" "app" {
  name                                          = "${var.prefix}-SN-App"
  resource_group_name                           = azurerm_resource_group.main.name
  virtual_network_name                          = azurerm_virtual_network.main.name
  address_prefixes                              = [var.subnet_app_prefix]
  private_endpoint_network_policies             = "Enabled"
  private_link_service_network_policies_enabled = true
  service_endpoints                             = ["Microsoft.AzureCosmosDB"]
  delegation {
    name = "dlg-Microsoft.ContainerInstance-containerGroups"
    service_delegation {
      name    = "Microsoft.ContainerInstance/containerGroups"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

resource "azurerm_subnet_network_security_group_association" "app" {
  subnet_id                 = azurerm_subnet.app.id
  network_security_group_id = azurerm_network_security_group.app.id
}

resource "azurerm_subnet" "db" {
  name                                          = "${var.prefix}-SN-DB"
  resource_group_name                           = azurerm_resource_group.main.name
  virtual_network_name                          = azurerm_virtual_network.main.name
  address_prefixes                              = [var.subnet_db_prefix]
  private_endpoint_network_policies             = "Enabled"
  private_link_service_network_policies_enabled = true
  service_endpoints                             = ["Microsoft.Storage"]
  delegation {
    name = "dlg-Microsoft.DBforPostgreSQL-flexibleServers"
    service_delegation {
      name    = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}

resource "azurerm_subnet_network_security_group_association" "db" {
  subnet_id                 = azurerm_subnet.db.id
  network_security_group_id = azurerm_network_security_group.db.id
}

# Application Gateway 専用サブネット（委任なし。AGW のみ）。
resource "azurerm_subnet" "agw" {
  name                                          = "${var.prefix}-SN-AGW"
  resource_group_name                           = azurerm_resource_group.main.name
  virtual_network_name                          = azurerm_virtual_network.main.name
  address_prefixes                              = [var.subnet_agw_prefix]
  private_endpoint_network_policies             = "Enabled"
  private_link_service_network_policies_enabled = true
}

resource "azurerm_subnet_network_security_group_association" "agw" {
  subnet_id                 = azurerm_subnet.agw.id
  network_security_group_id = azurerm_network_security_group.agw.id
}

# App Service の Private Endpoint 専用サブネット（委任なし）。
# Private Endpoint の IP は静的に割り当て、NSG で宛先を絞るために使う。
locals {
  pe_ip_frontend = cidrhost(var.subnet_pe_prefix, 4)
  pe_ip_backend  = cidrhost(var.subnet_pe_prefix, 5)
  pe_ip_keycloak = cidrhost(var.subnet_pe_prefix, 6)
}

resource "azurerm_network_security_group" "pe" {
  name                = "${var.prefix}-NSG-PE"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
}

# AGW から各 App Service の Private Endpoint への HTTPS。
resource "azurerm_network_security_rule" "pe_https_from_agw" {
  name                        = "AllowAgwHTTPSInbound"
  priority                    = 200
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "443"
  source_address_prefix       = var.subnet_agw_prefix
  destination_address_prefix  = var.subnet_pe_prefix
  resource_group_name         = azurerm_resource_group.main.name
  network_security_group_name = azurerm_network_security_group.pe.name
}

# Orion（ACI）から backend の Private Endpoint への HTTPS（履歴通知）。
resource "azurerm_network_security_rule" "pe_https_from_app_to_backend" {
  name                        = "AllowAppToBackendHTTPSInbound"
  priority                    = 210
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "443"
  source_address_prefix       = var.subnet_app_prefix
  destination_address_prefix  = "${local.pe_ip_backend}/32"
  resource_group_name         = azurerm_resource_group.main.name
  network_security_group_name = azurerm_network_security_group.pe.name
}

# 既定の AllowVnetInBound を打ち消すため、上記以外の受信をすべて拒否する。
resource "azurerm_network_security_rule" "pe_deny_all_inbound" {
  name                        = "DenyAllInbound"
  priority                    = 4096
  direction                   = "Inbound"
  access                      = "Deny"
  protocol                    = "*"
  source_port_range           = "*"
  destination_port_range      = "*"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.main.name
  network_security_group_name = azurerm_network_security_group.pe.name
}

resource "azurerm_subnet" "pe" {
  name                 = "${var.prefix}-SN-PE"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.subnet_pe_prefix]
  # NSG を Private Endpoint に適用するため有効化する。
  private_endpoint_network_policies = "Enabled"
}

resource "azurerm_subnet_network_security_group_association" "pe" {
  subnet_id                 = azurerm_subnet.pe.id
  network_security_group_id = azurerm_network_security_group.pe.id
}
