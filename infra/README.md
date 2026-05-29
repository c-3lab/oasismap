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
| **platform** | リソースグループ、Virtual Network（DMZ / App / DB / Application Gateway 用サブネット）、Cosmos DB（Mongo API・サーバーレス）、PostgreSQL Flexible Server、Log Analytics、Key Vault、DNS ゾーン・レコード、ユーザー割り当てマネージド ID など |
| **app** | Azure Container Registry、Linux App Service（**frontend / backend / Keycloak**）、Azure Container Instances（**Orion、Cygnus**、Mongo/PostgreSQL 用ワンショット CLI、**Orion サブスクリプション登録用ワンショット** など）、Application Gateway（WAF）、Let's Encrypt（ACME DNS-01）による証明書 |
| **keycloak-realm** | Keycloak のレルム・クライアント・IdP 等（**Keycloak Terraform プロバイダ**） |

実行時の依存関係のイメージは次のとおりである。

- **platform** がネットワーク・データストア・ログ基盤・DNSを用意する。
- **app** が platform の remote state を参照し、アプリとゲートウェイ、ACI、証明書を構築する（初回などに **`az acr build`** によりイメージをビルド・プッシュする）。
- **keycloak-realm** が app の remote state と Key Vault を参照し、HTTPS で Keycloak 管理 API に接続してレルムを構成する。

## 3. 前提ツール

