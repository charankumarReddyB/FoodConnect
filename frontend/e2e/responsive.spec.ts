import { test, expect } from '@playwright/test'

const viewports = [
  { width: 320, height: 568, name: 'Small Mobile (320px)' },
  { width: 360, height: 640, name: 'Android Compact (360px)' },
  { width: 375, height: 667, name: 'iPhone SE/Standard (375px)' },
  { width: 390, height: 844, name: 'iPhone 12/13/14 (390px)' },
  { width: 412, height: 915, name: 'Pixel / Samsung Galaxy (412px)' },
  { width: 430, height: 932, name: 'iPhone 14/15 Pro Max (430px)' },
  { width: 1280, height: 800, name: 'Desktop Web (1280px)' },
]

test.describe('FoodConnect Web App Mobile Responsive Viewport Audit', () => {
  for (const vp of viewports) {
    test(`Landing Page & Auth Flow at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')
      await page.waitForTimeout(2000)

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)

      await expect(page.locator('h1').first()).toBeVisible()
    })

    test(`Donor Portal Dashboard Responsiveness at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.addInitScript(() => {
        localStorage.setItem('foodconnect_token', 'e2e_jwt_token')
        localStorage.setItem(
          'foodconnect_user',
          JSON.stringify({
            id: 'donor_e2e_user',
            fullName: 'Donor QA User',
            email: 'donor@foodconnect.org',
            role: 'DONOR',
            phone: '+919652233592',
            address: 'Bangalore, India',
          })
        )
      })

      await page.goto('/')
      await page.waitForTimeout(2000)

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)

      await expect(page.getByText(/Overview|Donor Portal/i).first()).toBeVisible()

      if (vp.width < 1024) {
        const bottomNav = page.locator('nav.fixed.bottom-0')
        await expect(bottomNav).toBeVisible()
      }
    })

    test(`Recipient Portal Dashboard Responsiveness at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.addInitScript(() => {
        localStorage.setItem('foodconnect_token', 'e2e_jwt_token')
        localStorage.setItem(
          'foodconnect_user',
          JSON.stringify({
            id: 'recipient_e2e_user',
            fullName: 'Hope Shelter NGO',
            email: 'shelter@foodconnect.org',
            role: 'SHELTER',
            phone: '+919876543210',
            address: 'Indiranagar, Bangalore',
          })
        )
      })

      await page.goto('/')
      await page.waitForTimeout(2000)

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)

      await expect(page.locator('main').getByText(/Good afternoon|Available Nearby|Active Requests/i).first()).toBeVisible()
    })

    test(`Volunteer Portal Dashboard Responsiveness at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.addInitScript(() => {
        localStorage.setItem('foodconnect_token', 'e2e_jwt_token')
        localStorage.setItem(
          'foodconnect_user',
          JSON.stringify({
            id: 'volunteer_e2e_user',
            fullName: 'Volunteer Hero',
            email: 'volunteer@foodconnect.org',
            role: 'VOLUNTEER',
            phone: '+919123456789',
            address: 'Koramangala, Bangalore',
          })
        )
      })

      await page.goto('/')
      await page.waitForTimeout(2000)

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)

      await expect(page.getByText(/Available Jobs|Available Nearby Tasks/i).first()).toBeVisible()
    })

    test(`Admin Console Responsiveness at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.addInitScript(() => {
        localStorage.setItem('foodconnect_token', 'e2e_jwt_token')
        localStorage.setItem(
          'foodconnect_user',
          JSON.stringify({
            id: 'admin_e2e_user',
            fullName: 'Charan Kumar Reddy',
            email: 'charankumarreddybantrothula@gmail.com',
            role: 'ADMIN',
            phone: '+919652233592',
            address: 'Bangalore, Karnataka',
          })
        )
      })

      await page.goto('/')
      await page.waitForTimeout(2000)

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)

      await expect(page.getByText(/Admin Console|FoodConnect Admin/i).first()).toBeVisible()
    })
  }
})
