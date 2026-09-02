## 履歴データ保存用のデータベース・スキーマ・テーブルが自動作成されない場合がある

履歴データ保存機能（`change-histories`）は TypeORM の自動同期を行わない。PostgreSQL 側では `init.sql` がデータディレクトリの初回初期化時にのみ実行されるため、既存 volume がある環境などでは履歴データ保存用のオブジェクトが存在しないことがある。

履歴データ保存機能では `oasismap_context_data` データベースを利用する。

### 対応方法

- [init.sql](https://github.com/c-3lab/oasismap/blob/main/setup/init.sql) を手動実行する。
