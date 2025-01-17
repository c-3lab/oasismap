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
  const { otp } = TOTP.generate(process.env.GOOGLE_MFA_SECRET_KEY!)
  await page.getByLabel('Enter code').fill(otp)
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page).toHaveURL('/happiness/me')

  //  Save context(cookies) to use this session in other tests
  await page.context().storageState({ path: authFile })
})
