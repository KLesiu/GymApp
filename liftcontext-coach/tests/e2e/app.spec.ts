import { test, expect } from '@playwright/test'

test('coach can see the English login screen', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('LiftContext Coach')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})
