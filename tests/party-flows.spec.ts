import { test, expect, type Page, type APIRequestContext } from '@playwright/test'

/**
 * Halloween 2026 party flows, against the stand-in database
 * (scripts/dry-run-supabase.mjs, started by playwright.config.ts).
 *
 * These check the app, not the real database: the stand-in fakes the
 * supabase/security.sql functions. `npm run check-db` checks the real one.
 */

const DB = 'http://127.0.0.1:53999/rest/v1'
const ADD_TIME = '/add-score?gameId=8a110000-2026-4000-8000-000000000001' +
  '&modeId=8a110000-2026-4000-8000-000000000002&detailId=8a110000-2026-4000-8000-000000000003&locked=1'
const PHONE = { width: 390, height: 844 }

// Unique per run: the stand-in keeps its data until the test servers stop
const unique = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 7)}`

async function createPlayer(request: APIRequestContext, name: string, pin: string | null) {
  const res = await request.post(`${DB}/rpc/create_player`, { data: { p_name: name, p_pin: pin } })
  expect(res.ok()).toBeTruthy()
  return (await res.json()) as { id: string; name: string }
}

async function hasPin(request: APIRequestContext, playerId: string) {
  const res = await request.post(`${DB}/rpc/player_has_pin`, { data: { p_player_id: playerId } })
  return (await res.json()) as boolean
}

async function pressPin(page: Page, pin: string) {
  for (const digit of pin) {
    await page.getByRole('button', { name: digit, exact: true }).click()
  }
}

const filledPinDots = (page: Page) => page.locator('text=•')

/** Kiosk home: Edit profile → pick the player → PIN keypad */
async function openEditProfile(page: Page, name: string) {
  await page.getByRole('button', { name: 'Edit profile' }).click()
  await page.getByRole('button', { name, exact: true }).click()
  await expect(page.getByText(`Edit ${name}`)).toBeVisible()
}

async function signInAsHost(page: Page) {
  await page.goto('/manage')
  await page.getByPlaceholder('Email').fill('host@example.com')
  await page.getByPlaceholder('Password').fill('test-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Manage' })).toBeVisible()
}

test.describe('guest on a phone', () => {
  test.use({ viewport: PHONE })

  test('creates a profile with a PIN and saves a time', async ({ page, request }) => {
    const name = unique('Ghoul')
    await page.goto(ADD_TIME)
    await page.getByText('Tap to pick or add your name').click()
    await page.getByText('+ New Player').click()
    await page.getByPlaceholder('Enter player name').fill(name)
    await page.getByLabel('Optional 4-digit PIN').fill('2468')
    await page.getByRole('button', { name: 'Create Player' }).click()

    await expect(page.getByRole('button', { name: 'Create Player' })).toBeHidden()
    await expect(page.getByText(name)).toBeVisible()

    await page.keyboard.type('159250') // 1:59.250 on the lap time pad
    await page.getByRole('button', { name: 'Save Time' }).click()
    await expect(page.getByText('Tap anywhere to continue')).toBeVisible()

    const players = await (await request.get(`${DB}/players?select=id,name&name=eq.${name}`)).json()
    expect(await hasPin(request, players[0].id)).toBe(true)
  })

  test("doesn't drop a PIN typed for a name that's taken", async ({ page, request }) => {
    const name = unique('Taken')
    await createPlayer(request, name, null)

    await page.goto(ADD_TIME)
    await page.getByText('Tap to pick or add your name').click()
    await page.getByText('+ New Player').click()
    await page.getByPlaceholder('Enter player name').fill(name.toLowerCase())
    await page.getByLabel('Optional 4-digit PIN').fill('1111')
    await page.getByRole('button', { name: 'Create Player' }).click()

    await expect(page.getByText(`${name} is already racing`)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Player' })).toBeVisible()
  })

  test('shows why a profile could not be created', async ({ page }) => {
    // What the live database did before supabase/security.sql was applied
    await page.route('**/rest/v1/rpc/create_player', (route) => route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'PGRST202', details: null, hint: null,
        message: 'Could not find the function public.create_player(p_avatar_url, p_name, p_pin) in the schema cache' }),
    }))

    await page.goto(ADD_TIME)
    await page.getByText('Tap to pick or add your name').click()
    await page.getByText('+ New Player').click()
    await page.getByPlaceholder('Enter player name').fill(unique('Nobody'))
    await page.getByRole('button', { name: 'Create Player' }).click()

    await expect(page.getByText("The scoreboard database isn't set up yet")).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Player' })).toBeVisible()
  })
})

test.describe('kiosk', () => {
  test('edits a profile that has no PIN without asking for one, and can lock it', async ({ page, request }) => {
    await page.goto('/')
    const name = unique('Open')
    const player = await createPlayer(request, name, null)

    // Straight into the editor: no keypad, no "ask the host"
    await page.getByRole('button', { name: 'Edit profile' }).click()
    await page.getByRole('button', { name, exact: true }).click()
    await expect(page.getByRole('button', { name: 'Save profile' })).toBeVisible()
    await expect(page.getByText("Enter this profile's 4-digit PIN")).toBeHidden()

    const renamed = unique('Fixed')
    await page.getByLabel('Player name').fill(renamed)
    await page.getByLabel('Optional 4-digit PIN').fill('4321')
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByRole('button', { name: 'Save profile' })).toBeHidden()

    const rows = await (await request.get(`${DB}/players?select=name&id=eq.${player.id}`)).json()
    expect(rows[0].name).toBe(renamed)
    expect(await hasPin(request, player.id)).toBe(true)

    // Now it's locked: the kiosk asks for the PIN it was given
    await openEditProfile(page, renamed)
    await pressPin(page, '4321')
    await expect(page.getByRole('button', { name: 'Save profile' })).toBeVisible()
    await expect(page.getByLabel('Optional 4-digit PIN')).toBeHidden()
  })

  test('lists a profile made on a phone and edits it with its PIN', async ({ page, request }) => {
    await page.goto('/') // the profile list loads here, before the phone signs up
    const name = unique('Phoney')
    const player = await createPlayer(request, name, '1357')

    await openEditProfile(page, name)
    await pressPin(page, '0000')
    await expect(page.getByText('Wrong PIN (4 tries left)')).toBeVisible()
    await pressPin(page, '1357')

    const renamed = unique('Renamed')
    await page.getByLabel('Player name').fill(renamed)
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByRole('button', { name: 'Save profile' })).toBeHidden()

    const rows = await (await request.get(`${DB}/players?select=name&id=eq.${player.id}`)).json()
    expect(rows[0].name).toBe(renamed)
  })

  test('keypad keeps working after the same error twice, and says what failed', async ({ page, request }) => {
    const name = unique('Offline')
    await createPlayer(request, name, '1234')
    await page.goto('/')
    await page.route('**/rest/v1/rpc/update_player_profile', (route) => route.abort('internetdisconnected'))

    await openEditProfile(page, name)
    for (let attempt = 0; attempt < 2; attempt++) {
      await pressPin(page, '1234')
      await expect(page.getByText("Couldn't reach the scoreboard. Check the Wi-Fi.")).toBeVisible()
      await expect(filledPinDots(page)).toHaveCount(0)
    }
    await pressPin(page, '1')
    await expect(filledPinDots(page)).toHaveCount(1)
  })

  test("says when the PIN check itself fails instead of asking for a PIN", async ({ page, request }) => {
    const name = unique('NoCheck')
    await createPlayer(request, name, null)
    await page.goto('/')
    await page.route('**/rest/v1/rpc/player_has_pin', (route) => route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'PGRST202', details: null, hint: null,
        message: 'Could not find the function public.player_has_pin(p_player_id) in the schema cache' }),
    }))

    await page.getByRole('button', { name: 'Edit profile' }).click()
    await page.getByRole('button', { name, exact: true }).click()
    await expect(page.getByText("The scoreboard database isn't set up yet")).toBeVisible()
    await expect(page.getByText('Enter this profile\'s 4-digit PIN')).toBeHidden()
  })
})

test.describe('host', () => {
  test('signs in and gives an existing player a PIN', async ({ page, request }) => {
    const name = unique('Host')
    const player = await createPlayer(request, name, null)

    await signInAsHost(page)
    await page.locator('.card', { hasText: name }).getByRole('button').first().click()
    await page.getByPlaceholder('New profile PIN (optional)').fill('8642')
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeHidden()

    expect(await hasPin(request, player.id)).toBe(true)
  })

  test("a save the database ignores is reported, not shown as done", async ({ page, request }) => {
    const name = unique('Ignored')
    await createPlayer(request, name, null)
    await signInAsHost(page)
    // What an expired or non-admin session gets: success, but no rows changed
    await page.route('**/rest/v1/players?*', (route) => route.request().method() === 'PATCH'
      ? route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      : route.fallback())

    await page.locator('.card', { hasText: name }).getByRole('button').first().click()
    await page.getByPlaceholder('Player name').fill(unique('Never'))
    await page.getByRole('button', { name: 'Save Changes' }).click()

    await expect(page.getByRole('alert')).toContainText('Nothing was saved')
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible()
  })

  test('a missing admin check is reported as such, not as "not an admin"', async ({ page }) => {
    await page.route('**/rest/v1/rpc/is_admin', (route) => route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'PGRST202', details: null, hint: null,
        message: 'Could not find the function public.is_admin without parameters in the schema cache' }),
    }))
    await page.goto('/manage')
    await page.getByPlaceholder('Email').fill('host@example.com')
    await page.getByPlaceholder('Password').fill('test-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText("The scoreboard database isn't set up yet")).toBeVisible()
    await expect(page.getByText("isn't an admin")).toBeHidden()
  })
})
