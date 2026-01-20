# E2E Testing with Playwright

This project uses Playwright for end-to-end testing of the Game Room Scoreboard.

## Setup

Install Playwright and browsers:

```bash
npm install -D @playwright/test
npx playwright install
```

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- tests/navigation.spec.ts

# Run tests in headed mode (see the browser)
npm run test:e2e -- --headed

# Run only chromium-kiosk tests
npm run test:e2e -- --project=chromium-kiosk
```

## Test Structure

```
tests/
├── navigation.spec.ts      # Idle display, browse hierarchy, routing
├── settings.spec.ts        # Settings page, themes, sound, PIN
├── score-submission.spec.ts # Add score flow
├── management.spec.ts      # Player/game/score CRUD
└── visual-accessibility.spec.ts # Touch targets, fonts, viewport
```

## Test Projects

| Project | Description |
|---------|-------------|
| `chromium-kiosk` | Chrome at 800x480 (Pi display) |
| `mobile-chrome` | Pixel 5 emulation |
| `mobile-safari` | iPhone 12 emulation |

## Writing Tests

### Page Objects (optional)

For complex test suites, consider creating page objects:

```typescript
// tests/pages/settings-page.ts
export class SettingsPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/settings')
  }
  
  async selectTheme(name: string) {
    await this.page.locator('button', { hasText: name }).click()
  }
}
```

### Selectors

Prefer these selector strategies:
1. Text content: `page.locator('text=Submit')`
2. Role: `page.locator('button', { hasText: 'Save' })`
3. Test IDs: `page.locator('[data-testid="player-select"]')`

Avoid:
- Complex CSS selectors
- XPath
- Class names that might change

### Waiting

Playwright auto-waits, but for animations:

```typescript
await page.waitForTimeout(300) // For CSS transitions
await page.waitForSelector('text=Loaded') // For content
```

## CI Integration

Tests run in CI with:

```bash
CI=true npm run test:e2e
```

This enables:
- Retries (2x)
- Single worker
- Stricter `test.only` detection

## Reports

After running tests:

```bash
npx playwright show-report
```

Reports are generated in `playwright-report/`.

## Debugging

```bash
# Debug mode with inspector
npm run test:e2e -- --debug

# Trace viewer for failed tests
npx playwright show-trace trace.zip
```

## Known Limitations

1. **Database state**: Tests assume seed data exists. For true isolation, add database fixtures.
2. **Realtime features**: Supabase realtime subscriptions are not mocked.
3. **Sound**: Audio playback cannot be verified in headless mode.