| ツール | 備考 |
| --- | --- |
| [Terraform](https://www.terraform.io/) | **Version 1.14.9 以上**（各レイヤーの `terraform` ブロックに準拠） |
| [Azure CLI](https://learn.microsoft.com/ja-jp/cli/azure/install-azure-cli) (`az`) | **Version 2.85.0 以上** 認証は `az login` など。サブスクリプション上でリソース作成に必要な権限が必要である。 |
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
| `TF_STATE_LOCATION` | 上記 RG・ストレージの **Azure リージョン**（例: `japanwest`）。 |
| `TF_STATE_PREFIX` | ストレージアカウント名の **接頭辞**。実名は `prefix` + `st` + RG 名由来の MD5（最大 24 文字に収まるようハッシュを切り詰め）として生成される。 |
| `AZURE_TENANT_ID` | `az login --tenant` に渡す **テナント ID**。 |
| **必須ツール** | **Azure CLI**（`az`）が PATH にあること。 |
| **認証** | スクリプトが `az login --tenant "${AZURE_TENANT_ID}"` を実行するため、ブラウザ／デバイスコード等でのログインが可能であること。 |
| **権限** | 対象サブスクリプションで、RG 作成・ストレージアカウント作成・コンテナ作成ができること（具体的なロールは運用ポリシーに合わせて定める）。 |
| **サブスクリプション** | スクリプトは `az account set` を実行しない。複数サブスクリプションがある場合は、**実行前に** `az account set --subscription ...` で既定のサブスクリプションを tfstate 用に合わせる。 |
| **実行場所** | `infra/terraform` に `cd` してから実行する。 |

### 5.2. ストレージアカウントの作成

1. `env.(sh|ps1).example`を`env.(sh|ps1)`にコピーし、元に環境変数設定用のスクリプトを作成する。

   ```sh
   # macOS / Linux 向け
   cd infra/terraform
   cp env.sh.example env.sh
   ```

   ```sh
   # Windows 向け
   cd infra\terraform
   cp env.ps1.example env.ps1
   ```

2. `env.(sh|ps1)`を編集する。

3. 環境変数を読み込ませる

   ```sh
   # macOS / Linux 向け
   . ./env.sh
   ```

   ```sh
   # Windows 向け
   . .\env.ps1
   ```

4. 専用のリソースグループとストレージアカウント、上記コンテナを作成する。

   ```sh
   # macOS / Linux 向け
   bash ./create-storage-tfstate.sh
   ```

   ```powershell
   # Windows 向け
   .\create-storage-tfstate.ps1
   ```

5. **infra/terraform/platform**、**infra/terraform/app**、**infra/terraform/keycloak-realm**、それぞれのディレクトリに **`config.azurerm.tfbackend`** が作成されていることを確認する。

6. **infra/terraform/platform**、**infra/terraform/app**、**infra/terraform/keycloak-realm**、それぞれのディレクトリに `terraform.tfvars.example` を雛形にして **`terraform.tfvars`** が作成されていることを確認する。

7. 各レイヤーで `terraform init` 時に `-backend-config=config.azurerm.tfbackend` を渡す（後述）。

`terraform.tfvars` の雛形は各レイヤーの `terraform.tfvars.example` を参照する。

## 6. 各レイヤーの変数ファイル

各レイヤーで `terraform.tfvars.example` から生成された `terraform.tfvars` に定義されている変数を編集する。

- [platform/terraform.tfvars.example](terraform/platform/terraform.tfvars.example)
- [app/terraform.tfvars.example](terraform/app/terraform.tfvars.example)
- [keycloak-realm/terraform.tfvars.example](terraform/keycloak-realm/terraform.tfvars.example)

**app** と **keycloak-realm** では、state 用ストレージの `backend_resource_group_name` / `backend_storage_account_name` が **自動的に設定** されている（app と keycloak-realm は同じストレージアカウントの `app` コンテナを使用する）。

### 6.1. 主要な変数の説明

#### 6.1.1. terraform/platform/terraform.tfvars

変数の詳細については[terraform/platform/variables.tf](terraform/platform/variables.tf)を参照する。

| 変数名 | 概要 | デフォルト値 |
| --- | --- | --- |
| resource_group_name | リソースグループ名 | |
| prefix | リソース名の接頭辞 | |
| location | リソースの場所<br/>（2026/4時点で `japaneast` ではApp Serviceが利用できないためデフォルト値は `japanwest`） | japanwest |
| postgres_admin_login | PostgreSQL Flexible Server の管理者ログイン名 | postgres |
| postgres_admin_password | PostgreSQL Flexible Server の管理者パスワード | |
| alert_mail_dest_address | 監視用メールアドレス | |
| dns_resource_group_name | DNS リソースグループ名 | |
| root_domain_name | ルートドメイン名 | |
| parent_domain_name | 親ドメイン名<br/>親ゾーンに NS 委任が必要な場合に設定する。（README §8.1） | null |
| parent_zone_resource_group_name | 親ドメインのリソースグループ名 <br/>親ゾーンに NS 委任が必要な場合に設定する。（README §8.1） | null | |

#### 6.1.2. terraform/app/terraform.tfvars

変数の詳細については[terraform/app/variables.tf](terraform/app/variables.tf)を参照する。

| 変数名 | 概要 | デフォルト値 |
| --- | --- | --- |
| backend_resource_group_name | リモート state 用リソースグループ名<br/> `app/config.azurerm.tfbackend` の `resource_group_name` の値を自動設定| |
| backend_storage_account_name | リモート state 用ストレージアカウント名<br/> `app/config.azurerm.tfbackend` の `storage_account_name` の値を自動設定| |
| app_frontend_name | Frontend アプリケーション名（英数字とハイフンのみ） | |
| app_frontend_nextauth_secret | Frontend アプリケーションの NextAuth シークレット | |
| app_backend_name | Backend アプリケーション名（英数字とハイフンのみ） | |
| app_keycloak_name | Keycloak アプリケーション名（英数字とハイフンのみ） | |
| app_keycloak_admin | Keycloak の管理者ユーザー名 | |
| app_keycloak_admin_password | Keycloak の管理者パスワード | |
| acme_server_url | ACME サーバー URL | `https://acme-v02.api.letsencrypt.org/directory` |
| acme_registration_email | ACME 登録メールアドレス | |
 terms_municipality_name | 参加同意書の自治体名 | 【自治体名】 |
| terms_date | 参加同意書の日付 | yyyy年mm月dd日 |
| terms_title_suffix | 参加同意書のタイトルの接尾辞 | （雛形） |

#### 6.1.3. terraform/keycloak-realm/terraform.tfvars

変数の詳細については[terraform/keycloak-realm/variables.tf](terraform/keycloak-realm/variables.tf)を参照する。

| 変数名 | 概要 | デフォルト値 |
| --- | --- | --- |
| backend_resource_group_name | リモート state 用リソースグループ名<br/> `keycloak-realm/config.azurerm.tfbackend` の `resource_group_name` の値を自動設定| |
| backend_storage_account_name | リモート state 用ストレージアカウント名<br/> `keycloak-realm/config.azurerm.tfbackend` の `storage_account_name` の値を自動設定| |
| keycloak_google_client_id | Google クライアント ID | |
| keycloak_google_client_secret | Google クライアントシークレット | |

* Google認証を利用せず、keycloak単体でユーザー登録&認証認可を完結させる場合、 `keycloak_google_client_id` と `keycloak_google_client_secret` を設定しない

### 6.2. Google Cloud 事前準備（Google認証を利用する場合のみ）

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
terraform init -backend-config=config.azurerm.tfbackend -lockfile=readonly
terraform plan
terraform apply
```

### 7.1. 注意事項

- `terraform init` の `-lockfile=readonly` オプションは、初期化時にlockファイルを更新しないため、以下の場合はオプションを変更すること。
  - macOSからLinuxへなど、lockファイル作成時点からOSとCPUアーキテクチャを変更した場合、初回は当該アーキテクチャのプロバイダのハッシュ値がlockfileに存在しないため `Error: Required plugins are not installed` エラーが発生する。この場合、 `terraform init -backend-config=config.azurerm.tfbackend` を実行してlockfileに当該アーキテクチャのプロバイダのハッシュ値を追加する（プロバイダのバージョンは維持される）。
  - terraformのプロバイダをバージョンアップする場合は `terraform init -backend-config=config.azurerm.tfbackend -upgrade` を実行してlockfileを更新する。
- 実行前の確認が必要ない場合は `terraform apply -auto-approve` としてもよい。
- **DNS**
  - `root_domain_name` と `dns_resource_group_name` で DNS ゾーンとレコードを管理する。
  - 親ゾーンに **NS 委任**が必要な場合は、`parent_domain_name` と `parent_zone_resource_group_name` を設定する（`terraform.tfvars.example` のコメント参照）。

## 8. app レイヤー

[7. platform レイヤー](#7-platform-レイヤー) が完了していることを前提とする。  
ディレクトリ: **`infra/terraform/app`**（リポジトリルートからの相対パスで `../../../frontend` 等が解決されること）  


実行例:

```sh
cd infra/terraform/app
terraform init -backend-config=config.azurerm.tfbackend -lockfile=readonly
terraform plan
terraform apply
```

### 8.1. 注意事項
- Let's Encrypt（ACME DNS-01）による証明書を取得する際に、platformレイヤで構築したDNSの浸透が遅れDNSチャレンジに失敗し、 `acme_certificate` がfailする場合がある。この場合、 `terraform apply` を再実行する。
- `terraform init` の `-lockfile=readonly` オプションは、初期化時にlockファイルを更新しないため、以下の場合はオプションを変更すること。
  - macOSからLinuxへなど、lockファイル作成時点からOSとCPUアーキテクチャを変更した場合、初回は当該アーキテクチャのプロバイダのハッシュ値がlockfileに存在しないため `Error: Required plugins are not installed` エラーが発生する。この場合、 `terraform init -backend-config=config.azurerm.tfbackend` を実行してlockfileに当該アーキテクチャのプロバイダのハッシュ値を追加する（プロバイダのバージョンは維持される）。
  - terraformのプロバイダをバージョンアップする場合は `terraform init -backend-config=config.azurerm.tfbackend -upgrade` を実行してlockfileを更新する。
- 実行前の確認が必要ない場合は `terraform apply -auto-approve` としてもよい。
- **platform** の apply が完了し、remote state が読める状態にする。
- 初回など、コンテナイメージ作成リソースの前に **`action` 経由で `az acr build`** が実行される。Azure にログイン済みであり、パスがモノレポ構成と一致している必要がある。
- **Let's Encrypt**
  - 本番向け: `acme_server_url` は既定の本番 ACME ディレクトリ（`variables.tf` のコメント参照）。
  - 検証時: レート制限回避のため **ステージング URL** に切り替え可能である。ステージング証明書はブラウザで信頼されない。運用前に本番 URL へ戻し、再 apply する。
- **Application Gateway（WAF）**  
  アプリがブロックされる場合は、まず **Detection** モードでログを確認するなど、従来どおり WAF とアプリの整合を取る（`agw_waf_mode` 等）。

### 8.2. apply 後に確認する出力例

`terraform output` で、ルート URL、バックエンド／Keycloak の URL などが取得できる。DNS の A レコードや委任が正しければ、HTTPS で各サービスに到達できるようになる。

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

### 9.1. 注意事項
- `terraform init` の `-lockfile=readonly` オプションは、初期化時にlockファイルを更新しないため、以下の場合はオプションを変更すること。
  - macOSからLinuxへなど、lockファイル作成時点からOSとCPUアーキテクチャを変更した場合、初回は当該アーキテクチャのプロバイダのハッシュ値がlockfileに存在しないため `Error: Required plugins are not installed` エラーが発生する。この場合、 `terraform init -backend-config=config.azurerm.tfbackend` を実行してlockfileに当該アーキテクチャのプロバイダのハッシュ値を追加する（プロバイダのバージョンは維持される）。
  - terraformのプロバイダをバージョンアップする場合は `terraform init -backend-config=config.azurerm.tfbackend -upgrade` を実行してlockfileを更新する。
- 実行前の確認が必要ない場合は `terraform apply -auto-approve` としてもよい。
- Keycloak プロバイダは **app** の出力する Keycloak URL（`https://keycloak.<ドメイン>`）に接続する。
- **app** で Let's Encrypt を **ステージング**にしている場合、プロバイダ側で証明書検証を緩和する設定が有効になる（本番証明書への切り替え後に再 apply することを推奨する）。
- Google IdP を使う場合は `keycloak-realm/terraform.tfvars` に `keycloak_google_client_id` / `keycloak_google_client_secret` 等を設定する（空なら IdP 作成をスキップする動きになる）。

### 9.2. Google Cloud（OAuth）とリダイレクト URI（Google認証を利用する場合のみ）

1. Google Cloud コンソールで OAuth クライアントを用意する（従来の「ウェブアプリケーション」手順と同様）。
2. Keycloak の **Google IdP 用リダイレクト URI** は、`terraform apply` 後に **keycloak-realm** の出力 `oidc_google_identity_provider_redirect_uri` を参照するか、Keycloak 管理コンソールの IdP 画面に表示される URI を Google Cloud の「承認済みのリダイレクト URI」に登録する。

## 10. 自治体管理者アカウントの準備

1. ブラウザから `https://keycloak.<設定したルートドメイン>` にアクセスし、keycloak の管理コンソールに接続する
2. `app_keycloak_admin` と `app_keycloak_admin_password` でログインする
3. `Manage realms` から `oasismap` を選択
4. 左のメニューバーから `Users` を選択
5. `Create new User` を押下
6. `Username`,`profile.attribute.nickname` に管理者アカウント名を入力して `Create` を選択
    ※ `Username` と `profile.attribute.nickname` は同じ値を入れてください
7. `Credentials` を選択して `Set password` を押下
8. `Password` と `Password confirmation` に同じパスワードを入力し、 `Temporary` をOFFにして `Save` を押下
9. `Save password` を押下して管理者アカウントのパスワードを保存
10. `Role mapping` を選択して `Asiign role` を押下
11. `Realm rols` を選択
12. `admin-role` にチェックを入れ、 `Assign` を押下

## 11. 動作確認

1. スマートフォンから `https://<設定したルートドメイン>` にアクセスし、oasismapが動作していることを確認する
    - 参加同意書が正しく修正されていることも併せて確認する
2. スマートフォンから `https://<設定したルートドメイン>/admin/login` にアクセスし、oasismapの管理者画面が動作していることを確認する

## 12. 環境の削除

### 12.1. keycloak-realmレイヤー

ディレクトリ: `infra/terraform/keycloak-realm`

実行例:

```sh
cd infra/terraform/keycloak-realm
terraform destroy
```

- 実行前の確認が必要ない場合は `terraform destroy -auto-approve` としてもよい。

### 12.2. appレイヤー

ディレクトリ: `infra/terraform/app`

実行例:

```sh
cd infra/terraform/app
terraform destroy
```

- 実行前の確認が必要ない場合は `terraform destroy -auto-approve` としてもよい。

### 12.3. platformレイヤー

ディレクトリ: `infra/terraform/platform`

実行例:

```sh
cd infra/terraform/platform
terraform destroy
```

- 実行前の確認が必要ない場合は `terraform destroy -auto-approve` としてもよい。

### 12.4. Terraform リモート state（Azure ストレージ）

ディレクトリ: `infra/terraform`

実行例:

```sh
# macOS / Linux 向け
cd infra/terraform
. ./env.sh
bash ./delete-storage-tfstate.sh
```

```sh
# Windows 向け
cd infra/terraform
. .\env.ps1
.\delete-storage-tfstate.ps1
```

以上
