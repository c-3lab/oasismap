This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## 単体テスト

### パッケージインストール

```bash
npm ci
```

### テスト実行

```bash
npm run test
```

### テスト実行（カバレッジ）

```bash
npm run test:cov
```

## e2eテスト実行方法

### e2eテスト内で、一般ユーザーのログインに利用するGoogleアカウントを設定する

- .envに以下を追記
- GOOGLE_MFA_SECRET_KEYの取得は、[こちらの記事](https://dev.classmethod.jp/articles/playwright-e2e-otp-mfa/)を参考。
- MFAを設定していないGoogleアカウントであれば、GOOGLE_MFA_SECRET_KEYを空にしておく

```
GOOGLE_MFA_SECRET_KEY=CHANGE_TO_MFA_SECRET_KEY   # MFAを設定していない場合は空にしておく
GOOGLE_EMAIL=CHANGE_TO_EMAIL_ADDRESS
GOOGLE_PASSWORD='CHANGE_TO_PASSWORD'  # 特殊記号がある場合はシングルクォートで囲む方が安全か
```

### 環境起動

```bash
docker compose -f docker-compose-dev.yml up -d
```

### パッケージインストール

frontendコンテナ内で実行

```bash
npm ci
```

### e2eテストに利用するブラウザ、OSパッケージインストール

frontendコンテナ内で実行

```bash
npm run test:e2e:prepare
```

### e2eテスト実行

frontendコンテナ内で実行

```bash
npm run test:e2e
```

## e2eテスト実装に対する懸念点

- e2eテストで使用するテスト用のGoogleアカウントを取得するべき
  - 自動認証や認証失敗が続くと怪しく思われる可能性があるため
- 実際のブラウザを起動してテストを行っているため、CIの時に問題となる可能性
  - Googleログインはheadlessブラウザでは不可だったため、非headlessブラウザを利用してGoogleログインを実施している。
