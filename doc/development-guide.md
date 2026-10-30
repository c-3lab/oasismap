# 開発者向け手順

## 前提
[README.md](../README.md) に記載されている手順を実施すること。

以下がインストールされていること。
- docker
- node 22.17.0

## frontend 初期設定
以下コマンドを順に実行して環境に各種パッケージをインストールする。
```
cd ./frontend
npm ci
```

## backend 初期設定
以下コマンドを順に実行して環境に各種パッケージをインストールする。
```
cd ../backend
npm ci
```

## 開発用コンテナを起動
以下コマンドを順に実行する。

1. コンテナを起動する
```
cd ../
docker compose -f docker-compose-dev.yml up -d
```

2. コンテナが起動していることを確認する
```
docker compose -f docker-compose-dev.yml ps
```

```
NAME       ...(省略) STATUS          ...(省略) PORTS                                       
backend              Up 1 minutes             0.0.0.0:4000->4000/tcp, :::4000->4000/tcp
frontend             Up 1 minutes             0.0.0.0:3000->3000/tcp, :::3000->3000/tcp
keycloak             Up 1 minutes             0.0.0.0:8080->8080/tcp, :::8080->8080/tcp, 8443/tcp
mongo                Up 1 minutes             27017/tcp
orion                Up 1 minutes             0.0.0.0:1026->1026/tcp, :::1026
postgres             Up 1 minutes             5432/tcp
```

## KeycloakのProviderをカスタマイズ
カスタマイズしない場合は本手順はスキップしてください。

1. `keycloak-extension/src` 配下のソースコードを編集

2. ビルド用コンテナに入る
```
docker compose exec keycloak-extension bash
```

3. コンテナ内でビルド
```
mvn install
```

4. コンテナから抜ける
```
exit
```

5. ビルドしたjarファイルを `keycloak/providers` 配下に設置
```
cp keycloak-extension/target/authenticator-oasismap.jar keycloak/providers/authenticator-oasismap.jar
```

6. コンテナを再起動
```
docker compose -f docker-compose-dev.yml restart keycloak
```

## 動作確認

### フロントエンド
1. コンテナに入る
```
docker compose -f docker-compose-dev.yml exec frontend bash
```

2. サーバー起動
```
npm run dev
```

3. 以下にブラウザから接続して表示されればok
```
http://localhost:3000
```

### バックエンド
1. コンテナに入る
```
docker compose -f docker-compose-dev.yml exec backend bash
```

2. サーバー起動
```
npm run start:dev
```

3. 以下の curl コマンドでGETリクエストを送信する
```
curl http://localhost:4000
```

4. 以下が返却されればok
```
Hello World!
```

## 共通機能の利用ルール

地域幸福度可視化アプリは、ブラウザ側で発生したエラー情報を収集し、サーバーに送信する機能を有している。  
ボタンクリック等の各種イベントで当該機能を動作させるため、以下のルールに則りコードを作成すること。

エラー報告時には直近の操作履歴が付与される。  
関連するファイル構成は以下のとおり。

```
frontend/src/
├── libs/
│   ├── error-report.ts                    … 操作ログ・ペイロード組立・エラー送信
│   └── fetch.ts                           … HTTP 通信の共通処理（操作ログ記録・API エラー送信を内包）
└── components/
    ├── action-log/
    │   ├── index.tsx                      … ActionLogButton 等（画面から import）// ログ取得したいMUIコンポーネントが無い場合追加
    │   ├── event-overrides.tsx            … onClick／onChange のログ記録機能を追加実行するイベント関数の上書き
    │   ├── global-error-listener.tsx      … 未捕捉エラー等の捕捉・報告 // エラーの報告内容当を変える場合に編集（通常は不要）
    │   └── route-change-listener.tsx      … ルート変更の自動記録 // 捕捉・ルートログの仕様変更時に編集（通常は不要）
    └── map/
        └── map-interaction-logger.tsx     … 地図 pan/zoom の記録
```

### ユーザー操作イベントを伴うコンポーネントの利用ルール
**ルール:** `onClick` や `onChange` などユーザー操作のイベントを持つ UI は、MUI を直接使わず `@/components/action-log` の `ActionLog` **で始まるコンポーネント**（例: `ActionLogButton` / `ActionLogIconButton` / `ActionLogOutlinedInput`）を使う。

1. 既存画面を修正する場合は、操作対象の JSX を上記 ActionLog 版に差し替える
2. 必ず `actionLog="ログ出力用ラベル"` を付ける（camelCase・短く意味が分かる名前・既存ラベルと重複しない）

    例:

    ```tsx
    <ActionLogIconButton
      actionLog="headerMenu"
      onClick={() => handleDrawerOpen?.()}
    />
    ```

3. 一覧は `frontend/src/components/action-log/index.tsx` の export を参照する
4. 定義されていないコンポーネントは「記録用コンポーネントを新規追加する」手順に従い、定義を追加した上で利用する

#### 記録用コンポーネントを新規追加する
対象の MUI コンポーネント用ラッパーが `action-log/index.tsx` に無い場合:

1. `frontend/src/components/action-log/index.tsx` を開く
2. 対象の MUI コンポーネントを import する
3. 次のいずれかで export を追加する

   - **onClick 系**: `createActionLogOnClickComponent(MuiXxx, 'ActionLogXxx')`
   - **onChange 系**: `createActionLogOnChangeComponent(MuiXxx, 'ActionLogXxx')`

4. 画面側では上記「ユーザー操作イベントを伴うコンポーネントの利用ルール」に従って使う

### ユーザー操作イベントのエラーハンドリングに関するルール
**ルール:** `onClick` 等のイベントハンドラ内で例外が起きうる処理は、必ず `try` / `catch` で囲み、`catch` 内で `@/libs/error-report` の `reportError(error)` を呼ぶ（操作ログ付きでサーバーへ送信される）。

1. ユーザー向けメッセージ表示など、既存画面と同様の後処理も `catch` 内で行う
2. `fetch.ts` 経由の API 失敗（`ApiCallError`）は fetch 層で既に報告済みのため、`reportError` は二重送信しない
3. 位置情報のエラーコールバックでは `reportPositionError(code)` を使う

例:

```tsx
import { reportError } from '@/libs/error-report'

const handleClick = async () => {
  try {
    await doSomething()
  } catch (error) {
    reportError(error)
    console.error('Error:', error)
  }
}
```

**補足:** ブラウザの DevTools と Frontend コンテナでは出力形式が異なるが、元のエラー内容は同一。  
ブラウザ側は `console.error` 等で出力し、コンテナ向けログは API 失敗や位置情報エラーなどの種別に応じて整形して出力している（例: `[apiCall:ラベル]` を付与）。  
そのため表示内容に差はあるが、`throw` されるエラーそのものに違いはない認識。

### その他の関連機能について
通常変更は不要だが、当該機能に関連する処理概要を補足として記載する。

| 種別 | 手順 |
|------|------|
| ルート変更 | 追加不要（`route-change-listener` が自動記録） |
| API 呼び出し | `fetch.ts` / `error-report` 経由。新規 API を `fetchData` 等から呼ぶ場合は既存の `logApiCall`・ラベル解決に合わせて追記 |
| 地図の pan/zoom | `map-interaction-logger` が記録。コードから地図を動かす直前は `skipMapInteractionLogs` を呼ぶ |
| イベントハンドラ内で直接 | `pushActionLog('click', 'ラベル')` 等（`error-report` から import） |
