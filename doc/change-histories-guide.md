# 履歴データ保存機能について

## 概要

幸福度データの履歴は、backend の履歴データ保存機能によって PostgreSQL に保存される。

履歴データ保存機能は Orion の Subscription 通知を受信し、通知内容を検証した上で履歴テーブルへ登録する。

通知受信時および履歴データ保存成功時には INFO ログを出力する。

## 通知経路

Orion の Subscription の通知先は環境によって異なる。

- docker compose 環境: `http://backend:4000/change-histories/notify`（README の手順で手動登録する）
- Azure 環境（`infra/terraform`）: `https://<backend の App Service 既定ホスト名>/change-histories/notify`
  - app レイヤーのワンショット ACI（`orion_subscription`）が自動登録する。同じ description の既存 Subscription は登録後に削除される。
  - 通知は VNet 内の backend の Private Endpoint に直接届き、インターネットを経由しない。
  - Application Gateway では `/change-histories/*` を常に拒否するため、`https://backend.<ルートドメイン>/change-histories/notify` には到達できない。

## Fiwareヘッダの想定値

通知受信時に検証する `Fiware-Service` および `Fiware-ServicePath` の想定値は、`backend/src/change-histories/change-histories.constants.ts` の以下の定数として定義されている。

- `EXPECTED_FIWARE_SERVICE` : `government`
- `EXPECTED_SERVICE_PATH` : `/happiness`

これらの値の検証処理は `POST /change-histories/notify` への通知受信時に行われる。
