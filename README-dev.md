# oasismap
ウェルビーイングを実現するための、地域の協調的幸福度の可視化プラットフォーム

## oasismap開発者向け手順

### 前提
以下がインストールされていること。
- docker
- node 20.10.0

### git clone
```
git clone git@github.com:c-3lab/oasismap.git
cd oasismap
```

### SubmoduleのStarSeekerを初期化/更新する
```
git submodule update --init
```
※ OASISmapではSubmoduleとして [StarSeeker](https://github.com/c-3lab/StarSeeker) を利用している

#### 以下 未マージのStarSeekerコードを利用したい場合
必要であれば以下手順を実行してください。

##### PRを出している場合
以下を順に実行する。

```
cd frontend/externals/StarSeeker
git fetch
gh pr checkout <pr-number>
```

##### PRを出す前に動作確認をしたい場合

1. 初回の場合のみ、以下のコマンドを実行する(2回目以降の場合はスキップ)  
※ 上記コマンドの `xxxxx` は作成したブランチを push したリポジトリに合わせて変更
```
cd frontend/externals/StarSeeker
git remote add draft https://github.com/xxxxx/StarSeeker
```

2. 以下のコマンドを実行し、対象のブランチに checkout する
```
git fetch draft
git checkout <draft/ブランチ名>
```

### 環境変数の設定

1. 環境変数ファイルをコピーする  
※ 本手順の実施前にカレントディレクトリを変更している場合、リポジトリのルートディレクトリに移動すること
```
cp _env .env
```

2. .env の設定値を環境に合わせて編集する

以下一例

※`GENERAL_USER_KEYCLOAK_CLIENT_SECRET` , `ADMIN_KEYCLOAK_CLIENT_SECRET` は後ほど設定
```
MONGOUSERNAME=user
MONGOPASSWORD=pass
POSTGREUSER=user
POSTGREPASSWORD=pass

MAP_DEFAULT_LATITUDE=35.967169
MAP_DEFAULT_LONGITUDE=139.394617
MAP_DEFAULT_ZOOM=13
DATASET_LIST_BY=menu

KEYCLOAK_ADMIN=example
KEYCLOAK_ADMIN_PASSWORD=CHANGE_TO_RANDOM_STRING
KC_HOSTNAME_URL=https://xxxx-xxx-xxx-x-xx.ngrok-free.app
KC_HOSTNAME_ADMIN_URL=https://xxxx-xxx-xxx-x-xx.ngrok-free.app

GENERAL_USER_KEYCLOAK_CLIENT_ID=general-user-client
GENERAL_USER_KEYCLOAK_CLIENT_SECRET=
ADMIN_KEYCLOAK_CLIENT_ID=admin-client
ADMIN_KEYCLOAK_CLIENT_SECRET=
KEYCLOAK_CLIENT_ISSUER=https://xxxx-xxx-xxx-x-xx.ngrok-free.app/realms/oasismap

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sampleRandamString
```

### keycloak 初期設定
1. ngrokのアカウントを登録する  
https://ngrok.com/

2. 手順に従いngrokをインストールする  
https://ngrok.com/docs/getting-started/

3. ngrok起動
```
ngrok http 8080
```

```
Try the new Traffic Inspector dev preview: https://ngrok.com/r/ti                                   
                                                                                                    
Session Status                online                                                                
Account                       アカウント名 (Plan: Free)                                            
Version                       3.6.0                                                                 
Region                        Japan (jp)                                                            
Latency                       5ms                                                                   
Web Interface                 http://127.0.0.1:4040                                                 
Forwarding                    https://xxxx-xxx-xxx-x-xx.ngrok-free.app -> http://localhost:8080     
                                                                                                    
Connections                   ttl     opn     rt1     rt5     p50     p90                           
                              1224    0       0.00    0.01    0.06    6.29                          
                                                                                                    
HTTP Requests                                                                                       
```

4. `Forwarding` から https:// で始まるURLを取得する

5. 環境変数 `KC_HOSTNAME_URL` `KC_HOSTNAME_ADMIN_URL` に上記のURLを設定する
```
KC_HOSTNAME_URL=https://xxxx-xxx-xxx-x-xx.ngrok-free.app
KC_HOSTNAME_ADMIN_URL=https://xxxx-xxx-xxx-x-xx.ngrok-free.app
```

### frontend 初期設定
以下コマンドを順に実行して環境に各種パッケージをインストールする。
```
cd frontend/externals/StarSeeker/StarSeeker/frontend
npm install --legacy-peer-deps
cd ../../../../
npm install
```

### backend 初期設定
以下コマンドを順に実行して環境に各種パッケージをインストールする。
```
cd ../backend
npm install
```

### 開発用コンテナを起動
以下コマンドを順に実行する。

1. コンテナを起動する
```
cd ../
docker compose -f docker-compose-dev.yml up -d
```

2. コンテナが起動していることを確認する
```
docker compose -f docker-compose-dev.yml ps
```

```
NAME       ...(省略) STATUS          ...(省略) PORTS                                       
backend              Up 1 minutes             0.0.0.0:4000->4000/tcp, :::4000->4000/tcp
frontend             Up 1 minutes             0.0.0.0:3000->3000/tcp, :::3000->3000/tcp
keycloak             Up 1 minutes             0.0.0.0:8080->8080/tcp, :::8080->8080/tcp, 8443/tcp
mongo                Up 1 minutes             27017/tcp
orion                Up 1 minutes             0.0.0.0:1026->1026/tcp, :::1026
postgres             Up 1 minutes             5432/tcp
```

### Google Cloud 事前準備
1. [Google Cloud](https://console.cloud.google.com/apis/credentials)に接続

2. `プロジェクトを選択` から新しいプロジェクトを作成

3. `認証情報を作成` を選択して `OAuth クライアント ID` を作成

4. アプリケーションの種類に `ウェブアプリケーション` を選択して作成

5. クライアントID、シークレットを `keycloak/variables.json` の `GoogleClientID` `GoogleClientSecret` に転記


### Keycloak 自動設定
[レルム初期セットアップ](keycloak/README.md) 手順を実施

### カスタマイズしたProviderをbuildして配置
1. ビルド用コンテナに入る
```
docker compose exec keycloak-extension bash
```

2. コンテナ内でビルド
```
mvn install
```

3. コンテナから抜ける
```
exit
```

4. ビルドしたjarファイルを `keycloak/providers` 配下に設置
```
cp keycloak-extension/target/authenticator-oasismap.jar keycloak/providers/authenticator-oasismap.jar
```

5. コンテナを再起動
```
docker compose -f docker-compose-dev.yml restart keycloak
```

### 環境変数の準備と追加

#### Keycloak
1. 以下にブラウザから接続して「Welcome to Keycloak」ページを確認
```
http://localhost:8080
```

2. 「Administration Console」をクリック

3. 環境変数 `KEYCLOAK_ADMIN` `KEYCLOAK_ADMIN_PASSWORD` に指定した認証情報でログイン

4. Google CloudにリダイレクトURIを設定
    1. `realm` から `oasismap` を選択
    2. 左のメニューバーから `Identity providers` を選択
    3. `google` をクリック
    4. `Redirect URI` の値をコピーして控えておく
    5. [Google Cloud](https://console.cloud.google.com/apis/credentials)に接続
    6. 事前準備にて作成した認証情報を選択
    7. `承認済みのリダイレクトURI` に控えておいた `Redirect URI` を転記

5. 環境変数 `GENERAL_USER_KEYCLOAK_CLIENT_SECRET`の設定
    1. `realm` から `oasismap` を選択
    2. 左のメニューバーから `client` をクリック
    3. `general-user-client` をクリック
    4. `Credentials` をクリック
    5. `Client Secret` の値を `GENERAL_USER_KEYCLOAK_CLIENT_SECRET` に転記

6. 環境変数 `ADMIN_KEYCLOAK_CLIENT_SECRET`の設定
    1. `realm` に `oasismap` を選択
    2. 左のメニューバーから `client` をクリック
    3. `admin-client` をクリック
    4. `Credentials` をクリック
    5. `Client Secret` の値を `ADMIN_KEYCLOAK_CLIENT_SECRET` に転記

7. コンテナを再起動して環境変数を反映させる
```
docker compose -f docker-compose-dev.yml up -d frontend
```

### orionにサブスクリプション設定を行う

以下を実行
```
curl -iX POST \
  --url 'http://localhost:1026/v2/subscriptions' \
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

### 動作確認

#### フロントエンド
1. コンテナに入る
```
docker compose -f docker-compose-dev.yml exec frontend bash
```

2. サーバー起動
```
npm run dev
```

3. 以下にブラウザから接続して表示されればok
```
http://localhost:3000
```

#### バックエンド
1. コンテナに入る
```
docker compose -f docker-compose-dev.yml exec backend bash
```

2. サーバー起動
```
npm run start:dev
```

3. 以下の curl コマンドでGETリクエストを送信する
```
curl http://localhost:4000
```

4. 以下が返却されればok
```
Hello World!
```