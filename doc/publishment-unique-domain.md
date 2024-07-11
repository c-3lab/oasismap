# 独自ドメインを使用したOASISmapの公開手順

## SSL証明書の発行
1. [nginx/oasismap-ssl.conf](../nginx/oasismap-ssl.conf)に記載されているexample.comを公開する独自ドメインに修正

2. nginxとcertbotを起動

```sh
docker compose -f docker-compose-ssl.yml up -d
```

3. SSL証明書を発行

```sh
docker compose -f docker-compose-ssl.yml run --rm certbot certonly --webroot -w /usr/share/nginx/html -d <独自ドメイン>
docker compose -f docker-compose-ssl.yml run --rm certbot certonly --webroot -w /usr/share/nginx/html -d backend.<独自ドメイン>
docker compose -f docker-compose-ssl.yml run --rm certbot certonly --webroot -w /usr/share/nginx/html -d keycloak.<独自ドメイン>
```

4. nginxとcertbotを終了

```sh
docker compose -f docker-compose-ssl.yml down
```

## OASIS Mapの起動手順

### インストール方法

1. [MongoDBとPostgreSQLのユーザー、パスワードおよび地図の初期パラメータ値(緯度、経度、ズーム値)、KeyCloakの設定を.envに設定](../README.md#インストール方法)

    ※以下の環境変数は独自ドメインに設定
      - `KC_HOSTNAME_URL=https://keycloak.<独自ドメイン>`
      - `KC_HOSTNAME_ADMIN_URL=https://keycloak.<独自ドメイン>`
      - `KEYCLOAK_CLIENT_ISSUER=https://keycloak.<独自ドメイン>/realms/oasismap`
      - `NEXTAUTH_URL=https://<独自ドメイン>`
      - `BACKEND_URL=https://backend.<独自ドメイン>`

    ※以下の環境変数は後ほど設定
      - `GENERAL_USER_KEYCLOAK_CLIENT_SECRET`
      - `ADMIN_KEYCLOAK_CLIENT_SECRET`

2. [nginx/oasismap-https.conf](../nginx/oasismap-https.conf)に記載されているexample.comを公開する独自ドメインに修正

3. Dockerコンテナを展開
```sh
docker compose -f docker-compose-https.yml up -d
```

### [Google Cloud 事前準備](../README.md#google-cloud-事前準備)

### KeyCloakの独自ドメイン設定
1. `keycloak/variables.json` の `ClientBaseURL` を `https://<独自ドメイン>` に修正

### [Keycloak 自動設定](../README.md#keycloak-自動設定)

### 環境変数の準備と追加

1. ブラウザから `https://keycloak.<独自ドメイン>`でアクセスします。
2. 「Administration Console」をクリック
3. 環境変数 `KEYCLOAK_ADMIN` `KEYCLOAK_ADMIN_PASSWORD` に指定した認証情報でログイン

#### [Google CloudにリダイレクトURIを設定](../README.md#google-cloudにリダイレクトuriを設定)

#### [利用者向けクライアントシークレットの設定](../README.md#利用者向けクライアントシークレットの設定)

#### [自治体管理者向けクライアントシークレットの設定](../README.md#自治体管理者向けクライアントシークレットの設定)

#### [コンテナを再起動して環境変数を反映させる](../README.md#コンテナを再起動して環境変数を反映させる)

### [orionにサブスクリプション設定を行う](../README.md#orionにサブスクリプション設定を行う)
