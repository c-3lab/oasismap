# OASIS Map - ウェルビーイングを実現するための、地域の協調的幸福度の可視化プラットフォーム

<p align="center">
    <img src="doc/img/readme-top.png">
</p>

## 目次

- [OASIS Map - ウェルビーイングを実現するための、地域の協調的幸福度の可視化プラットフォーム](#oasis-map---ウェルビーイングを実現するための地域の協調的幸福度の可視化プラットフォーム)
  - [目次](#目次)
  - [本プロジェクトについて](#本プロジェクトについて)
  - [OASIS Mapの始め方 クイックスタート](#oasis-mapの始め方-クイックスタート)
    - [概要](#概要)
    - [インストール方法](#インストール方法)
    - [事前準備](#事前準備)
    - [環境変数の定義](#環境変数の定義)
    - [システム起動](#システム起動)
    - [起動後設定](#起動後設定)

  - [基本的な使い方](#基本的な使い方)
    - [自治体管理者向け](#自治体管理者向け)
    - [利用者向け](#利用者向け)
    - [アプリケーション停止方法](#アプリケーション停止方法)
  - [利用バージョン](#利用バージョン)
  - [ライセンス](#ライセンス)

## 本プロジェクトについて

基盤ソフトウェア「[FIWARE (ファイウェア)](https://www.fiware.org/)」を用いて、地域の協調的幸福度を可視化するプラットフォーム

## OASIS Mapの始め方 クイックスタート

### 概要

- `docker compose`で提供しております
- `docker compose 2.21.0`, `docker 24.0.7` をインストール済みの `Ubuntu 22.04.3` 上で動作確認しております
- またインストールの中で `wget` を使用しております
- 対応ブラウザ
  - Chrome
  - Safari

### インストール方法

1. git clone

    ```sh
    git clone git@github.com:c-3lab/oasismap.git
    ```

2. 作業ディレクトリに移動

    ```sh
    cd oasismap
    ```

### 事前準備

#### ホストOSのIPアドレスの確認

docker上のコンテナから到達可能なホストOSのIPアドレスを確認（ `localhost` や `127.0.0.1` では動作しないことに注意）

* linux (ネットワークアダプタがeth0の場合)

  ```sh
  ~/oasismap$ ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
  ```
* macOS（ネットワークアダプタがen0の場合）

  ```sh
  ~/oasismap$ ipconfig getifaddr en0
  ```

#### 位置情報の利用について

OASIS Mapでは現在の位置情報を利用します。
但し `http` で動作させた場合は実際の位置情報ではなく、仮の位置情報が使われます。
実際の位置情報を利用する場合は、Keycloakの他にOASIS Map本体も `https` で動作させる必要があります。
手順は [現在位置情報を利用した動作確認手順](doc/location-usage-verification.md) を確認してください。

仮の位置情報で問題ない場合は本手順はスキップしてください。

### 環境変数の定義

1. `_env` をコピーして `.env` を準備します。

    ```sh
    ~/oasismap$ cp _env .env
    ~/oasismap$ vi .env
    ```

2. 必要に応じてMongoDBとPostgreSQLのユーザー・パスワードを設定します。

    ```sh
    MONGOUSERNAME=example
    MONGOPASSWORD=CHANGE_TO_RANDOM_STRING
    POSTGREUSER=example
    POSTGREPASSWORD=CHANGE_TO_RANDOM_STRING
    ```

3. 必要に応じて地図の初期パラメータ値(緯度、経度、ズーム値)を設定します。

4. Keycloakのパラメータを設定します。
    * keycloakの管理者ユーザー名（`KEYCLOAK_ADMIN`）とパスワード（`KEYCLOAK_ADMIN_PASSWORD`）
    * 次のコマンドを実行して `general-user-client` のsecretを生成し、 `GENERAL_USER_KEYCLOAK_CLIENT_SECRET` に設定します。

        ```sh
        ~/oasismap$ cat /dev/urandom | tr -dc 'A-Za-z0-9' | fold -w 32 | head -n 1
        ```
    * 次のコマンドを再度実行して `admin-client` のsecretを生成し、 `ADMIN_KEYCLOAK_CLIENT_SECRET` に設定します。

        ```sh
        ~/oasismap$ cat /dev/urandom | tr -dc 'A-Za-z0-9' | fold -w 32 | head -n 1
        ```
5. keycloakの名前解決を設定します。

    `HOST_URL=http://YOUR_IP_ADDRESS:8080` の `YOUR_IP_ADDRESS` を、事前準備で確認したdocker上のコンテナから到達可能なホストOSのIPアドレスに置換します。

### システム起動
- Dockerコンテナを展開します

  ```sh
  ~/oasismap$ docker compose up -d
  ```

### 起動後設定

#### orionにサブスクリプション設定を行う

1. backendのコンテナにはいる

    ```sh
    docker compose exec backend bash
    ```

2. 以下コマンドを実行してorionにサブスクリプションの設定を行う

    ```sh
    root@backend:/app/backend$ wget --post-data='{
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
    }' \
      --header='content-type: application/json' \
      --header='Fiware-Service: Government' \
      --header='Fiware-ServicePath: /Happiness' \
      --server-response \
      --output-document=- \
      'http://orion:1026/v2/subscriptions'
    ```

## 基本的な使い方

### 自治体管理者向け

#### 自治体管理者アカウントの準備

1. ブラウザから `http://Dockerホスト名:8080` でkeycloakの管理画面にアクセスします
2. 環境変数 `KEYCLOAK_ADMIN` `KEYCLOAK_ADMIN_PASSWORD` に指定した認証情報でログイン
3. `Manage realms` から `oasismap` を選択
4. 左のメニューバーから `Users` を選択
5. `Create new User` を押下
6. `Username`,`profile.attribute.nickname` に管理者アカウント名を入力して `Create` を選択
    ※ `Username` と `profile.attribute.nickname` は同じ値を入れてください
7. `Credentials` を選択して `Set password` を押下
8. `Password` と `Password confirmation` に同じパスワードを入力し、 `Temporary` をOFFにして `Save` を押下
9. `Save password` を押下して管理者アカウントのパスワードを保存
10. `Role mapping` を選択して `Assign role` を押下
11. `Realm roles` を選択
12. `admin-role` にチェックを入れ、 `Assign` を押下

#### 自治体管理者機能の使い方

1. ブラウザから `http://Dockerホスト名:3000/admin/login` でアクセスします
  <p align="center">
    <img src="doc/img/admin-user-1.png">
  </p>

2. 自治体管理者用アカウントでログインします
  <p align="center">
    <img src="doc/img/admin-user-2.png">
  </p>

3. 左端のハンバーガーメニューの `データのエクスポート` から幸福度情報をダウンロードできます
  <p align="center">
    <img src="doc/img/admin-user-3.png">
  </p>
  <p align="center">
    <img src="doc/img/admin-user-4.png">
  </p>

4. 左端のハンバーガーメニューの `データのインポート` から幸福度情報をインポートできます
  <p align="center">
    <img src="doc/img/admin-user-5.png">
  </p>
  <p align="center">
    <img src="doc/img/admin-user-6.png">
  </p>

### 利用者向け

#### ログイン

1. ブラウザから `http://Dockerホスト名:3000` でアクセスします
  <p align="center">
    <img src="doc/img/general-user-1.png" width="400">
  </p>

2. アカウント情報を用いてログイン
  <p align="center">
    <img src="doc/img/general-user-2.png" width="400">
  </p>

3. ユーザー情報の入力
  ※重複するニックネームは登録できません
  <p align="center">
    <img src="doc/img/general-user-3.png" width="400">
  </p>

#### 幸福度の入力

1. 画面右下の `幸福度の入力ボタン（鉛筆のアイコン）` をクリックします
  <p align="center">
    <img src="doc/img/general-user-4-1.png" width="400">
  </p>

2. 任意の項目にチェックを入れて `幸福度を送信` をクリックします
  <p align="center">
    <img src="doc/img/general-user-4-2.png" width="400">
  </p>

#### 利用者幸福度の表示

1. 左端のハンバーガーメニューをクリックし、一覧から`利用者の幸福度` をクリックします
  <p align="center">
    <img src="doc/img/general-user-4-3.png" width="400">
  </p>

2. `利用者の幸福度` が地図上に表示されます
  <p align="center">
    <img src="doc/img/general-user-4-4.png" width="400">
  </p>

#### 全体幸福度の表示

1. 左端のハンバーガーメニューをクリックし、一覧から`全体の幸福度`をクリックします
  <p align="center">
    <img src="doc/img/general-user-4-3.png" width="400">
  </p>

2. `全体の幸福度` が地図上に表示されます
  <p align="center">
    <img src="doc/img/general-user-5.png" width="400">
  </p>

#### 一覧の表示
1. 左端のハンバーガーメニューをクリックし、一覧から`一覧表示`をクリックします
   <p align="center">
    <img src="doc/img/general-user-6-1.png" width="400">
  </p>

2. 入力された幸福度の一覧が表示されます
   <p align="center">
    <img src="doc/img/general-user-6-2.png" width="400">
  </p>

### アプリケーション停止方法

- コンテナを停止

  ```sh
  ~/oasismap$ docker compose down
  ```

## 利用バージョン

- [next 15.5.10](https://nextjs.org/)
- [nest 10.4.15](https://nestjs.com/)
- [react 19系](https://ja.reactjs.org/)
- [typescript 5系](https://www.typescriptlang.org/)
- [eslint 9系](https://eslint.org/)
- [prettier 3系](https://prettier.io/)
- [jest 29.5.0](https://jestjs.io/ja/)
- [Postgresql 17.2](https://www.postgresql.org/)
- [FIWARE Cygnus 3.15.0](https://fiware-cygnus.readthedocs.io/en/master/index.html)
- [FIWARE Orion 4.1.0](https://fiware-orion.readthedocs.io/en/master/index.html)
- [keycloak 26.1.4](https://www.keycloak.org/)
- [mongoDB 8.0.4](https://www.mongodb.com/)
- [node 22.13.1](https://nodejs.org/ja/about/releases/)

## ライセンス

- [AGPL-3.0](LICENSE)
