# 開発者向け手順

## 前提
[README.md](../README.md) に記載されている手順を実施すること。

以下がインストールされていること。
- docker
- node 20.10.0

## frontend 初期設定
以下コマンドを順に実行して環境に各種パッケージをインストールする。
```
cd ./frontend
npm install
```

## backend 初期設定
以下コマンドを順に実行して環境に各種パッケージをインストールする。
```
cd ../backend
npm install
```

## 開発用コンテナを起動
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

## KeycloakのProviderをカスタマイズ
カスタマイズしない場合は本手順はスキップしてください。

1. `keycloak-extension/src` 配下のソースコードを編集

2. ビルド用コンテナに入る
```
docker compose exec keycloak-extension bash
```

3. コンテナ内でビルド
```
mvn install
```

4. コンテナから抜ける
```
exit
```

5. ビルドしたjarファイルを `keycloak/providers` 配下に設置
```
cp keycloak-extension/target/authenticator-oasismap.jar keycloak/providers/authenticator-oasismap.jar
```

6. コンテナを再起動
```
docker compose -f docker-compose-dev.yml restart keycloak
```

## 動作確認

### フロントエンド
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

### バックエンド
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
