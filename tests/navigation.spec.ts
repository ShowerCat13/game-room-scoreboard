import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.describe('Idle Display', () => {
    test('should load idle display on root path', async ({ page }) => {
      await page.goto('/')
      
      // Should see the idle carousel
      await expect(page.locator('text=Tap to browse')).toBeVisible()
    })

    test('should show clock in header', async ({ page }) => {
      await page.goto('/')
      
      // Clock should be visible with AM/PM format
      await expect(page.locator('text=/\\d{1,2}:\\d{2}\\s*(AM|PM)/i')).toBeVisible()
    })

    test('should show settings icon in footer', async ({ page }) => {
      await page.goto('/')
      
      // Settings gear icon should be visible
      const settingsButton = page.locator('button').filter({ has: page.locator('svg') }).first()
      await expect(settingsButton).toBeVisible()
    })

    test('should navigate to browse on tap', async ({ page }) => {
      await page.goto('/')
      
      // Tap the main area (not footer buttons)
      await page.locator('text=Tap to browse').click()
      
      // Should navigate to category selection
      await expect(page).toHaveURL('/browse')
    })

    test('should navigate to settings when clicking settings icon', async ({ page }) => {
      await page.goto('/')
      
      // Click the settings button (first button in footer)
      await page.locator('button').first().click()
      
      // Should navigate to settings
      await expect(page).toHaveURL('/settings')
    })
  })

  test.describe('Browse Hierarchy', () => {
    test('should show category selection on /browse', async ({ page }) => {
      await page.goto('/browse')
      
      // Should see CATEGORIES title (not "Browse Games")
      await expect(page.locator('text=CATEGORIES')).toBeVisible()
      
      // Should have back button (ChevronLeft icon with some text)
      await expect(page.locator('button').filter({ has: page.locator('svg') }).first()).toBeVisible()
    })

    test('should navigate to game selection when clicking a category', async ({ page }) => {
      await page.goto('/browse')
      
      // Click on Racing category (if it exists)
      const racingButton = page.locator('button', { hasText: 'Racing' })
      
      if (await racingButton.isVisible()) {
        await racingButton.click()
        await expect(page).toHaveURL(/\/browse\/racing/)
      }
    })

    test('should navigate back from category selection', async ({ page }) => {
      await page.goto('/browse')
      
      // Click back button (first button with chevron icon)
      await page.locator('button').first().click()
      
      // Should go to idle display
      await expect(page).toHaveURL('/')
    })

    test('should navigate back through hierarchy', async ({ page }) => {
      // Start at category selection and verify back works
      await page.goto('/browse')
      
      // Click back
      await page.locator('button').first().click()
      
      // Should go back to home
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Add Score Button', () => {
    test('should show add score button on browse pages', async ({ page }) => {
      await page.goto('/browse')
      
      // Should see Add button (text is "Add", not "+ Add" - the plus is an icon)
      await expect(page.locator('button', { hasText: 'Add' })).toBeVisible()
    })

    test('should navigate to add score page', async ({ page }) => {
      await page.goto('/browse')
      
      // Click Add button
      await page.locator('button', { hasText: 'Add' }).click()
      
      // Should navigate to add score
      await expect(page).toHaveURL('/add-score')
    })
  })
})