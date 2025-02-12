# Microsoft Azure上での環境構築手順

## 構成図

![azure-diagram](/doc/img/azure-diagram.png)


## 環境構築手順

### 事前準備
1. （作業用PC）aptやHomebrew等のパッケージマネージャを用いて、作業用PCに下記のツールをインストールする

    |ツール|概要|動作確認済みバージョン（OS）|
    |:--|:--|:--|
    |az|Azure Commandline Interface(CLI)|2.62.0(macOS 13.6.9) or 2.65.0(Ubuntu 22.04.5 LTS)|
    |openssl|公開鍵暗号や署名等に関する機能をもつツール|3.3.1 4(macOS 13.6.9) or 3.3.2(Ubuntu 22.04.5 LTS)|
    |lego|Let's Encrypt/ACMEクライアントツール|4.17.4(macOS 13.6.9) or 4.19.2(Ubuntu 22.04.5 LTS)|
    |bash|bash(macOS or Ubuntu)|3.2.57(1)(macOS 13.6.9) or  5.1.16(1)(Ubuntu 22.04.5 LTS)|
    |sed|sed(BSD or GNU)|BSD sed(macOS 13.6.9) or GNU sed 4.8(Ubuntu 22.04.5 LTS)|

1. （作業用PC）oasismapリポジトリをcloneする

    ```sh
    workPC$ git clone https://github.com/c-3lab/oasismap.git
    ```

1. （作業用PC）作業ディレクトリに移動する

    ```sh
    workPC$ cd oasismap/infra
    ```

