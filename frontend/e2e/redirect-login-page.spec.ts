import { test, expect } from '@playwright/test'

test('should navigate to the login page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')
})

test('should display main page after login without login process', async ({
  page,
}) => {
  await page.goto('/happiness/me')
  await expect(page).toHaveURL('/happiness/me')
})
