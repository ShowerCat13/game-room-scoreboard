import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration for Game Room Scoreboard
 * 
 * Run with: npm run test:e2e
 * UI mode: npm run test:e2e:ui
 */
export default defineConfig({
  testDir: './tests',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Limit parallel workers on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for the dev server
    baseURL: 'http://localhost:5173',
    
    // Collect trace on first retry
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'on-first-retry',
    
    // Viewport matching kiosk dimensions
    viewport: { width: 800, height: 480 },
  },

  // Test projects - chromium only for now
  projects: [
    {
      name: 'chromium-kiosk',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 800, height: 480 },
      },
    },
    // Mobile projects disabled until responsive CSS is implemented
    // Uncomment after ALPHA-006 is complete
    // {
    //   name: 'mobile-chrome',
    //   use: { 
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'mobile-safari',
    //   use: { 
    //     ...devices['iPhone 12'],
    //   },
    // },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})