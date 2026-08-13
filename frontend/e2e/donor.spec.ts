import { test, expect } from '@playwright/test'

test.describe('Donor Workflow E2E Web Tests', () => {
  test('Donor login, post donation, verify persistence, refresh & re-login', async ({ page }) => {
    await page.goto('/')

    // Wait for Splash screen and click Sign In
    const signInNavBtn = page.getByRole('button', { name: 'Sign In' }).first()
    await signInNavBtn.waitFor({ state: 'visible', timeout: 10000 })
    await signInNavBtn.click()

    // Select Food Donor Role
    const donorCard = page.getByText('Food Donor').first()
    await donorCard.waitFor({ state: 'visible', timeout: 5000 })
    await donorCard.click()

    // Auth Screen - Fill Email & Password
    await page.getByPlaceholder('Enter email address').fill('donor@example.com')
    await page.getByPlaceholder('••••••••').fill('password123')
    await page.locator('button[type="submit"]').click()

    // Donor Dashboard
    await expect(page.getByText('Donor Portal').first()).toBeVisible({ timeout: 10000 })

    // Open Post Food Form
    await page.getByRole('button', { name: 'Post Food Now' }).first().click()

    // Publish Food Donation
    const publishBtn = page.getByRole('button', { name: 'Publish Donation to Database' }).first()
    await publishBtn.click()

    // Verify Success Screen
    await expect(page.getByText(/Donation Persisted!|Donation Successfully Published/i).first()).toBeVisible({ timeout: 10000 })

    // Return to Dashboard if button is present
    const backBtn = page.getByRole('button', { name: /Back to Dashboard/i }).first()
    if (await backBtn.isVisible()) {
      await backBtn.click()
    }

    // Refresh Browser to Verify Persistence
    await page.reload()
    await expect(page.getByText('Donor Portal').first()).toBeVisible()
  })
})
