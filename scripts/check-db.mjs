// Check that the real Supabase database (from .env) has everything the party
// screens need: the tables and functions from supabase/security.sql, and which
// players still have no PIN. The dry run can't tell you this: its stand-in
// database fakes these functions.
//
//   npm run check-db
//
// Changes nothing. Each function is called with input it rejects or ignores
// before writing: a made-up player ID, or a malformed PIN.
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.replace(/^(['"])(.*)\1$/, '$2')])
)
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env')
  process.exit(2)
}

const PARTY_GAME = '8a110000-2026-4000-8000-000000000001' // src/lib/event.ts
const NOBODY = '00000000-0000-0000-0000-000000000000'
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

async function call(path, body) {
  const res = await fetch(`${url}/rest/v1/${path}`, body === undefined
    ? { headers }
    : { method: 'POST', headers, body: JSON.stringify(body) })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: res.status, data }
}

// PostgREST's "no such table/function" codes; anything else means it exists
const missing = (r) => r.status === 404 && ['PGRST202', 'PGRST205', '42P01', '42883'].includes(r.data?.code)

// A table exists if it can be read, or if reading it is refused
const tableExists = (r) => r.status === 200 || r.data?.code === '42501'

const checks = [
  ['table players', () => call('players?select=id&limit=1'), tableExists],
  ['table high_scores', () => call('high_scores?select=id&limit=1'), tableExists],
  ['table admins', () => call('admins?select=user_id&limit=1'), tableExists],
  ['table player_secrets', () => call('player_secrets?select=player_id&limit=1'), tableExists],
  ['get_leaderboard()', () => call('rpc/get_leaderboard', { p_game_id: PARTY_GAME, p_limit: 1 }), (r) => r.status === 200],
  ['is_admin()', () => call('rpc/is_admin', {}), (r) => r.status === 200 && r.data === false],
  ['player_has_pin()', () => call('rpc/player_has_pin', { p_player_id: NOBODY }), (r) => r.status === 200 && r.data === false],
  ['update_player_profile()', () => call('rpc/update_player_profile', { p_player_id: NOBODY, p_pin: '0000' }),
    (r) => r.status === 200 && r.data?.error === 'no_pin'],
  // Rejected for the PIN before anything is inserted
  ['create_player()', () => call('rpc/create_player', { p_name: 'check-db', p_pin: 'not-a-pin' }),
    (r) => r.status === 400 && /PIN must be 4 digits/.test(r.data?.message ?? '')],
  // Refused: not signed in as the host
  ['set_player_pin()', () => call('rpc/set_player_pin', { p_player_id: NOBODY, p_pin: 'not-a-pin' }),
    (r) => !missing(r) && r.status >= 400],
]

console.log(`Checking ${new URL(url).host}\n`)
let failures = 0
for (const [name, run, ok] of checks) {
  let r
  try {
    r = await run()
  } catch (err) {
    console.log(`  ✗ ${name}: couldn't reach the database (${err.message})`)
    failures++
    continue
  }
  if (ok(r)) {
    console.log(`  ✓ ${name}`)
  } else {
    failures++
    // PostgREST's hint names a near match, e.g. a leftover function with other parameters
    const why = missing(r)
      ? `missing${r.data?.hint ? ` (${r.data.hint})` : ''}`
      : `unexpected reply ${r.status} ${JSON.stringify(r.data).slice(0, 160)}`
    console.log(`  ✗ ${name}: ${why}`)
  }
}

// Players who can't edit their own profile until the host sets a PIN in Manage
const players = await call('players?select=id,name&order=name')
if (players.status === 200 && Array.isArray(players.data)) {
  const noPin = []
  for (const p of players.data) {
    const r = await call('rpc/player_has_pin', { p_player_id: p.id })
    if (r.status !== 200) { noPin.length = 0; break }
    if (r.data === false) noPin.push(p.name)
  }
  console.log(`\n${players.data.length} players.` + (noPin.length
    ? ` No PIN yet (host sets one in Manage): ${noPin.join(', ')}`
    : ''))
}

if (failures) {
  console.log(`\n${failures} check(s) failed. If tables or functions are missing, run supabase/security.sql`)
  console.log('in the Supabase SQL Editor (see the steps at the top of that file).')
  process.exit(1)
}
console.log('\nThe database has everything the party screens need.')
