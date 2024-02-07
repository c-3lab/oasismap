# Keycloak レルム初期セットアップ

## 概要
Keycloak の Admin REST API に対して、PostmanのCLI版である newman で Keycloak のレルム等の設定を行います。

## 前提条件
1. Docker を利用できる環境であること。
1. Docker イメージ postman/newman を利用できる環境であること。

## 動作確認環境
- OS: Ubuntu 20.04.6
- Docker: version 25.0.3

## ディレクリ構成
```
.
└── newman
     ├── postman-collection.json  (Postman コレクション情報 version 2.1)
     ├── Readme.md (このファイル)
     └── variables.json  (環境変数情報)
```

## 事前準備
1. Docker サービスが稼働しており、 Keycloak へ接続できる環境にディレクトリ **newman** をコピーしてください。
1. 設定を行いたい Keycloak と設定を行う端末が同じであれば、その Keycloak コンテナが接続しているネットワーク名を控えてください。  
   ネットワーク名は Keycloak のコンテナを起動した docker-compose.yml を配置しているディレクトリ名 + _backend-network になることがあります。  
   例: oasismap_backend-network
1. 手順 1 でコピーしたディレクトリにある variables.json は環境変数を記述した設定ファイルです。  
   必要に応じて、以下の設定項目を編集してください。
   - KeycloakRootURL: Keycloak のルート URL (**末尾に / をつけないでください。**)
   - KeycloakTokenEndpoint: Keycloak の master レルムに対するトークンエンドポイント URL
   - RealmName: 追加したいレルム名
   - RealmLoginTheme: 追加したいレルムのログインテーマ名
   - RealmMunicipalUserGroupName: 追加したいレルムの自治体向けグループ名
   - RealmEventUserGroupName: 追加したいレルムのイベント参加者向けグループ名
   - RealmSSLRequired: 追加したいレルムの SSL 必須に関する設定 (設定可能な値: all, external, none のいずれか)
   - GoogleClientID: アイデンティティプロバイダー Google と接続する場合の Google Cloud Platform から発行されるクライアント ID
   - GoogleClientSecret: アイデンティティプロバイダー Google と接続する場合の Google Cloud Platform から発行されるクライアントシークレット
   - PostBrokerLoginFlowAlias: アイデンティティプロバイダー Google を通したログイン後に実行する認証フロー名

## 実行手順
1. ディレクトリ newman を配置した端末にて、以下のように docker コマンドを実行します。  

   ```
   KEYCLOAK_ADMIN={Keycloak の master レルムの管理者ユーザ名}
   KEYCLOAK_ADMIN_PASSWORD={Keycloak の master レルムの管理者ユーザのパスワード}

   docker run --network {Keycloak コンテナが存在するネットワーク名} --volume {ディレクトリ newman のパス}:/etc/newman/keycloak \
     postman/newman:latest run --bail --environment /etc/newman/keycloak/variables.json \
     --env-var "KeycloakAdminUser=$KEYCLOAK_ADMIN" \
     --env-var "KeycloakAdminPassword=$KEYCLOAK_ADMIN_PASSWORD" \
     /etc/newman/keycloak/postman-collection.json
   ```

   実行例:
   ```
   KEYCLOAK_ADMIN=admin
   KEYCLOAK_ADMIN_PASSWORD=********
   example@ubuntu:~$ docker run --network oasismap_backend-network --volume /home/example/oasismap/Backend/keycloak-initial-setup:/etc/newman/keycloak \
   > postman/newman:latest run --bail --environment /etc/newman/keycloak/variables.json \
     --env-var "KeycloakAdminUser=$KEYCLOAK_ADMIN" \
     --env-var "KeycloakAdminPassword=$KEYCLOAK_ADMIN_PASSWORD" \
   > /etc/newman/keycloak/postman-collection.json
   newman

   Keycloak

   → 追加対象のレルム削除
    POST http://keycloak:8080/realms/master/protocol/openid-connect/token [200 OK, 2.5kB, 101ms]

     null

    DELETE http://keycloak:8080/admin/realms/OASIS-Map [204 No Content, 187B, 958ms]
    ?  HTTP ステータスコードの確認 204 No Content or 404 Not Found

      ・
      ・
      ・
   （中略）
      ・
      ・
      ・

   → Google アイデンティティプロバイダーを追加
    POST http://keycloak:8080/realms/master/protocol/openid-connect/token [200 OK, 2.5kB, 50ms]

     null

    POST http://keycloak:8080/admin/realms/OASIS-Map/identity-provider/instances [201 Created, 322B, 28ms]
    ?  HTTP ステータスコードの確認 201 Created

    ┌─────────────────────────┬──────────────────────┬───────────────────┐
    │                         │             executed │            failed │
    ├─────────────────────────┼──────────────────────┼───────────────────┤
    │              iterations │                   1  │                0  │
    ├─────────────────────────┼──────────────────────┼───────────────────┤
    │                requests │                  28  │                0  │
    ├─────────────────────────┼──────────────────────┼───────────────────┤
    │            test-scripts │                  22  │                0  │
    ├─────────────────────────┼──────────────────────┼───────────────────┤
    │      prerequest-scripts │                  22  │                0  │
    ├─────────────────────────┼──────────────────────┼───────────────────┤
    │              assertions │                  12  │                0  │
    ├─────────────────────────┴──────────────────────┴───────────────────┤
    │ total run duration: 4.6s                                           │
    ├────────────────────────────────────────────────────────────────────┤
    │ total data received: 70.14kB (approx)                              │
    ├────────────────────────────────────────────────────────────────────┤
    │ average response time: 140ms [min: 15ms, max: 1659ms, s.d.: 338ms] │
    └────────────────────────────────────────────────────────────────────┘
    ```
