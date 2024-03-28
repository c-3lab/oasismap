# 現在位置情報を利用した動作確認手順

## 前提

OASISmapでは現在位置情報を利用しているが、  
内部で利用している `Geolocation API` は `https` 起動時のみ利用可能なため、  
実際の現在位置情報を利用した動作確認を行う場合は、  
アプリケーションを `https` で起動する必要がある  

本手順では `ngrok` を利用して `https` でアプリケーションを起動することで、  
現在位置情報を利用した処理の動作確認方法を記載する。

## 注意事項

ngrokの無料プランには利用上限がある。  
本手順は帯域幅と転送量が増加するため注意すること。

## 手順

### README.md の手順実施

- [README.md](../README.md) に記載されている手順を実施する  

### ngrok で複数ポートのURLを公開

#### `ngrok.yml` に公開するポートの設定を追加する

1. `~/.config/ngrok/ngrok.yml` を開く

2. `tunnels` に `keycloak` `backend` `frontend` を追加する
```
version: "2"
authtoken: xxxxxxxxxxx
tunnels:
    keycloak:
        proto: http
        addr: 8080
    backend:
        proto: http
        addr: 4000
    frontend:
        proto: http
        addr: 3000
```

#### ngrok起動

1. 以下のコマンドでngrokを起動する

```
ngrok start --all
```

2. `keycloak` `backend` `frontend` にURLが割り当てられていることを確認する

```
ngrok                                                                                         (Ctrl+C to quit)
                                                                                                              
Take our ngrok in production survey! https://forms.gle/aXiBFWzEA36DudFn6                                      
                                                                                                              
Session Status                online                                                                          
Account                       アカウント名 (Plan: Free)                                                       
Update                        update available (version 3.7.0, Ctrl-U to update)                              
Version                       3.6.0                                                                           
Region                        Japan (jp)                                                                      
Latency                       4ms                                                                             
Web Interface                 http://127.0.0.1:4040                                                           
Forwarding                    https://xxxx-xxx-xxx-x-xx.ngrok-free.app -> http://localhost:8080               
Forwarding                    https://xxxx-xxx-xxx-x-xx.ngrok-free.app -> http://localhost:4000               
Forwarding                    https://xxxx-xxx-xxx-x-xx.ngrok-free.app -> http://localhost:3000               
                                                                                                              
Connections                   ttl     opn     rt1     rt5     p50     p90                                     
                              220     1       0.00    0.01    0.17    89.26                                   
                                                                                                              
HTTP Requests                                                                                                 
-------------    
```

### ngrok 割り当てたURLを各コンテナに反映

#### keycloak

1. `keycloak/variables.json` の `ClientBaseURL` を公開中のフロントエンドのURLに変更

2. `keycloak/README.md` の手順を実施

#### frontend, backend

1. `.env` の `NEXTAUTH_URL` を公開中のフロントエンドのURLに変更

2. `.env` の `BACKEND_URL` を公開中のバックエンドのURLに変更

#### コンテナ再起動

- 以下のコマンドを実行してコンテナを再起動する

```
docker compose -f docker-compose-dev.yml up -d frontend backend
```

### GoogleCloudのリダイレクトURIを変更

1. Keycloak の管理コンソールを開く

2. `realm` から `oasismap` を選択

3. 左のメニューバーから `Identity providers` を選択

4. `google` をクリック

5. `Redirect URI` の値をコピーして控えておく

6. [Google Cloud](https://console.cloud.google.com/apis/credentials)に接続

7. 事前準備にて作成した認証情報を選択

8. `承認済みのリダイレクトURI` に控えておいた `Redirect URI` を転記

### ngrok の確認ページ非表示

ngrok利用中に「You are about to visit」ページが表示されることがある。  
バックエンドとの非同期通信時にレスポンスに上記ページのHTML要素が返却されてしまい、  
通信処理の確認ができないため、ページの非表示方法を記載する。

1. [ModHeader](https://modheader.com/) をインストールする  
    ※HTTPヘッダを付与するブラウザ拡張機能

2. ModHeaderの `Request headers` に以下の値を設定する

```
ngrok-skip-browser-warning: value
```

### 動作確認

- 公開中のフロントエンドのURLにアクセスし動作確認を行う
