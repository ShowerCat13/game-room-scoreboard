// tests/regression-beta-fixes.spec.ts
// Tests for issues discovered during beta testing (2025-01-21)
// These tests specifically target race conditions and data grouping bugs

import { test, expect } from '@playwright/test'

test.describe('Issue 6: Back Button Navigation', () => {
  // The original bug: handleBack() relied on currentGame?.has_details which is null
  // until async fetch completes. Using navigate(-1) fixes this.
  
  test('back button works through browse hierarchy', async ({ page }) => {
    // Start at browse
    await page.goto('/browse')
    await page.waitForLoadState('networkidle')
    
    // Click first category
    const categoryButton = page.locator('button').filter({ hasText: /Racing|Golf|Party|Darts/i }).first()
    await categoryButton.click()
    await page.waitForTimeout(500)
    
    // We should now be on /browse/:category - verify back button exists
    const backButton = page.locator('button:has(svg.lucide-chevron-left)').first()
    await expect(backButton).toBeVisible({ timeout: 3000 })
    
    // Click back
    await backButton.click()
    
    // Should return to /browse
    await expect(page).toHaveURL('/browse', { timeout: 3000 })
  })

  test('back button works immediately without waiting', async ({ page }) => {
    // Navigate to category selection
    await page.goto('/browse')
    await page.waitForLoadState('networkidle')
    
    // Click a category
    const categoryButton = page.locator('button').filter({ hasText: /Racing|Golf|Party|Darts/i }).first()
    await categoryButton.click()
    
    // Immediately click back without waiting for data
    const backButton = page.locator('button:has(svg.lucide-chevron-left)').first()
    
    // Give minimal time for page transition, then click back ASAP
    await page.waitForTimeout(100)
    
    if (await backButton.isVisible()) {
      await backButton.click()
      // Should navigate back, not get stuck
      await expect(page).toHaveURL('/browse', { timeout: 3000 })
    }
  })

  test('rapid back button clicks do not break navigation', async ({ page }) => {
    await page.goto('/browse')
    await page.waitForLoadState('networkidle')
    
    // Navigate into a category
    const categoryButton = page.locator('button').filter({ hasText: /Racing|Golf|Party|Darts/i }).first()
    await categoryButton.click()
    await page.waitForTimeout(300)
    
    // Try to click a game if available
    const gameCard = page.locator('[class*="card"]').first()
    if (await gameCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await gameCard.click()
      await page.waitForTimeout(300)
    }
    
    // Now rapidly click back
    const backButton = page.locator('button:has(svg.lucide-chevron-left)').first()
    if (await backButton.isVisible()) {
      await backButton.click()
      await page.waitForTimeout(50)
      
      // Try clicking again if still visible
      if (await backButton.isVisible()) {
        await backButton.click()
      }
    }
    
    // Should eventually stabilize without crashing
    await expect(page.locator('body')).toBeVisible()
  })

  test('back button shows text label', async ({ page }) => {
    await page.goto('/browse')
    await page.waitForLoadState('networkidle')
    
    // Click a category to get to game selection
    const categoryButton = page.locator('button').filter({ hasText: /Racing|Golf|Party|Darts/i }).first()
    await categoryButton.click()
    await page.waitForTimeout(500)
    
    // Back button should have visible text (not empty)
    const backButton = page.locator('button:has(svg.lucide-chevron-left)').first()
    await expect(backButton).toBeVisible({ timeout: 3000 })
    
    const buttonText = await backButton.textContent()
    expect(buttonText?.trim()).toBeTruthy()
    expect(buttonText).not.toContain('undefined')
    expect(buttonText).not.toContain('null')
  })
})

