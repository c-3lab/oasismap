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

## 通知の認証（共有シークレット）

`POST /change-histories/notify` は、Orion 以外からの偽の通知で履歴データが書き換えられないよう、共有シークレットで通知元を認証する。

- backend は環境変数 `ORION_NOTIFY_SECRET` の値と、通知の `X-Oasismap-Notify-Token` ヘッダの値を比較する
  - ヘッダが無い、または値が一致しない通知は 401 で拒否し、WARN ログを出力する（ログにヘッダの値は出力しない）
  - 認証は Fiware ヘッダや本文の検証より先に行う。未認証の通知は本文を検証しない
- `ORION_NOTIFY_SECRET` は英数字と「-」「_」で32文字以上とする。未設定や条件を満たさない値では backend が起動しない
  - 使用できる文字を限定しているのは、Orion がサブスクリプションの値に使用できない文字（`"` `'` `=` `;` `(` `)` など）を定めているため
  - 生成例: `openssl rand -hex 32`
- Orion のサブスクリプションは `notification.http` ではなく `notification.httpCustom` で登録し、`headers` にシークレットを設定する

  ```json
  "notification": {
    "httpCustom": {
      "url": "http://backend:4000/change-histories/notify",
      "headers": {
        "X-Oasismap-Notify-Token": "<ORION_NOTIFY_SECRET の値>"
      }
    }
  }
  ```

### 制約

- シークレットはサブスクリプションの一部として Orion（MongoDB）に保存され、Orion の `GET /v2/subscriptions` で参照できる。Orion 自体は認証を持たないため、この仕組みは「Orion に到達できない第三者からの偽の通知」を防ぐものであり、Orion に到達できる者に対する保護にはならない
- シークレットを変更する場合は、backend の `ORION_NOTIFY_SECRET` とサブスクリプションの両方を更新する。一方のみを更新すると、通知が 401 で拒否され履歴データが保存されない
