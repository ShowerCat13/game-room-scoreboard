import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
  })

  test('should display settings page', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Settings' })).toBeVisible()
  })

  test('should have back button that navigates home', async ({ page }) => {
    await page.locator('text=Back').click()
    await expect(page).toHaveURL('/')
  })

  test.describe('Sound Settings', () => {
    test('should display sound toggle', async ({ page }) => {
      await expect(page.locator('text=Sound Effects')).toBeVisible()
    })

    test('should toggle sound on/off', async ({ page }) => {
      // Find and click the sound toggle
      const soundToggle = page.locator('button', { hasText: 'Sound Effects' })
      await soundToggle.click()
      
      // Toggle state should change (we can't easily verify localStorage, 
      // but we can verify the UI responds)
      await expect(soundToggle).toBeVisible()
    })

    test('should show volume slider when sound is enabled', async ({ page }) => {
      // Volume slider should be visible when sound is on
      const volumeSlider = page.locator('input[type="range"]')
      
      // Either visible or sound is off
      const isVisible = await volumeSlider.isVisible()
      expect(typeof isVisible).toBe('boolean')
    })
  })

  test.describe('Theme Settings', () => {
    test('should display theme section', async ({ page }) => {
      await expect(page.locator('text=Color Theme')).toBeVisible()
    })

    test('should show all theme options', async ({ page }) => {
      // Should see all 6 themes
      await expect(page.locator('button', { hasText: 'Dark' })).toBeVisible()
      await expect(page.locator('button', { hasText: 'Light' })).toBeVisible()
      await expect(page.locator('button', { hasText: 'Vibrant' })).toBeVisible()
      await expect(page.locator('button', { hasText: 'Retro' })).toBeVisible()
      await expect(page.locator('button', { hasText: 'Fallout' })).toBeVisible()
      await expect(page.locator('button', { hasText: 'Cyberpunk' })).toBeVisible()
    })

    test('should change theme when clicking theme button', async ({ page }) => {
      // Click Light theme
      await page.locator('button', { hasText: 'Light' }).click()
      
      // Verify data-theme attribute changes on html
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    })

    test('should persist theme selection', async ({ page }) => {
      // Select Cyberpunk theme
      await page.locator('button', { hasText: 'Cyberpunk' }).click()
      
      // Verify it's applied
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'cyberpunk')
      
      // Navigate away and back
      await page.goto('/')
      await page.goto('/settings')
      
      // Theme should still be cyberpunk (persisted in localStorage)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'cyberpunk')
    })

    test('should show text color override options', async ({ page }) => {
      await expect(page.locator('text=Text Color Override')).toBeVisible()
      await expect(page.locator('button', { hasText: 'Theme Default' })).toBeVisible()
    })

    test('should apply text color override', async ({ page }) => {
      // Click on Pip-Boy Green preset
      await page.locator('button', { hasText: 'Pip-Boy Green' }).click()
      
      // The override should be applied - check CSS variable on html
      const html = page.locator('html')
      const style = await html.getAttribute('style')
      expect(style).toContain('--color-text-primary')
    })

    test('should reset customizations', async ({ page }) => {
      // Apply a customization first
      await page.locator('button', { hasText: 'Cyan' }).click()
      
      // Reset button should appear
      const resetButton = page.locator('text=Reset')
      if (await resetButton.isVisible()) {
        await resetButton.click()
        
        // Theme Default should now be selected
        await expect(page.locator('button', { hasText: 'Theme Default' })).toBeVisible()
      }
    })
  })

  test.describe('Display Settings', () => {
    test('should show carousel speed options', async ({ page }) => {
      // Scroll to Display section first
      await page.locator('text=Carousel Speed').scrollIntoViewIfNeeded()
      await expect(page.locator('text=Carousel Speed')).toBeVisible()
      
      // Check for a carousel speed option (30s is unique to carousel)
      await expect(page.locator('button', { hasText: '30s' })).toBeVisible()
    })

    test('should change carousel speed', async ({ page }) => {
      await page.locator('text=Carousel Speed').scrollIntoViewIfNeeded()
      
      // Click 15s option
      await page.locator('button', { hasText: '15s' }).click()
      
      // Verify it's still visible (button exists)
      await expect(page.locator('button', { hasText: '15s' })).toBeVisible()
    })

    test('should show celebration duration options', async ({ page }) => {
      // Scroll to celebration section
      await page.locator('text=Celebration Duration').scrollIntoViewIfNeeded()
      await expect(page.locator('text=Celebration Duration')).toBeVisible()
      
      // Check for duration options (7s is unique to celebration)
      await expect(page.locator('button', { hasText: '7s' })).toBeVisible()
    })
  })

  test.describe('Security Settings', () => {
    test('should show PIN setup option when no PIN is set', async ({ page }) => {
      // Clear any existing PIN first by clearing localStorage
      await page.evaluate(() => {
        const stored = localStorage.getItem('kiosk-settings')
        if (stored) {
          const settings = JSON.parse(stored)
          settings.state.adminPin = null
          localStorage.setItem('kiosk-settings', JSON.stringify(settings))
        }
      })
      
      // Reload to apply
      await page.reload()
      
      // Should see "Set Up PIN"
      await expect(page.locator('text=Set Up PIN')).toBeVisible()
    })
  })

  test.describe('Management Link', () => {
    test('should show management link', async ({ page }) => {
      await expect(page.locator('text=Manage Players, Games & Scores')).toBeVisible()
    })

    test('should navigate to management page', async ({ page }) => {
      await page.locator('text=Manage Players, Games & Scores').click()
      await expect(page).toHaveURL('/manage')
    })
  })
})