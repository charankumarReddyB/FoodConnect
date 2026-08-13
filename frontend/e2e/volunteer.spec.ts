import { test, expect } from '@playwright/test'

test.describe('Volunteer Delivery Operations E2E Web Tests', () => {
  test('Volunteer login, claim delivery, view contact cards, mark picked up, and complete delivery', async ({ page }) => {
    await page.goto('/')

    // Wait for Splash screen and click Sign In
    const signInNavBtn = page.getByRole('button', { name: 'Sign In' }).first()
    await signInNavBtn.waitFor({ state: 'visible', timeout: 10000 })
    await signInNavBtn.click()

    // Select Volunteer Role
    const volunteerCard = page.getByText('Volunteer').first()
    await volunteerCard.waitFor({ state: 'visible', timeout: 5000 })
    await volunteerCard.click()

    // Auth Screen - Login as Volunteer
    await page.getByPlaceholder('Enter email address').fill('volunteer_test@foodconnect.app')
    await page.getByPlaceholder('••••••••').fill('VolPass123!')
    await page.locator('button[type="submit"]').click()

    // Volunteer Dashboard Operations
    await expect(page.getByText('Delivery Operations').first()).toBeVisible({ timeout: 10000 })

    // Check tabs
    const availableTab = page.getByRole('button', { name: /Available Jobs/i }).first()
    await availableTab.click()

    // Accept task if available
    const acceptBtn = page.getByRole('button', { name: /Accept Delivery Task/i }).first()
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click()
      await expect(page.getByText(/Successfully accepted delivery task|My Accepted Deliveries/i).first()).toBeVisible()
    }

    // Switch to Active Deliveries tab
    const activeTab = page.getByRole('button', { name: /My Active & Accepted/i }).first()
    await activeTab.click()

    // Verify contact cards & buttons if active tasks exist
    const markPickedUpBtn = page.getByRole('button', { name: /Mark Picked Up from Donor/i }).first()
    if (await markPickedUpBtn.isVisible()) {
      await expect(page.getByText(/Donor Pickup Details/i).first()).toBeVisible()
      await expect(page.getByText(/Recipient Dropoff Details/i).first()).toBeVisible()

      // Click Mark Picked Up
      await markPickedUpBtn.click()
      await page.waitForTimeout(500)
    }

    // Click Complete Delivery to Recipient
    const completeBtn = page.getByRole('button', { name: /Complete Delivery to Recipient/i }).first()
    if (await completeBtn.isVisible()) {
      await completeBtn.click()
      await page.waitForTimeout(500)
    }

    // Switch to Completed tab
    const completedTab = page.getByRole('button', { name: /Completed/i }).first()
    await completedTab.click()
    await expect(page.getByText(/Completed Deliveries/i).first()).toBeVisible()
  })
})
