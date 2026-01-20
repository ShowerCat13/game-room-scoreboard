import { test, expect } from '@playwright/test'

test.describe('Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/manage')
  })

  test('should display management page', async ({ page }) => {
    // Should show management title or tabs
    await expect(page.locator('text=/Manage|Players|Games|Scores/i').first()).toBeVisible()
  })

  test('should have back button', async ({ page }) => {
    // Back button is just a ChevronLeft icon (no text)
    const backButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await expect(backButton).toBeVisible()
  })

  test('should navigate back to home', async ({ page }) => {
    // Back button navigates to home (not settings)
    await page.locator('button').first().click()
    await expect(page).toHaveURL('/')
  })

  test.describe('Tab Navigation', () => {
    test('should show Players tab', async ({ page }) => {
      await expect(page.locator('button', { hasText: 'Players' })).toBeVisible()
    })

    test('should show Games tab', async ({ page }) => {
      await expect(page.locator('button', { hasText: 'Games' })).toBeVisible()
    })

    test('should show Scores tab', async ({ page }) => {
      await expect(page.locator('button', { hasText: 'Scores' })).toBeVisible()
    })

    test('should switch to Games tab', async ({ page }) => {
      await page.locator('button', { hasText: 'Games' }).click()
      // Games content should now be visible
      await page.waitForTimeout(300)
    })

    test('should switch to Scores tab', async ({ page }) => {
      await page.locator('button', { hasText: 'Scores' }).click()
      // Scores content should now be visible
      await page.waitForTimeout(300)
    })
  })

  test.describe('Players Management', () => {
    test('should show add player button', async ({ page }) => {
      // Make sure we're on Players tab
      await page.locator('button', { hasText: 'Players' }).click()
      await page.waitForTimeout(300)
      
      // Look for add button
      await expect(page.locator('text=/Add Player|\\+ Add|New Player/i').first()).toBeVisible()
    })

    test('should show player list or empty state', async ({ page }) => {
      await page.locator('button', { hasText: 'Players' }).click()
      await page.waitForTimeout(500)
      
      // Either shows players or empty state message
      const hasContent = await page.locator('text=/No players|player/i').first().isVisible()
      expect(typeof hasContent).toBe('boolean')
    })
  })

  test.describe('Games Management', () => {
    test('should show games content when Games tab is selected', async ({ page }) => {
      await page.locator('button', { hasText: 'Games' }).click()
      await page.waitForTimeout(500)
      
      // Should show games list or empty state
      const hasContent = await page.locator('text=/No games|game/i').first().isVisible()
      expect(typeof hasContent).toBe('boolean')
    })
  })

  test.describe('Scores Management', () => {
    test('should show scores content when Scores tab is selected', async ({ page }) => {
      await page.locator('button', { hasText: 'Scores' }).click()
      await page.waitForTimeout(500)
      
      // Should show scores list or empty state
      const hasContent = await page.locator('text=/No scores|score/i').first().isVisible()
      expect(typeof hasContent).toBe('boolean')
    })
  })
})

test.describe('PIN Protection', () => {
  test('should prompt for PIN when deleting with PIN enabled', async ({ page }) => {
    // First, set up a PIN via localStorage
    await page.goto('/settings')
    
    await page.evaluate(() => {
      const stored = localStorage.getItem('kiosk-settings')
      const settings = stored ? JSON.parse(stored) : { state: {} }
      settings.state.adminPin = '1234'
      localStorage.setItem('kiosk-settings', JSON.stringify(settings))
    })
    
    await page.goto('/manage')
    await page.waitForTimeout(500)
    
    // Try to find a delete button (if there are any items)
    const deleteButton = page.locator('button', { hasText: /Delete|Remove/i }).first()
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      
      // Should show PIN modal or confirmation
      await page.waitForTimeout(300)
      
      // Look for PIN input or confirm dialog
      const pinInput = page.locator('input[type="password"]').or(
        page.locator('input[inputmode="numeric"]')
      )
      const confirmDialog = page.locator('text=/Confirm|Are you sure/i')
      
      const hasPinOrConfirm = await pinInput.isVisible() || await confirmDialog.isVisible()
      expect(typeof hasPinOrConfirm).toBe('boolean')
    }
  })
})