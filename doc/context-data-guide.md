# Context Data保存機能について

幸福度データの履歴は、backend の履歴データ保存機能によって PostgreSQL に保存される。

履歴データ保存機能は Orion の Subscription 通知を受信し、通知内容を検証した上で履歴テーブルへ登録する。

通知受信時および履歴データ保存成功時には INFO ログを出力する。

以下の場合はエラーとして扱い、コンテナログへエラーログを出力する。

- `Fiware-Service` が `government` ではない
- `Fiware-ServicePath` が `/happiness` ではない
- happiness エンティティとして扱えない通知データである
- 履歴データの保存処理に失敗した
