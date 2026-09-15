# APIによる幸福度入力方法

## 認証情報の取得

1. KeyCloakにアクセスし、アクセストークンの有効期限を延長する。
    - KeyCloakにアクセス
    - realmをoasismapに変更
    - Realm settings->Tokens->Access Token Lifespanを1日に変更
2. oasismapに一般ユーザーでログインし、認証情報を取得する。
    - oasismapに一般ユーザーでログイン後、開発者ツールを利用しバックエンドへの認証情報を取得
    ![get-auth-data](img/get-auth-data.png)

## APIによる幸福度入力

1. 以下サンプルコードの`XXXXX`の部分を取得した認証情報に置き換え、コマンドを実行する。
    - 構築した環境に応じてURLを変更
```
curl --location 'http://localhost:4000/api/happiness' \
--header 'Authorization: Bearer XXXXX' \
--header 'Content-Type: application/json' \
--data '{
    "latitude":35.68381981,
    "longitude":139.77456498,
    "answers":{
        "happiness1":1,
        "happiness2":0,
        "happiness3":1,
        "happiness4":0,
        "happiness5":1,
        "happiness6":0
    }
}'
```
