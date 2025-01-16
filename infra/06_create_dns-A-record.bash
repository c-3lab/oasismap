#!/bin/bash

source .env
source 99_common.bash

az network dns zone create \
  --resource-group "${DNS_RESOURCE_GROUP_NAME}" \
  --name "${ROOT_DOMAIN_NAME}"

az network dns zone create \
  --resource-group "${DNS_RESOURCE_GROUP_NAME}" \
  --name "${ROOT_DOMAIN_NAME}" \
  --parent-name "${PARENT_DOMAIN_NAME}"

public_ip=$(az network public-ip show \
  --resource-group "${RESOURCE_GROUP_NAME}" \
  --name "${PREFIX}-AGWIP" \
  --query "ipAddress" \
  --output tsv)

az network dns record-set a delete \
  --resource-group "${DNS_RESOURCE_GROUP_NAME}" \
  --zone-name "${ROOT_DOMAIN_NAME}" \
  --name "@" \
  --yes
echo "deleted the root A recordset"

az network dns record-set a add-record \
  --resource-group "${DNS_RESOURCE_GROUP_NAME}" \
  --zone-name "${ROOT_DOMAIN_NAME}" \
  --record-set-name "@" \
  --ipv4-address "${public_ip}"
echo "add a A record for '${ROOT_DOMAIN_NAME}': public-ip=${public_ip}"
 
az network dns record-set a delete \
  --resource-group "${DNS_RESOURCE_GROUP_NAME}" \
  --zone-name "${ROOT_DOMAIN_NAME}" \
  --name "backend" \
  --yes
echo "deleted the root A recordset"

az network dns record-set a add-record \
  --resource-group "${DNS_RESOURCE_GROUP_NAME}" \
  --zone-name "${ROOT_DOMAIN_NAME}" \
  --record-set-name "backend" \
  --ipv4-address "${public_ip}"
echo "add a A record for 'backend.${ROOT_DOMAIN_NAME}': public-ip=${public_ip}"

az network dns record-set a delete \
  --resource-group "${DNS_RESOURCE_GROUP_NAME}" \
  --zone-name "${ROOT_DOMAIN_NAME}" \
  --name "keycloak" \
  --yes
echo "deleted the root A recordset"

az network dns record-set a add-record \
  --resource-group "${DNS_RESOURCE_GROUP_NAME}" \
  --zone-name "${ROOT_DOMAIN_NAME}" \
  --record-set-name "keycloak" \
  --ipv4-address "${public_ip}"
echo "add a A record for 'keycloak.${ROOT_DOMAIN_NAME}': public-ip=${public_ip}"
 

sedi s/^KC_HOSTNAME_URL=.*/KC_HOSTNAME_URL=\"https:\\/\\/keycloak.${ROOT_DOMAIN_NAME}\"/g _env-azure.gen
sedi s/^KC_HOSTNAME_ADMIN_URL=.*/KC_HOSTNAME_ADMIN_URL=\"https:\\/\\/keycloak.${ROOT_DOMAIN_NAME}\"/g _env-azure.gen
sedi s/^KEYCLOAK_CLIENT_ISSUER=.*/KEYCLOAK_CLIENT_ISSUER=\"https:\\/\\/keycloak.${ROOT_DOMAIN_NAME}\\/realms\\/oasismap\"/g _env-azure.gen
sedi s/^NEXTAUTH_URL=.*/NEXTAUTH_URL=\"https:\\/\\/${ROOT_DOMAIN_NAME}\"/g _env-azure.gen
sedi s/^BACKEND_URL=.*/BACKEND_URL=\"https:\\/\\/backend.${ROOT_DOMAIN_NAME}\"/g _env-azure.gen

