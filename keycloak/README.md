# Keycloak レルム初期セットアップ

## 概要
Keycloak の Admin REST API に対して、PostmanのCLI版である newman で Keycloak のレルム等の設定を行います。

## 前提条件
1. Docker を利用できる環境であること。
1. Docker イメージ postman/newman を利用できる環境であること。
1. bash を利用できる環境であること。
1. jq を利用できる環境であること。
1. 都道府県名をキーとし、その値が対応する市町村名が記載された配列のJSONファイルが存在していること。(output.json)

## 動作確認環境
- OS: Ubuntu 20.04.6
- Docker: version 25.0.3
- bash: version 5.0.17(1)-release
- jq: version 1.6

## ディレクリ構成
```
.
└── keycloak
     ├── postman-collection.json  (Postman コレクション情報 version 2.1)
     ├── README.md (このファイル)
     ├── formatting-variables.sh (都道府県および市町村情報を環境変数に追加するスクリプト)
     └── variables.json  (環境変数情報)
```

## 事前準備
1. Docker サービスが稼働しており、 Keycloak へ接続できる環境にディレクトリ **keycloak** をコピーしてください。
1. 設定を行いたい Keycloak と設定を行う端末が同じであれば、その Keycloak コンテナが接続しているネットワーク名を控えてください。  
   ネットワーク名は Keycloak のコンテナを起動した docker-compose.yml を配置しているディレクトリ名 + _backend-network になることがあります。  
   例: oasismap_backend-network
1. 手順 1 でコピーしたディレクトリにある variables.json は環境変数を記述した設定ファイルです。  
   必要に応じて、以下の設定項目を編集してください。
   - KeycloakRootURL: Keycloak のルート URL (**末尾に / をつけないでください。**)
   - KeycloakTokenEndpoint: Keycloak の master レルムに対するトークンエンドポイント URL
   - RealmName: 追加したいレルム名
   - RealmDisplayName: ページタイトルの表示名 (&lt;title&gt;&lt;/title&gt;内の値に影響する)
   - RealmDisplayNameHtml: Keycloak 画面での表示名 (HTMLタグの使用可能)
   - RealmLoginTheme: 追加したいレルムのログインテーマ名
   - RealmMunicipalUserGroupName: 追加したいレルムの自治体向けグループ名
   - RealmEventUserGroupName: 追加したいレルムのイベント参加者向けグループ名
   - RealmSSLRequired: 追加したいレルムの SSL 必須に関する設定 (設定可能な値: all, external, none のいずれか)
   - RealmSSOSessionIdleTimeout: 追加したいレルムの SSO セッション・アイドル  (単位は秒で、SSO セッション最大の設定値を上限とする)
   - RealmSSOSessionMaxLifespan: 追加したいレルムの SSO セッション最大  (単位は秒)
   - GoogleClientID: アイデンティティプロバイダー Google と接続する場合の Google Cloud Platform から発行されるクライアント ID
   - GoogleClientSecret: アイデンティティプロバイダー Google と接続する場合の Google Cloud Platform から発行されるクライアントシークレット
   - PostBrokerLoginFlowAlias: アイデンティティプロバイダー Google を通したログイン後に実行する認証フロー名
   - ClientRootURL: Webアプリケーション (クライアント) のルートURL (例: http://localhost:3000 または https://event.example.com など)
1. 手順 1 でコピーしたディレクトリにて、以下のように formatting-variables.sh ファイルを実行します。  

   ```
   bash formatting-variables.sh {都道府県名と市町村名が記載されているjsonファイルのパス}
   ```

   実行例:
   ```
   example@ubuntu:~/oasismap/keycloak$ bash formatting-variables.sh /tmp/output.json
   variables.jsonを更新しました。
   ```

## 実行手順
1. ディレクトリ keycloak を配置した端末にて、以下のように docker コマンドを実行します。  

   ```
   KEYCLOAK_ADMIN={Keycloak の master レルムの管理者ユーザ名}
   KEYCLOAK_ADMIN_PASSWORD={Keycloak の master レルムの管理者ユーザのパスワード}

   docker run --network {Keycloak コンテナが存在するネットワーク名} --volume {ディレクトリ keycloak のパス}:/etc/newman/keycloak \
     postman/newman:latest run --bail --environment /etc/newman/keycloak/variables.json \
     --env-var "KeycloakAdminUser=$KEYCLOAK_ADMIN" \
     --env-var "KeycloakAdminPassword=$KEYCLOAK_ADMIN_PASSWORD" \
     /etc/newman/keycloak/postman-collection.json
   ```

   実行例:
   ```
   example@ubuntu:~/oasismap/keycloak$ KEYCLOAK_ADMIN=admin
   example@ubuntu:~/oasismap/keycloak$ KEYCLOAK_ADMIN_PASSWORD=********
   example@ubuntu:~/oasismap/keycloak$ docker run --network oasismap_backend-network --volume /home/example/oasismap/keycloak:/etc/newman/keycloak \
   > postman/newman:latest run --bail --environment /etc/newman/keycloak/variables.json \
   > --env-var "KeycloakAdminUser=$KEYCLOAK_ADMIN" \
   > --env-var "KeycloakAdminPassword=$KEYCLOAK_ADMIN_PASSWORD" \
   > /etc/newman/keycloak/postman-collection.json
   newman

   Keycloak

   → 追加対象のレルム削除
    POST http://keycloak:8080/realms/master/protocol/openid-connect/token [200 OK, 2.5kB, 101ms]
    DELETE http://keycloak:8080/admin/realms/oasismap [204 No Content, 187B, 958ms]
    ?  HTTP ステータスコードの確認 204 No Content or 404 Not Found

      ・
      ・
      ・
   （中略）
      ・
      ・
      ・

   → ユーザープロファイル機能の追加
    POST http://keycloak:8080/realms/master/protocol/openid-connect/token [200 OK, 2.44kB, 33ms]
    PUT http://keycloak:8080/admin/realms/oasismap/users/profile [200 OK, 1.91kB, 75ms]
    ?  HTTP ステータスコードの確認 200 OK

    ┌─────────────────────────┬──────────────────────┬───────────────────┐
    │                         │             executed │            failed │
    ├─────────────────────────┼──────────────────────┼───────────────────┤
    │              iterations │                   1  │                0  │
    ├─────────────────────────┼──────────────────────┼───────────────────┤
    │                requests │                  44  │                0  │
    ├─────────────────────────┼──────────────────────┼───────────────────┤
    │            test-scripts │                  34  │                0  │
    ├─────────────────────────┼──────────────────────┼───────────────────┤
    │      prerequest-scripts │                  33  │                0  │
    ├─────────────────────────┼──────────────────────┼───────────────────┤
    │              assertions │                  19  │                0  │
    ├─────────────────────────┴──────────────────────┴───────────────────┤
    │ total run duration: 6.6s                                           │
    ├────────────────────────────────────────────────────────────────────┤
    │ total data received: 105.9kB (approx)                              │
    ├────────────────────────────────────────────────────────────────────┤
    │ average response time: 97ms [min: 6ms, max: 1904ms, s.d.: 277ms]   │
    └────────────────────────────────────────────────────────────────────┘
    ```
