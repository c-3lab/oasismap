# Microsoft Azure 上での環境構築手順（Terraform）

本書は **Terraform** により Azure 上に OASIS Map 向けインフラストラクチャを構築する手順をまとめたものである。旧来の Azure Resource Manager テンプレートとシェルスクリプト、および **Azure VM 上の Docker Compose による手順は対象外** である。  
旧来の手順については[こちら](https://github.com/c-3lab/oasismap/blob/v1.2.4/infra/README.md)を参照する。

**環境ごとに** サブスクリプション、ドメイン、`terraform.tfvars` の値は異なる。例示はプレースホルダである。

## 1. 構成図

![azure-diagram](/doc/img/azure-diagram.png)

## 2. アーキテクチャ概要

Terraform は次の **3 レイヤー**を **platform → app → keycloak-realm** の順に適用する。

| レイヤー | 主なリソース |
| --- | --- |
| **platform** | リソースグループ、Virtual Network（DMZ / App / DB / Application Gateway 用サブネット）、Cosmos DB（Mongo API・サーバーレス）、PostgreSQL Flexible Server、Log Analytics、Key Vault、ユーザー割り当てマネージド ID など |
| **app** | Azure Container Registry、Linux App Service（**frontend / backend / Keycloak**）、Azure Container Instances（**Orion、Cygnus**、Mongo/PostgreSQL 用ワンショット CLI、**Orion サブスクリプション登録用ワンショット** など）、Application Gateway（WAF）、DNS ゾーン・レコード、Let's Encrypt（ACME DNS-01）による証明書 |
| **keycloak-realm** | Keycloak のレルム・クライアント・IdP 等（**Keycloak Terraform プロバイダ**） |

実行時の依存関係のイメージは次のとおりである。

- **platform** がネットワーク・データストア・ログ基盤を用意する。
- **app** が platform の remote state を参照し、アプリとゲートウェイ、ACI、DNS、証明書を構築する（初回などに **`az acr build`** によりイメージをビルド・プッシュする）。
- **keycloak-realm** が app の remote state と Key Vault を参照し、HTTPS で Keycloak 管理 API に接続してレルムを構成する。

## 3. 前提ツール

| ツール | 備考 |
| --- | --- |
| [Terraform](https://www.terraform.io/) | **Version 1.14.5 以上**（各レイヤーの `terraform` ブロックに準拠） |
| [Azure CLI](https://learn.microsoft.com/ja-jp/cli/azure/install-azure-cli) (`az`) | 認証は `az login` など。サブスクリプション上でリソース作成に必要な権限が必要である。 |
| **app レイヤー** | リソース作成時に **`az acr build`** が実行される（`infra/terraform/app` からの相対パスで `frontend` / `backend` / `keycloak` / `fiware` 等を参照）。実行時の作業ディレクトリに注意する。 |

## 4. リポジトリの配置

**app レイヤー**の Terraform は、モノレポ **ルート**（`frontend`、`backend`、`keycloak`、`fiware/orion` 等が直下にある状態）を前提とする。  
例:

```text
<リポジトリルート>/
  frontend/
  backend/
  keycloak/
  fiware/
  infra/terraform/app/   ← ここで terraform を実行
```

ルート以外から実行する場合は `terraform -chdir=infra/terraform/app` のように **作業ディレクトリを合わせる**。

## 5. Terraform リモート state（Azure ストレージ）の準備

各レイヤーは **azurerm バックエンド**で state を Azure Storage に保存する。ストレージアカウントは 別途用意するか、[infra/terraform/create-storage-tfstate.sh](terraform/create-storage-tfstate.sh) または [infra/terraform/create-storage-tfstate.ps1](terraform/create-storage-tfstate.ps1) を実行して作成する。  
作成後、次のような **コンテナと state キー**を使う（`backend.tf` の定義に一致させる）。

| レイヤー | コンテナ名 | state キー（ファイル名） |
| --- | --- | --- |
| platform | `platform` | `terraform.tfstate` |
| app | `app` | `terraform.tfstate` |
| keycloak-realm | `app` | `keycloak-realm.tfstate` |

### 5.1. 事前準備

[create-storage-tfstate.sh](terraform/create-storage-tfstate.sh) または [create-storage-tfstate.ps1](terraform/create-storage-tfstate.ps1) を実行する前に、次を満たすこと。

| 項目 | 内容 |
| --- | --- |
| **必須環境変数（4 つ）** | 未設定または空だとスクリプトは終了する。 |
| `TF_STATE_RESOURCE_GROUP_NAME` | tfstate 用の **リソースグループ名**（存在しなければ作成）。 |
| `TF_STATE_LOCATION` | 上記 RG・ストレージの **Azure リージョン**（例: `japaneast`）。 |
| `TF_STATE_PREFIX` | ストレージアカウント名の **接頭辞**。実名は `prefix` + `st` + RG 名由来の MD5（最大 24 文字に収まるようハッシュを切り詰め）として生成される。 |
| `AZURE_TENANT_ID` | `az login --tenant` に渡す **テナント ID**。 |
| **必須ツール** | **Azure CLI**（`az`）が PATH にあること。 |
| **認証** | スクリプトが `az login --tenant "${AZURE_TENANT_ID}"` を実行するため、ブラウザ／デバイスコード等でのログインが可能であること。 |
| **権限** | 対象サブスクリプションで、RG 作成・ストレージアカウント作成・コンテナ作成ができること（具体的なロールは運用ポリシーに合わせて定める）。 |
| **サブスクリプション** | スクリプトは `az account set` を実行しない。複数サブスクリプションがある場合は、**実行前に** `az account set --subscription ...` で既定のサブスクリプションを tfstate 用に合わせる。 |
| **実行場所** | `infra/terraform` に `cd` してから実行する。 |

### 5.2. ストレージアカウントの作成

1. 専用のリソースグループとストレージアカウント、上記コンテナを作成する。

   ```sh
    # macOS / Linux 向け
    cd infra/terraform
    ./create-storage-tfstate.sh
    ```

    ```powershell
    # Windows 向け
    cd infra\terraform
    .\create-storage-tfstate.ps1
    ```

2. **infra/terraform/platform**、**infra/terraform/app**、**infra/terraform/keycloak-realm**、それぞれのディレクトリに **`config.azurerm.tfbackend`** が作成されていることを確認する。

3. 各レイヤーで `terraform init` 時に `-backend-config=config.azurerm.tfbackend` を渡す（後述）。

`terraform.tfvars` の雛形は各レイヤーの `terraform.tfvars.example` を参照する。

## 6. 各レイヤーの変数ファイル

各レイヤーで `terraform.tfvars.example` を `terraform.tfvars` にコピーし、値を編集する。

- [platform/terraform.tfvars.example](terraform/platform/terraform.tfvars.example)
- [app/terraform.tfvars.example](terraform/app/terraform.tfvars.example)
- [keycloak-realm/terraform.tfvars.example](terraform/keycloak-realm/terraform.tfvars.example)

**app** と **keycloak-realm** では、state 用ストレージの `backend_resource_group_name` / `backend_storage_account_name` を **同一**に揃える（app と keycloak-realm は同じストレージアカウントの `app` コンテナを使用する）。

### 6.1. 主要な変数の説明

#### 6.1.1. terraform/platform/terraform.tfvars

変数の詳細については[terraform/platform/variables.tf](terraform/platform/variables.tf)を参照する。

| 変数名 | 概要 | デフォルト値 |
| --- | --- | --- |
| resource_group_name | リソースグループ名 | |
| prefix | リソース名の接頭辞 | |
| location | リソースの場所 | japaneast |
| postgres_admin_login | PostgreSQL Flexible Server の管理者ログイン名 | postgres |
| postgres_admin_password | PostgreSQL Flexible Server の管理者パスワード | |
| alert_mail_dest_address | 監視用メールアドレス | |

#### 6.1.2. terraform/app/terraform.tfvars

変数の詳細については[terraform/app/variables.tf](terraform/app/variables.tf)を参照する。

| 変数名 | 概要 | デフォルト値 |
| --- | --- | --- |
| backend_resource_group_name | リモート state 用リソースグループ名 | |
| backend_storage_account_name | リモート state 用ストレージアカウント名 | |
| prefix | リソース名の接頭辞 | |
| location | リソースの場所 | japaneast |
| app_frontend_name | Frontend アプリケーション名 | |
| app_frontend_nextauth_secret | Frontend アプリケーションの NextAuth シークレット | |
| terms_municipality_name | 参加同意書の自治体名 | 【自治体名】 |
| terms_date | 参加同意書の日付 | yyyy年mm月dd日 |
| terms_title_suffix | 参加同意書のタイトルの接尾辞 | （雛形） |
| app_backend_name | Backend アプリケーション名 | |
| app_keycloak_name | Keycloak アプリケーション名 | |
| app_keycloak_admin | Keycloak の管理者ユーザー名 | |
| app_keycloak_admin_password | Keycloak の管理者パスワード | |
| acme_server_url | ACME サーバー URL | `https://acme-v02.api.letsencrypt.org/directory` |
| acme_registration_email | ACME 登録メールアドレス | |
| dns_resource_group_name | DNS リソースグループ名 | |
| root_domain_name | ルートドメイン名 | |
| parent_domain_name | 親ドメイン名 | null |
| parent_zone_resource_group_name | 親ドメインのリソースグループ名 | null |

#### 6.1.3. terraform/keycloak-realm/terraform.tfvars

変数の詳細については[terraform/keycloak-realm/variables.tf](terraform/keycloak-realm/variables.tf)を参照する。

| 変数名 | 概要 | デフォルト値 |
| --- | --- | --- |
| backend_resource_group_name | リモート state 用リソースグループ名 | |
| backend_storage_account_name | リモート state 用ストレージアカウント名 | |
| app_keycloak_admin | Keycloak の管理者ユーザー名 | |
| app_keycloak_admin_password | Keycloak の管理者パスワード | |
| keycloak_google_client_id | Google クライアント ID | |
| keycloak_google_client_secret | Google クライアントシークレット | |

### 6.2. Google Cloud 事前準備

1. [Google Cloud - 認証情報 - API とサービス](https://console.cloud.google.com/apis/credentials)に接続
2. `プロジェクトを選択` から新しいプロジェクトを作成
3. `認証情報を作成` を選択して `OAuth クライアント ID` を作成
4. アプリケーションの種類に `ウェブアプリケーション` を選択して作成
5. クライアント ID とクライアントシークレットを `infra/terraform/keycloak-realm/terraform.tfvars` に設定する

## 7. platform レイヤー

ディレクトリ: `infra/terraform/platform`

実行例:

```sh
cd infra/terraform/platform
terraform init -backend-config=config.azurerm.tfbackend
terraform plan
terraform apply
```

## 8. app レイヤー

[7. platform レイヤー](#7-platform-レイヤー) が完了していることを前提とする。  
ディレクトリ: **`infra/terraform/app`**（リポジトリルートからの相対パスで `../../../frontend` 等が解決されること）  

実行例:

```sh
cd infra/terraform/app
terraform init -backend-config=config.azurerm.tfbackend
terraform plan
terraform apply
```

### 8.1. 注意事項

- **platform** の apply が完了し、remote state が読める状態にする。
- 初回など、コンテナイメージ作成リソースの前に **`action` 経由で `az acr build`** が実行される。Azure にログイン済みであり、パスがモノレポ構成と一致している必要がある。
- **Let's Encrypt**
  - 本番向け: `acme_server_url` は既定の本番 ACME ディレクトリ（`variables.tf` のコメント参照）。
  - 検証時: レート制限回避のため **ステージング URL** に切り替え可能である。ステージング証明書はブラウザで信頼されない。運用前に本番 URL へ戻し、再 apply する。
- **DNS**
  - `root_domain_name` と `dns_resource_group_name` で DNS ゾーンとレコードを管理する。
  - 親ゾーンに **NS 委任**が必要な場合は、`parent_domain_name` と `parent_zone_resource_group_name` を設定する（`terraform.tfvars.example` のコメント参照）。
- **Application Gateway（WAF）**  
  アプリがブロックされる場合は、まず **Detection** モードでログを確認するなど、従来どおり WAF とアプリの整合を取る（`agw_waf_mode` 等）。

### 8.2. apply 後に確認する出力例

`terraform output` で、Application Gateway のパブリック IP、ルート URL、バックエンド／Keycloak の URL などが取得できる。DNS の A レコードや委任が正しければ、HTTPS で各サービスに到達できるようになる。

## 9. keycloak-realm レイヤー

[8. app レイヤー](#8-app-レイヤー) が完了していることを前提とする。  
Keycloak が HTTPS で応答する状態になっていることを確認してから実行する。  

ディレクトリ: `infra/terraform/keycloak-realm`

実行例:

```sh
cd infra/terraform/keycloak-realm
terraform init -backend-config=config.azurerm.tfbackend
terraform plan
terraform apply
```

- Keycloak プロバイダは **app** の出力する Keycloak URL（`https://keycloak.<ドメイン>`）に接続する。
- **app** で Let's Encrypt を **ステージング**にしている場合、プロバイダ側で証明書検証を緩和する設定が有効になる（本番証明書への切り替え後に再 apply することを推奨する）。
- Google IdP を使う場合は `keycloak-realm/terraform.tfvars` に `keycloak_google_client_id` / `keycloak_google_client_secret` 等を設定する（空なら IdP 作成をスキップする動きになる）。

### 9.1. Google Cloud（OAuth）とリダイレクト URI

1. Google Cloud コンソールで OAuth クライアントを用意する（従来の「ウェブアプリケーション」手順と同様）。
2. Keycloak の **Google IdP 用リダイレクト URI** は、`terraform apply` 後に **keycloak-realm** の出力 `oidc_google_identity_provider_redirect_uri` を参照するか、Keycloak 管理コンソールの IdP 画面に表示される URI を Google Cloud の「承認済みのリダイレクト URI」に登録する。

## 10. 自治体管理者アカウントの準備

1. ブラウザから `https://keycloak.<設定したルートドメイン>` にアクセスし、keycloak の管理コンソールに接続する
2. 「Administration Console」をクリックする
3. `app_keycloak_admin` と `app_keycloak_admin_password` でログインする（`infra/terraform/app/terraform.tfvars` および `infra/terraform/keycloak-realm/terraform.tfvars` に同一の値を設定すること）
4. `realm` から `oasismap` を選択する
5. 左のメニューバーから `Users` を選択
6. `Add User` を選択する
7. `Username`,`profile.attribute.nickname` を入力して `Create` を選択する
    ※ `Username` と `profile.attribute.nickname` は同じ値を入れる
8. `Credentials` を選択して `Set password` を選択してパスワードを入力する
9. パスワード入力後, `Temporary` のチェックを外して `Save` を選択する
10. `Save password` を選択して保存する

## 11. 動作確認

1. スマートフォンから `https://<設定したルートドメイン>` にアクセスし、oasismapが動作していることを確認する
    - 参加同意書が正しく修正されていることも併せて確認する
2. スマートフォンから `https://<設定したルートドメイン>/admin/login` にアクセスし、oasismapの管理者画面が動作していることを確認する
    - 一般利用者と同様に住所や年代等の入力画面が表示された場合は、ダミーのデータを入力する
