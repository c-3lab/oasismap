## SSL証明書の発行手順

```
docker compose -f docker-compose-ssl.yml run --rm certbot certonly --webroot -w /usr/share/nginx/html -d example.com
docker compose -f docker-compose-ssl.yml run --rm certbot certonly --webroot -w /usr/share/nginx/html -d backend.example.com
docker compose -f docker-compose-ssl.yml run --rm certbot certonly --webroot -w /usr/share/nginx/html -d keycloak.example.com
```
