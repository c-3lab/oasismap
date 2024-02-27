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
```
MONGOUSERNAME=user
MONGOPASSWORD=pass
POSTGREUSER=user
POSTGREPASSWORD=pass
MAP_DEFAULT_LATITUDE=35.967169
MAP_DEFAULT_LONGITUDE=139.394617
MAP_DEFAULT_ZOOM=13
DATASET_LIST_BY=menu
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
```

### 接続確認

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