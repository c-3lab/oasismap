# Context Data保存機能について

## 概要

幸福度データの履歴は、backend の履歴データ保存機能によって PostgreSQL に保存される。

履歴データ保存機能は Orion の Subscription 通知を受信し、通知内容を検証した上で履歴テーブルへ登録する。

通知受信時および履歴データ保存成功時には INFO ログを出力する。

## Fiwareヘッダの想定値

通知受信時に検証する `Fiware-Service` および `Fiware-ServicePath` の想定値は、`backend/src/change-histories/change-histories.constants.ts` の以下の定数として定義されている。

- `EXPECTED_FIWARE_SERVICE` : `government`
- `EXPECTED_SERVICE_PATH` : `/happiness`

これらの値の検証処理は `backend/src/change-histories/change-histories.controller.ts` で行われる。

## エラーとなるケース

以下の場合はエラーとして扱い、コンテナログへエラーログを出力する。

- `Fiware-Service` が未指定、または想定外の値が指定されている（デフォルト値は `government`）
- `Fiware-ServicePath` が未指定、または想定外の値が指定されている（デフォルト値は `/happiness`）
- 受信したリクエストボディが想定外の形式になっている
- 履歴データの保存処理（DB登録）に失敗した
- 上記以外の予期せぬエラーが発生した

## 処理フロー

処理は次の順で行われる。

1. 受信したリクエストボディの形式検証（DTO）
2. `Fiware-Service` および `Fiware-ServicePath` の検証
3. 通知内容の変換および履歴テーブルへの DB 登録

## ログ出力について

- `Bad request:` で始まるエラーログは、`ValidationExceptionFilter` により HTTP 400（`BadRequestException`）となった場合に出力される。リクエストボディの形式検証に失敗した場合は、通常このログのみが出力される。
- `Fiware-Service` または `Fiware-ServicePath` の検証に失敗した場合も同フィルタにより `Bad request:` で始まるログが出力される。ただし、その前にコントローラ側でヘッダ不正内容を示すエラーログが出力される。
- 履歴データの保存処理（DB登録）に失敗した場合、`Failed to save entity` を含むエラーログが save 処理の try-catch で出力される。
- サービスは `EntitySaveFailedException` を投げ、コントローラはこの例外を受け取った場合は追加のエラーログを出さずに再送出するため、DB登録失敗では通常このログのみが出力される。
- DB登録失敗以外の予期せぬエラーが発生した場合、コントローラの例外ハンドリングにより `Unexpected error while processing notification` を含むエラーログが出力される。