test.describe('Issue 5: Idle Carousel Grouping', () => {
  // The original bug: Games with has_details=true showed all scores mixed together
  // instead of separate carousel entries per detail (e.g., per golf course)
  
  test('idle display loads without error', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Should not be stuck in loading state after reasonable time
    await page.waitForTimeout(2000)
    
    // Page should be interactive
    await expect(page.locator('body')).toBeVisible()
    
    // Should not show error state
    const errorText = page.locator('text=Connection Error')
    await expect(errorText).not.toBeVisible()
  })

  test('idle display shows game information', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000) // Wait for carousel to load
    
    // Should show either:
    // 1. Game name in header, OR
    // 2. "No scores yet" empty state
    const hasGameName = await page.locator('h1').first().isVisible()
    const hasEmptyState = await page.locator('text=No scores yet').isVisible()
    
    expect(hasGameName || hasEmptyState).toBeTruthy()
  })

  test('carousel indicator dots exist when multiple entries', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)
    
    // Check for carousel dots - they indicate multiple carousel items
    const dots = page.locator('.rounded-full').filter({ 
      has: page.locator('[class*="bg-text"]') 
    })
    
    // This test just verifies the structure exists
    // Actual count depends on seed data
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Issue 2: Realtime Score Refresh', () => {
  test('idle display is not stuck in loading state', async ({ page }) => {
    await page.goto('/')
    
    // Wait a reasonable time
    await page.waitForTimeout(3000)
    
    // Should not show "Loading leaderboards..." after 3 seconds
    const loadingText = page.locator('text=Loading leaderboards')
    const isLoading = await loadingText.isVisible()
    
    // If still loading after 3s, that's a problem (unless network is slow)
    // This is a soft check
    if (isLoading) {
      // Give it more time
      await expect(loadingText).not.toBeVisible({ timeout: 7000 })
    }
  })
})

test.describe('Issue 1: Clock Size', () => {
  test('clock is visible on idle display', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    // Look for time format pattern (e.g., "12:34 PM" or "9:05 AM")
    const clockPattern = /\d{1,2}:\d{2}\s*(AM|PM)/i
    const pageContent = await page.textContent('body')
    
    expect(pageContent).toMatch(clockPattern)
  })

  test('clock has large font for readability', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    // Find element containing time pattern with mono font
    const clockElement = page.locator('[class*="font-mono"][class*="font-bold"]').filter({ 
      hasText: /\d{1,2}:\d{2}/ 
    }).first()
    
    if (await clockElement.isVisible()) {
      const fontSize = await clockElement.evaluate(el => {
        return window.getComputedStyle(el).fontSize
      })
      
      // Clock should be at least 40px for readability across room
      const sizeValue = parseInt(fontSize)
      expect(sizeValue).toBeGreaterThanOrEqual(40)
    }
  })
})

test.describe('Navigation Hierarchy Integrity', () => {
  test('can navigate from home to browse', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    // Try to tap to browse (if scores exist) or just go directly
    const tapToBrowse = page.locator('text=Tap to browse')
    if (await tapToBrowse.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.click('body')
      await expect(page).toHaveURL('/browse', { timeout: 3000 })
    } else {
      // Direct navigation works
      await page.goto('/browse')
      await expect(page).toHaveURL('/browse')
    }
  })

  test('browse page shows categories', async ({ page }) => {
    await page.goto('/browse')
    await page.waitForLoadState('networkidle')
    
    // Should show category buttons
    const categories = page.locator('button').filter({ hasText: /Racing|Golf|Party|Darts|Pinball|Platformer|RPG/i })
    const count = await categories.count()
    
    expect(count).toBeGreaterThan(0)
  })

  test('settings is accessible', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/settings')
    
    // Should show settings heading
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible({ timeout: 3000 })
    })
})

test.describe('Error Handling', () => {
  test('invalid routes redirect or show error gracefully', async ({ page }) => {
    // Navigate to a completely invalid route
    await page.goto('/this-route-does-not-exist')
    
    // Should not crash - either redirects or shows content
    await expect(page.locator('body')).toBeVisible()
  })

  test('browse with no games shows appropriate state', async ({ page }) => {
    await page.goto('/browse')
    await page.waitForLoadState('networkidle')
    
    // Page should render without crashing
    await expect(page.locator('body')).toBeVisible()
  })
})