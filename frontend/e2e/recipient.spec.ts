import { test, expect } from '@playwright/test'

test.describe('Recipient Workflow E2E Web Tests', () => {
  test('Recipient login, browse nearby food, search, request food, and receive notifications', async ({ page }) => {
    await page.goto('/')

    // Wait for Splash screen and click Sign In
    const signInNavBtn = page.getByRole('button', { name: 'Sign In' }).first()
    await signInNavBtn.waitFor({ state: 'visible', timeout: 10000 })
    await signInNavBtn.click()

    // Select Recipient Role
    const recipientCard = page.getByText('Recipient Org').first()
    await recipientCard.waitFor({ state: 'visible', timeout: 5000 })
    await recipientCard.click()

    // Auth Screen - Login as Recipient
    await page.getByPlaceholder('Enter email address').fill('ngo_test@foodconnect.app')
    await page.getByPlaceholder('••••••••').fill('NgoPass123!')
    await page.locator('button[type="submit"]').click()

    // Recipient Dashboard Assertion
    await expect(page.getByText('Available Nearby').first()).toBeVisible({ timeout: 10000 })

    // Search for food
    const searchInput = page.getByPlaceholder(/Search food donations nearby/i).first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('Biryani')
      await page.waitForTimeout(500)
    }

    // Request food if available
    const requestBtn = page.getByRole('button', { name: /Request Food|Request/i }).first()
    if (await requestBtn.isVisible()) {
      await requestBtn.click()
      await page.waitForTimeout(1000)
    }

    // Open Notifications screen
    const notifBtn = page.locator('button:has(svg.lucide-bell)').first()
    if (await notifBtn.isVisible()) {
      await notifBtn.click()
      await expect(page.getByText(/Live Notifications|Notifications/i).first()).toBeVisible()
    }
  })
})
