# ローカルインストール手順

### StarSeekerプロジェクトを読み込み
submoduleの設定がされているので以下を実行して最新のStarSeekerを読み込み
```
git submodule update --init
```

### コンテナの起動
```
docker compose up -d
```

実際に立ち上がっているか確認してみる。
```
docker ps -a
```

以下の様に起動確認できたらOK
```
CONTAINER ID   IMAGE                      COMMAND                  CREATED       STATUS          PORTS                                       NAMES
b852b8d32911   docker-oasismap-frontend   "sh -c './Frontend/D…"   2 hours ago   Up 21 seconds   0.0.0.0:3000->3000/tcp, :::3000->3000/tcp   oasismap-frontend
```

### コンテナに入る
```
docker exec -it oasismap-frontend bash
```

### 作業階層に移動
```
cd /var/www/oasismap/Frontend
```

### Next.jsアプリケーションの作成
```
npx create-next-app sample
```

7項目程出てくるが一旦すべてYes

最後のconfiguredもデフォルトのままEnter

```
cd sample
```

### StarSeekerのフロントエンドモジュールをインストール
```
npm i ../../StarSeeker/StarSeeker/frontend/ -d
```