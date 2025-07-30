import path from 'path'

import { test, expect } from '@playwright/test'

const authFile = path.join(__dirname, '../playwright/.auth/user.json')

test('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'ログイン・新規登録' }).click()

  // Keycloak login page
  await page.getByLabel('Username or email').fill(process.env.KEYCLOAK_TEST_USER || 'testuser')
  await page.getByLabel('Password').fill(process.env.KEYCLOAK_TEST_PASSWORD || 'testpassword')
  await page.getByRole('button', { name: 'Sign In' }).click()

  await expect(page).toHaveURL('/happiness/me')

  // Save context(cookies) to use this session in other tests
  await page.context().storageState({ path: authFile })
})
