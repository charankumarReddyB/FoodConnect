import { test, expect } from '@playwright/test'

test.describe('Admin E2E Security & Management Tests', () => {
  test('Admin login with password, access Admin Dashboard, and verify registration is disabled', async ({ page }) => {
    await page.goto('/')

    // Wait for Splash screen and click Sign In
    const signInNavBtn = page.getByRole('button', { name: 'Sign In' }).first()
    await signInNavBtn.waitFor({ state: 'visible', timeout: 10000 })
    await signInNavBtn.click()

    // Select Administrator Role
    const adminCard = page.getByText('Administrator').first()
    await adminCard.waitFor({ state: 'visible', timeout: 5000 })
    await adminCard.click()

    // Auth Screen - Verify Registration tab is NOT shown for Admin
    await expect(page.getByRole('button', { name: /Register Account/i })).not.toBeVisible()
    await expect(page.getByText(/Administrator Authentication Requires Password Verification/i)).toBeVisible()

    // Fill Admin Email & Password
    await page.getByPlaceholder('Enter email address').fill('charankumarreddybantrothula@gmail.com')
    await page.getByPlaceholder('••••••••').fill('charan@123')
    await page.locator('button[type="submit"]').click()

    // Verify Admin Dashboard opens
    await expect(page.getByText(/FoodConnect Admin|System Overview/i).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Platform Analytics|Total Donations/i).first()).toBeVisible()
  })
})
