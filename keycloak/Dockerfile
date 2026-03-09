FROM quay.io/keycloak/keycloak:26.5.1

COPY ./themes /opt/keycloak/themes
COPY ./providers /opt/keycloak/providers

run /opt/keycloak/bin/kc.sh build --db=postgres \
  --health-enabled=true

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]
