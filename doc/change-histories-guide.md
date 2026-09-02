# 履歴データ保存機能について

## 概要

幸福度データの履歴は、backend の履歴データ保存機能によって PostgreSQL に保存される。

履歴データ保存機能は Orion の Subscription 通知を受信し、通知内容を検証した上で履歴テーブルへ登録する。

通知受信時および履歴データ保存成功時には INFO ログを出力する。

## Fiwareヘッダの想定値

通知受信時に検証する `Fiware-Service` および `Fiware-ServicePath` の想定値は、`backend/src/change-histories/change-histories.constants.ts` の以下の定数として定義されている。

- `EXPECTED_FIWARE_SERVICE` : `government`
- `EXPECTED_SERVICE_PATH` : `/happiness`

これらの値の検証処理は `POST /change-histories/notify` への通知受信時に行われる。
