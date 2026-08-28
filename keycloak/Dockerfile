FROM quay.io/keycloak/keycloak:26.7.2

COPY ./themes /opt/keycloak/themes
COPY ./providers /opt/keycloak/providers

run /opt/keycloak/bin/kc.sh build --db=postgres \
  --health-enabled=true

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]
