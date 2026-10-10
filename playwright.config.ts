import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration for Game Room Scoreboard
 * 
 * Run with: npm run test:e2e
 * UI mode: npm run test:e2e:ui
 *
 * The tests create and delete players and scores, so they run against the
 * in-memory stand-in database (scripts/dry-run-supabase.mjs), never the real
 * one in .env. Both servers start fresh on their own ports; if a port is
 * taken the run stops rather than reusing a server that may point at Supabase.
 */
const DB_PORT = 53999 // outside the ranges Windows reserves (54360-54459 on the dev PC)
const APP_PORT = 5174 // not 5173, so a running `npm run dev` is never reused

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
    // Base URL for the test app server (pointed at the stand-in database)
    baseURL: `http://localhost:${APP_PORT}`,
    
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

  // Stand-in database, then the app built against it (env beats .env in Vite)
  webServer: [
    {
      command: 'node scripts/dry-run-supabase.mjs',
      url: `http://127.0.0.1:${DB_PORT}/rest/v1/games`,
      env: { DRY_RUN_DB_PORT: String(DB_PORT) },
      reuseExistingServer: false,
      timeout: 30 * 1000,
    },
    {
      command: `npx vite --port ${APP_PORT} --strictPort`,
      url: `http://localhost:${APP_PORT}`,
      env: {
        VITE_SUPABASE_URL: `http://127.0.0.1:${DB_PORT}`,
        VITE_SUPABASE_ANON_KEY: 'dry-run',
        VITE_HAUNT_HUB: '', // never join the real haunt-net hub from a test
      },
      reuseExistingServer: false,
      timeout: 120 * 1000,
    },
  ],
})