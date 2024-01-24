# oasismap
ウェルビーイングを実現するための、地域の協調的幸福度の可視化プラットフォーム

## frontend 開発者向け手順

## StarSeekerをローカルに取り込む
```
git submodule update --init
```

## 以下 未マージのStarSeekerコードを利用したい場合
必要であれば以下手順を実行してください

### PRを出している場合
1. git clone git@github.com:c-3lab/oasismap.git
2. git submodule update --init
3. cd StarSeeker
4. git fetch
5. gh pr checkout 32
 
### PRを出す前に動作確認をしたい場合
1～3は同じ

4. git remote add draft https://github.com/xxxxx/StarSeeker 

    xxxxx部分は編集したリポジトリに合わせて変更、初回のみ次回以降は不要。

5. git fetch draft
6. git checkout draft/ブランチ名


## 環境変数の設定
.enに任意の値を入れる。

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

## 開発用dockerを起動
```
docker compose -f docker-compose-dev.yml up -d
```

実際に立ち上がっているか確認してみる。

```
docker compose ps
```

正常に立ち上がっていることを確認
(ここでは最低限フロントだけ立ち上がっていればok)
```
NAME       IMAGE                 COMMAND                                                                                                                                                                                       SERVICE    CREATED       STATUS                 PORTS
frontend   node:20.10.0          "docker-entrypoint.sh sh -c ' cd /app/frontend/externals/StarSeeker/StarSeeker/frontend && npm install --legacy-peer-deps && cd /app/frontend/ && npm install &&  npm run dev && sleep 30'"   frontend   3 hours ago   Up 3 hours             0.0.0.0:3000->3000/tcp, :::3000->3000/tcp
```

接続できるか確認
※接続できるようになるまで時間がかかる
```
http://localhost:3000/
```