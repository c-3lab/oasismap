import path from 'path'

import { test, expect } from '@playwright/test'
import { TOTP } from 'totp-generator'

const authFile = path.join(__dirname, '../playwright/.auth/user.json')

test('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Google' }).click()

  //  freeplan ngrok
  await page.getByRole('button', { name: 'Visit Site' }).click()

  //  Google login
  await page.getByLabel('Email or phone').fill(process.env.GOOGLE_EMAIL!)
  await page.getByRole('button', { name: 'Next' }).click()

  await page
    .getByLabel('Enter your password')
    .fill(process.env.GOOGLE_PASSWORD!)
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByRole('button', { name: 'Try another way' }).click()
  await page.locator('//strong[text()="Google Authenticator"]').click()

  //  参考: https://dev.classmethod.jp/articles/playwright-e2e-otp-mfa/
  //  直近では個人アカウントを利用したが、自動処理や認証失敗が続くと怪しく思われそうなので
  //  テスト用アカウントを用意した方がよさそう
  //  ホストマシンで起動するため、docker-compose.ymlを参考に以下の環境変数を設定してからnpm run test:e2eした
  // export NEXTAUTH_URL=http://localhost:3000
  // export NEXTAUTH_SECRET=9a41c0b2-e86b-425b-bd3d-5fb39ae71d79
  // export NEXT_PUBLIC_MAP_DEFAULT_LATITUDE=35.967169
  // export NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE=139.394617
  // export NEXT_PUBLIC_MAP_DEFAULT_ZOOM=13
  // export NEXT_PUBLIC_DEFAULT_ZOOM_FOR_COLLECTION_RANGE=20
  // export NEXT_PUBLIC_DATASET_LIST_BY=menu
  // export NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
  // export GENERAL_USER_KEYCLOAK_CLIENT_ID=general-user-client
  // export GENERAL_USER_KEYCLOAK_CLIENT_SECRET=YlfeOrjKScVL1Q5mtAh8PXdjPsYXmpih
  // export ADMIN_KEYCLOAK_CLIENT_ID=admin-client
  // export ADMIN_KEYCLOAK_CLIENT_SECRET=CbxW8LoTk1CNyqnpo2oCnABrXpemxzJl
  // export KEYCLOAK_CLIENT_ISSUER=https://dba8-240d-1a-9fc-2000-a48c-e0b0-dc23-d4a1.ngrok-free.app/realms/oasismap
  // export GOOGLE_MFA_SECRET_KEY=参考サイトより長くてKOCPで始まるやつだった
  // export GOOGLE_EMAIL=
  // export GOOGLE_PASSWORD=''  特殊記号がある場合はシングルクォートで囲む
  const { otp } = TOTP.generate(process.env.GOOGLE_MFA_SECRET_KEY!)
  await page.getByLabel('Enter code').fill(otp)
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page).toHaveURL('/happiness/me')

  //  Save context(cookies) to use this session in other tests
  await page.context().storageState({ path: authFile })
})
