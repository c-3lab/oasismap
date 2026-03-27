# Application Gateway 用 WAF ポリシー（README §8.1: ブロック時は Detection でログ確認など）。
# 既定ポリシー: frontend/backend（ゲートウェイレベル）。Keycloak 用ポリシー: keycloak リスナーのみ（WAF 無効）。

resource "azurerm_web_application_firewall_policy" "keycloak" {
  name                = "${var.prefix}-WAFPolicy-keycloak"
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  location            = var.location

  policy_settings {
    enabled                          = false
    mode                             = "Detection"
    request_body_check               = true
    max_request_body_size_in_kb      = 128
    file_upload_limit_in_mb          = 100
    request_body_inspect_limit_in_kb = 128
  }

  managed_rules {
    managed_rule_set {
      type    = "OWASP"
      version = "3.2"
    }
    managed_rule_set {
      type    = "Microsoft_BotManagerRuleSet"
      version = "1.0"
    }
  }
}

resource "azurerm_web_application_firewall_policy" "default" {
  name                = "${var.prefix}-WAFPolicy-default"
  resource_group_name = data.terraform_remote_state.platform.outputs.resource_group_name
  location            = var.location

  policy_settings {
    enabled                          = var.agw_waf_enabled == "Enabled"
    mode                             = var.agw_waf_mode
    request_body_check               = true
    max_request_body_size_in_kb      = 128
    file_upload_limit_in_mb          = 100
    request_body_inspect_limit_in_kb = 128
  }

  custom_rules {
    name      = "AuthGeneral"
    priority  = 10
    rule_type = "MatchRule"
    action    = "Allow"

    match_conditions {
      match_variables {
        variable_name = "RequestUri"
      }
      operator     = "BeginsWith"
      match_values = ["/api/auth/callback/general-user-keycloak-client"]
      transforms   = ["Lowercase"]
    }
    match_conditions {
      match_variables {
        variable_name = "QueryString"
      }
      operator     = "Contains"
      match_values = ["iss=https://keycloak.${var.root_domain_name}/realms/oasismap"]
      transforms   = ["UrlDecode", "Lowercase"]
    }
  }

  custom_rules {
    name      = "AuthAdmin"
    priority  = 11
    rule_type = "MatchRule"
    action    = "Allow"

    match_conditions {
      match_variables {
        variable_name = "RequestUri"
      }
      operator     = "BeginsWith"
      match_values = ["/api/auth/callback/admin-keycloak-client"]
      transforms   = ["Lowercase"]
    }
    match_conditions {
      match_variables {
        variable_name = "QueryString"
      }
      operator     = "Contains"
      match_values = ["iss=https://keycloak.${var.root_domain_name}/realms/oasismap"]
      transforms   = ["UrlDecode", "Lowercase"]
    }
  }

  managed_rules {
    managed_rule_set {
      type    = "OWASP"
      version = "3.2"
    }
    managed_rule_set {
      type    = "Microsoft_BotManagerRuleSet"
      version = "1.0"
    }
    # __Secure-next-auth.session-token 用の除外（NextAuth セッション Cookie と OWASP ルールの競合回避）。
    exclusion {
      match_variable          = "RequestCookieKeys"
      selector                = "__Secure-next-auth.session-token"
      selector_match_operator = "Contains"
      excluded_rule_set {
        type    = "OWASP"
        version = "3.2"
        rule_group {
          rule_group_name = "REQUEST-942-APPLICATION-ATTACK-SQLI"
          excluded_rules  = ["942440", "942450", "942100", "942110", "942120", "942130", "942140", "942150", "942160", "942170", "942180", "942190", "942200", "942210", "942220", "942230", "942240", "942250", "942251", "942260", "942270", "942280", "942290", "942300", "942310", "942320", "942330", "942340", "942350", "942360", "942361", "942370", "942380", "942390", "942400", "942410", "942420", "942421", "942430", "942431", "942432", "942460", "942470", "942480", "942490", "942500"]
        }
        rule_group {
          rule_group_name = "General"
          excluded_rules  = ["200002", "200003", "200004"]
        }
        rule_group {
          rule_group_name = "Known-CVEs"
          excluded_rules  = ["800100", "800110", "800111", "800112", "800113", "800114"]
        }
        rule_group {
          rule_group_name = "REQUEST-911-METHOD-ENFORCEMENT"
          excluded_rules  = ["911100"]
        }
        rule_group {
          rule_group_name = "REQUEST-913-SCANNER-DETECTION"
          excluded_rules  = ["913100", "913101", "913102", "913110", "913120"]
        }
        rule_group {
          rule_group_name = "REQUEST-920-PROTOCOL-ENFORCEMENT"
          excluded_rules  = ["920100", "920120", "920121", "920160", "920170", "920171", "920180", "920190", "920200", "920201", "920202", "920210", "920220", "920230", "920240", "920250", "920260", "920270", "920271", "920272", "920273", "920274", "920280", "920290", "920300", "920310", "920311", "920320", "920330", "920340", "920341", "920350", "920420", "920430", "920440", "920450", "920460", "920470", "920480"]
        }
        rule_group {
          rule_group_name = "REQUEST-921-PROTOCOL-ATTACK"
          excluded_rules  = ["921110", "921120", "921130", "921140", "921150", "921151", "921160", "921170", "921180"]
        }
        rule_group {
          rule_group_name = "REQUEST-930-APPLICATION-ATTACK-LFI"
          excluded_rules  = ["930100", "930110", "930120", "930130"]
        }
        rule_group {
          rule_group_name = "REQUEST-931-APPLICATION-ATTACK-RFI"
          excluded_rules  = ["931100", "931110", "931120", "931130"]
        }
        rule_group {
          rule_group_name = "REQUEST-932-APPLICATION-ATTACK-RCE"
          excluded_rules  = ["932100", "932105", "932106", "932110", "932115", "932120", "932130", "932140", "932150", "932160", "932170", "932171", "932180", "932190"]
        }
        rule_group {
          rule_group_name = "REQUEST-933-APPLICATION-ATTACK-PHP"
          excluded_rules  = ["933100", "933110", "933111", "933120", "933130", "933131", "933140", "933150", "933151", "933160", "933161", "933170", "933180", "933190", "933200", "933210"]
        }
        rule_group {
          rule_group_name = "REQUEST-941-APPLICATION-ATTACK-XSS"
          excluded_rules  = ["941100", "941101", "941110", "941120", "941130", "941140", "941150", "941160", "941170", "941180", "941190", "941200", "941210", "941220", "941230", "941240", "941250", "941260", "941270", "941280", "941290", "941300", "941310", "941320", "941330", "941340", "941350", "941360"]
        }
        rule_group {
          rule_group_name = "REQUEST-943-APPLICATION-ATTACK-SESSION-FIXATION"
          excluded_rules  = ["943100", "943110", "943120"]
        }
        rule_group {
          rule_group_name = "REQUEST-944-APPLICATION-ATTACK-JAVA"
          excluded_rules  = ["944100", "944110", "944120", "944130", "944200", "944210", "944240", "944250"]
        }
      }
    }
    exclusion {
      match_variable          = "RequestCookieNames"
      selector                = "__Secure-next-auth.session-token"
      selector_match_operator = "Contains"
      excluded_rule_set {
        type    = "OWASP"
        version = "3.2"
        rule_group {
          rule_group_name = "REQUEST-942-APPLICATION-ATTACK-SQLI"
          excluded_rules  = ["942440", "942100", "942110", "942120", "942130", "942140", "942150", "942160", "942170", "942180", "942190", "942200", "942210", "942220", "942230", "942240", "942250", "942251", "942260", "942270", "942280", "942290", "942300", "942310", "942320", "942330", "942340", "942350", "942360", "942361", "942370", "942380", "942390", "942400", "942410", "942420", "942421", "942430", "942431", "942432", "942450", "942460", "942470", "942480", "942490", "942500"]
        }
        rule_group {
          rule_group_name = "General"
          excluded_rules  = ["200002", "200003", "200004"]
        }
        rule_group {
          rule_group_name = "Known-CVEs"
          excluded_rules  = ["800100", "800110", "800111", "800112", "800113", "800114"]
        }
        rule_group {
          rule_group_name = "REQUEST-911-METHOD-ENFORCEMENT"
          excluded_rules  = ["911100"]
        }
        rule_group {
          rule_group_name = "REQUEST-913-SCANNER-DETECTION"
          excluded_rules  = ["913100", "913101", "913102", "913110", "913120"]
        }
        rule_group {
          rule_group_name = "REQUEST-920-PROTOCOL-ENFORCEMENT"
          excluded_rules  = ["920100", "920120", "920121", "920160", "920170", "920171", "920180", "920190", "920200", "920201", "920202", "920210", "920220", "920230", "920240", "920250", "920260", "920270", "920271", "920272", "920273", "920274", "920280", "920290", "920300", "920310", "920311", "920320", "920330", "920340", "920341", "920350", "920420", "920430", "920440", "920450", "920460", "920470", "920480"]
        }
        rule_group {
          rule_group_name = "REQUEST-921-PROTOCOL-ATTACK"
          excluded_rules  = ["921110", "921120", "921130", "921140", "921150", "921151", "921160", "921170", "921180"]
        }
        rule_group {
          rule_group_name = "REQUEST-930-APPLICATION-ATTACK-LFI"
          excluded_rules  = ["930100", "930110", "930120", "930130"]
        }
        rule_group {
          rule_group_name = "REQUEST-931-APPLICATION-ATTACK-RFI"
          excluded_rules  = ["931100", "931110", "931120", "931130"]
        }
        rule_group {
          rule_group_name = "REQUEST-932-APPLICATION-ATTACK-RCE"
          excluded_rules  = ["932100", "932105", "932106", "932110", "932115", "932120", "932130", "932140", "932150", "932160", "932170", "932171", "932180", "932190"]
        }
        rule_group {
          rule_group_name = "REQUEST-933-APPLICATION-ATTACK-PHP"
          excluded_rules  = ["933100", "933110", "933111", "933120", "933130", "933131", "933140", "933150", "933151", "933160", "933161", "933170", "933180", "933190", "933200", "933210"]
        }
        rule_group {
          rule_group_name = "REQUEST-941-APPLICATION-ATTACK-XSS"
          excluded_rules  = ["941100", "941101", "941110", "941120", "941130", "941140", "941150", "941160", "941170", "941180", "941190", "941200", "941210", "941220", "941230", "941240", "941250", "941260", "941270", "941280", "941290", "941300", "941310", "941320", "941330", "941340", "941350", "941360"]
        }
        rule_group {
          rule_group_name = "REQUEST-943-APPLICATION-ATTACK-SESSION-FIXATION"
          excluded_rules  = ["943100", "943110", "943120"]
        }
        rule_group {
          rule_group_name = "REQUEST-944-APPLICATION-ATTACK-JAVA"
          excluded_rules  = ["944100", "944110", "944120", "944130", "944200", "944210", "944240", "944250"]
        }
      }
    }
  }
}