1. （作業用PC）インフラ構築に必要な設定を、作業用PCのinfraディレクトリの.envに設定する

    ```sh
    workPC$ cp _env .env
    workPC$ vi .env
    ```

    |環境変数名|概要|デフォルト値|
    |:--|:--|:--|
    |RESOURCE_GROUP_NAME|oasismapを構築するリソースグループ名||
    |PREFIX|Azure上に構築する各種リソース名のプレフィックス||
    |LOCATION|各種リソースを構築するAzureリージョン名|Japan East|
    |POSTGRES_USER|Azure Database for PostgreSQLのサーバー管理者アカウント名|postgres|
    |POSTGRES_PASSWORD|Azure Database for PostgreSQLのサーバー管理者パスワード||
    |POSTGRES_SKU|Azure Database for PostgreSQLのフレキシブルサーバのサイズ|Standard_D2ds_v4|
    |POSTGRES_STORAGE_GB|Azure Database for PostgreSQLのフレキシブルサーバのディスク容量（GB）|32|
    |VM_ADMIN|Azure VMの管理者アカウント名|azureuser|
    |VM_ADMIN_PUBLIC_KEY_PATH|Azure VMの管理者アカウントでSSH接続するための公開鍵の絶対パス||
    |VM_SKU|Azure VMのサイズ|Standard_D4s_v3|
    |VM_OSDISK_SKU|Azure VMのディスクのSKU|Standard_LRS|
    |PARENT_DOMAIN_NAME|親DNSゾーン名||
    |ROOT_DOMAIN_NAME|oasismapを起動するルートドメイン名||
    |LEGO_EMAIL|Let's EncryptでSSL証明書を取得するために必要なEmailアドレス||
    |PFX_PASSWORD|Let's Encryptから発行されたサーバ証明書と秘密鍵をPKCS#12(pfx)へ変換するためのパスワード||
    |DNS_RESOURCE_GROUP_NAME|ルートドメインのAzure DNSのリソースグループ名||
    |AGW_SKU|Azure Application GatewayのSKU|WAF_v2|
    |AGW_MIN_CAPACITY|Azure Application Gatewayの容量ユニット(最小）|1|
    |AGW_MAX_CAPACITY|Azure Application Gatewayの容量ユニット(最大）|2|
    |WAF_MODE|Azure WAFのモード|Prevention|
    |ALERT_MAIL_DEST_ADDRESS|アラートメールの送信先Emailアドレス||

    * 上記以外に設定可能なパラメータは、`templates`以下のARMテンプレートを確認
    * WAFがリクエストをブロックしてアプリケーションが動作しない場合、`WAF_MODE`を**Detection**で構築し、Azure　Application　Gatewayの`AGWFirewallLogs`ログを確認してWAFがブロックする理由を確認すること

### Azureリソースの構築（業務系）
1. （作業用PC）Azure上にoasismap用のリソースグループを作成する

    ```sh
    workPC$ ./00_create_resource_group.bash
    ```

1. （作業用PC）Azure Virtual Networkを構築する

    ```sh
    workPC$ ./01_create_vnet.bash
    ```

1. （作業用PC）Azure Cosmos DB for mongoDBを構築する

    ```sh
    workPC$ ./02_create_cosmosdb-mongodb.bash
    ```

1. （作業用PC）Azure Database for PostgreSQL(フレキシブル サーバー)を構築する

    ```sh
    workPC$ ./03_create_postgresql.bash
    ```

1. （作業用PC）Azure Virtual　Machineを構築する

    ```sh
    workPC$ ./04_create_vm.bash
    ```

    * 構築完了後にVMの管理者アカウント名とPublicIPが表示されるので、メモしておくこと

1. （作業用PC）Let's EncryptからSSL証明書を取得し、Azure Application Gatewayを構築する

    ```sh
    workPC$ ./05_create_application-gateway.bash
    ```

1. （作業用PC）Azure　DNSにoasismap用のAレコードを追加する

    ```sh
    workPC$ ./06_create_dns-A-record.bash
    ```

### Azure VMに設定ファイルを転送
1. （作業用PC）自動生成されたOASIS　Mapアプリケーション用設定ファイルを編集する

    ```sh
    workPC$ mv _env-azure.gen _env-azure
    workPC$ vi _env-azure
    ```
    
    |編集すべき環境変数名|概要|
    |:--|:--|
    |KEYCLOAK_ADMIN|keycloakの管理者アカウント名|
    |KEYCLOAK_ADMIN_PASSWORD|keycloakの管理者アカウントのパスワード|
    |NEXTAUTH_SECRET|NextAuth.js用のシークレット|
  
1. （作業用PC）編集したOASIS　Mapアプリケーション用設定ファイルをAzure VMにscpで転送する

    ```sh
    workPC$ scp -i <Azure VMの管理者アカウントでSSH接続するための秘密鍵のパス> ./_env-azure <Azure VMの管理者アカウント名>@<表示されたAzure　VMのPublicIP>:~
    ```
    
### Azure VM上でoasismapアプリケーションを準備
1. （作業用PC）Azure VMにsshで接続する

    ```sh
    workPC$ ssh -i <Azure VMの管理者アカウントでSSH接続するための秘密鍵のパス> <Azure VMの管理者アカウント名>@<表示されたAzure　VMのPublicIP>
    ```

1. （Azure VM）oasismapリポジトリをcloneする

    ```sh
    VM$ git clone https://github.com/c-3lab/oasismap.git
    ```

1. （Azure VM）oasismapのディレクトリに移動する

    ```sh
    VM$ cd oasismap
    ```
    
    * 必要に応じてブランチを変更する

1. （Azure VM）oasismapの設定ファイルをコピーする

    ```sh
    VM$ cp ~/_env-azure ./.env
    ```
    
1. （Azure VM）oasismapを起動するsystemdユニットファイルを配置する

    ```sh
    VM$ sudo cp infra/systemd/oasismap.service /etc/systemd/system/
    ```

    * Azure　VMの管理者アカウント名やoasismapをcloneしたディレクトリを変更した場合、`oasismap.service`の**COMPOSE_FILE**の絶対パスを適切に変更する

1. （Azure VM）systemdにoasismap serviceを認識させる

    ```sh
    VM$ sudo systemctl daemon-reload
    ```

1. （Azure VM）oasismapの自動起動を許可する

    ```sh
    VM$ sudo systemctl enable oasismap
    ```

### 参加同意書の自治体名を更新

1. （Azure VM）参加同意書を更新する（ `<対象自治体名>` と `<実証実験の日付>` は適切な値に変更すること）

    ```sh
    VM$ sed -i 's/ （雛形）//g' frontend/src/app/terms/use/page.tsx
    VM$ sed -i 's/【自治体名】/<対象自治体名>/g' frontend/src/app/terms/use/page.tsx
    VM$ sed -i 's/yyyy年mm月dd日/<実証実験の日付>/g' frontend/src/app/terms/use/page.tsx
    ```

1. （Azure VM）参加同意書を更新を確認する

    ```sh
    VM$ git diff frontend/src/app/terms/use/page.tsx
    ```

### Azure VM上でoasismapアプリケーションを起動
1. （Azure VM）oasismap serviceを開始する

    ```sh
    VM$ sudo systemctl start oasismap
    ```

1. （Azure VM）oasismap serviceの起動ログを確認する

    ```sh
    VM$ sudo journalctl -f -u oasismap
    ```

    * 初回はコンテナビルドが実行されるため、起動に時間がかかることに注意する

1. （Azure VM）oasismapアプリケーションが起動したことを確認する

    ```sh
    VM$ sudo docker compose ps
    ```

    * `backend`, `frontend`, `keycloak`, `orion`, `cygnus`のコンテナが起動し**healthy**であること

    ```sh
    VM$ sudo docker compose logs
    ```
    
    * errorやexceptionが記録されていないこと

### Google Cloud 事前準備

1. [Google Cloud](https://console.cloud.google.com/apis/credentials)に接続
2. `プロジェクトを選択` から新しいプロジェクトを作成
3. `認証情報を作成` を選択して `OAuth クライアント ID` を作成
4. アプリケーションの種類に `ウェブアプリケーション` を選択して作成

### Azure VM上のkeycloakを自動設定
1. （Azure VM）Google Cloud認証システムの設定をAzure VM上のkeycloak自動設定ファイルへ転記する

    ```sh
    VM$ vi keycloak/variables.json
    ```

    * `GoogleClientID` `GoogleClientSecret` へGoogle Cloud認証システムから得たクライアントID、シークレットを転記
    * `ClientBaseURL` を `https://<設定したルートドメイン>` に変更

1. （Azure VM）keycloakディレクトリに移動する

    ```sh
    VM$ cd keycloak
    ```

1. （Azure VM）`formatting-variables.sh` を実行して都道府県名/市区町村名の情報を `variables.json` に設定する

    ```sh
    VM$ bash formatting-variables.sh cities.json
    ```

1. （Azure VM）設定ファイルを読み込み、自動設定スクリプトで利用する環境変数を確認する

    ```sh
    VM$ source ../.env
    VM$ echo $KEYCLOAK_ADMIN
    VM$ echo $KEYCLOAK_ADMIN_PASSWORD
    ```

1. （Azure VM）以下のコマンドを実行

    ```sh
    VM$ sudo docker run --network oasismap_backend-network --volume $(pwd):/etc/newman/keycloak \
    postman/newman:latest run --bail --environment /etc/newman/keycloak/variables.json \
    --env-var "KeycloakAdminUser=$KEYCLOAK_ADMIN" \
    --env-var "KeycloakAdminPassword=$KEYCLOAK_ADMIN_PASSWORD" \
    /etc/newman/keycloak/postman-collection.json
    ```

1. （Azure VM）oasismapのディレクトリに戻る

    ```sh
    VM$ cd ..
    ```

### Azure VM上のkeycloakをGUIから設定
#### keycloakにログイン

1. ブラウザから `https://keycloak.<設定したルートドメイン>`でAzure VM上のkeycloakに接続する
2. 「Administration Console」をクリックする
3. 環境変数 `KEYCLOAK_ADMIN` `KEYCLOAK_ADMIN_PASSWORD` に指定した認証情報でログインする

#### Google CloudにリダイレクトURIを設定

1. keycloakの`realm` から `oasismap` を選択する
2. 左のメニューバーから `Identity providers` を選択する
3. `google` をクリックする
4. `Redirect URI` の値をコピーして控えておく
5. [Google Cloud](https://console.cloud.google.com/apis/credentials)に接続する
6. 事前準備にて作成した認証情報を選択する
7. `承認済みのリダイレクトURI` に控えておいた `Redirect URI` を転記し、`保存`をクリックする

#### 利用者向けクライアントシークレットの設定

1. keycloakの`realm` から `oasismap` を選択する
2. 左のメニューバーから `Clients` をクリック
3. `general-user-client` をクリック
4. `Credentials` をクリックする
5. `Client Secret` の値をAzure VM上のoasismapの環境変数 `GENERAL_USER_KEYCLOAK_CLIENT_SECRET` に転記する

#### 自治体管理者向けクライアントシークレットの設定

1. keycloakの`realm` に `oasismap` を選択する
2. 左のメニューバーから `Clients` をクリックする
3. `admin-client` をクリックする
4. `Credentials` をクリックする
5. `Client Secret` の値を環境変数 `ADMIN_KEYCLOAK_CLIENT_SECRET` に転記する

### oasismap serviceを再起動して環境変数を反映
1. （Azure VM）oasismap serviceを再起動する

    ```sh
    VM$ sudo systemctl restart oasismap
    ```

1. （Azure VM）oasismap serviceの起動ログを確認する

    ```sh
    VM$ sudo journalctl -f -u oasismap
    ```

1. （Azure VM）oasismapアプリケーションが起動したことを確認する

    ```sh
    VM$ sudo docker compose ps
    ```

    * `backend`, `frontend`, `keycloak`, `orion`, `cygnus`のコンテナが起動し**healthy**であること

    ```sh
    VM$ sudo docker compose logs
    ```
    
    * errorやexceptionが記録されていないこと

### orionにサブスクリプションを設定
1. （Azure VM）バックエンドのコンテナに入る

    ```sh
    VM$ sudo docker exec -it backend /bin/bash
    ```

2. (backendコンテナ)コンテナ上で以下コマンドを実行してorionにサブスクリプションの設定を行う

    ```sh
    node@backend:/app/backend$ curl -iX POST \
      --url 'http://orion:1026/v2/subscriptions' \
      --header 'content-type: application/json' \
      --header 'Fiware-Service: Government' \
      --header 'Fiware-ServicePath: /Happiness' \
      --data '{
      "description": "Notice of entities change",
      "subject": {
        "entities": [
          {
            "idPattern": ".*",
            "type": "happiness"
          }
        ],
        "condition": {
          "attrs": []
        }
      },
      "notification": {
        "http": {
          "url": "http://cygnus:5055/notify"
        }
      }
    }'
    ```

3. (backendコンテナ)`201 Created`が返されたことを確認する

4. (backendコンテナ)コンテナとの接続を解除する

    ```sh
    node@backend:/app/backend$ exit
    ```

### 自治体管理者アカウントの準備

1. ブラウザから `https://keycloak.<設定したルートドメイン>`でAzure VM上のkeycloakに接続する
2. 「Administration Console」をクリック
3. 環境変数 `KEYCLOAK_ADMIN` `KEYCLOAK_ADMIN_PASSWORD` に指定した認証情報でログイン
4. `realm` から `oasismap` を選択
5. 左のメニューバーから `Users` を選択
6. `Add User` を選択
7. `Username`,`profile.attribute.nickname` を入力して `Create` を選択
    ※ `Username` と `profile.attribute.nickname` は同じ値を入れてください
8. `Credentials` を選択して `Set password` からパスワードを入力してください
9. パスワード入力後, `Temporary` のチェックを外して `Save`
10. `Save password` から保存

### 動作確認
1. スマートフォンから **https://<設定したルートドメイン>** にアクセスし、oasismapが動作していることを確認する
    * 参加同意書が正しく修正されていることも併せて確認する
2. スマートフォンから **https://<設定したルートドメイン>/admin/login** にアクセスし、oasismapの管理者画面が動作していることを確認する
    * 一般利用者と同様に住所や年代等の入力画面が表示された場合は、ダミーのデータを入力する

### Azureリソースの構築（監視系）
1. （作業用PC）Azure Monitorワークスペース(Log Analytics　ワークスペース)を作成し、CosmosDB、PostgreSQL、Application　Gateway、VMから収集するメトリクスとログを設定する

    ```sh
    workPC$ ./07_create_log-analytics.bash
    ```

    * 必要に応じて収集するメトリクスやログを追加・変更する

1. 15分程度待機し、メトリクスとログがAzure　Monitorへ収集されていることをAzure Portalから確認する
    * Azureポータル > 作成したリソースグループ > Log Analytics ワークスペース(<設定したプレフィックス>-LOG) > 設定 > エージェント> Linuxサーバー
        * **1 台の Linux コンピューターが接続されています** と表示されている
    * Azureポータル > 作成したリソースグループ > Azure Cosmos DB API for MongoDB アカウント(<設定したプレフィックス>-mongo-<ランダム文字列>) > 監視
        * ログ(クエリハブが表示されている場合はXをクリックして閉じる)
            * **テーブルの選択 > AzureDiagnotics** を実行すると、MongoDB APIのログが表示されている
        * メトリック
            * メトリックとして **Mongo Requests** を選択すると、CosmosDB for MongoDBへのリクエスト数の推移が表示されている
    * Azureポータル > 作成したリソースグループ > Azure Database for PostgreSQL のフレキシブル サーバー（<設定したプレフィックス>-postgres-<ランダム文字列>) > 監視 
        * ログ(クエリハブが表示されている場合はXをクリックして閉じる)
            * **テーブルの選択 > AzureDiagnotics** を実行すると、PostgreSQLのログが表示されている
        * メトリック
            * メトリックとして **CPU percent** を選択すると、PostgreSQLサーバのCPU使用率の推移が表示されている
    * Azureポータル > 作成したリソースグループ > アプリケーション ゲートウェイ（<設定したプレフィックス>-AGW) > 監視
        * ログ(クエリハブが表示されている場合はXをクリックして閉じる)
            * **テーブルの選択 > AGWAccessLogs** を実行すると、AGWのアクセスログが表示されている
        * メトリック
            * メトリックとして **Total Requests** を選択すると、リクエスト数の推移が表示されている
    * Azureポータル > 作成したリソースグループ > 仮想マシン（<設定したプレフィックス>-VM) > 監視
        * ログ(クエリハブが表示されている場合はXをクリックして閉じる)
            * **テーブルの選択 > Syslog** を実行すると、VMのOSから転送されたsyslogが表示されている
            * KQLモードに変更し、クエリエディタに`Syslog | where Facility  == "local0" and ProcessName == "cygnus"`と入力し実行すると、cygnusのログが表示されている
        * メトリック
            * メトリック名前空間として **azure.vm.linux.guestmetrics** を選択し、メトリックとして **cpu/usage_active** を選択すると、VMのCPU使用率の推移が表示されている

          
1. （作業用PC）Azure Monitorのアラートルールを作成する

    ```sh
    workPC$ ./08_create_alerts.bash
    ```

    * 設定されたアラートルールは、Azureポータルから確認できる
        * Azureポータル > Azure Monitor > アラート > アラートルール
    * 必要に応じてアラートが発火する条件を変更する
