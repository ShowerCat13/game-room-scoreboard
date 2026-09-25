// Dry-run stand-in for Supabase (in-memory PostgREST subset). Used by scripts/dry-run.mjs.
// Mirrors supabase/security.sql closely enough for UI testing; not a security test.
import http from 'node:http'
import { randomUUID } from 'node:crypto'

const G = '8a110000-2026-4000-8000-000000000001'
const M = '8a110000-2026-4000-8000-000000000002'
const D = '8a110000-2026-4000-8000-000000000003'
const now = () => new Date().toISOString()

const db = {
  games: [{ id: G, name: 'Mario Kart World', category: 'racing', platform: 'Switch 2', icon_url: null,
    mode_label: 'Mode', detail_label: 'Track', has_modes: true, has_details: true,
    default_score_format: 'time_ms', default_score_direction: 'lower_better', default_score_unit: null,
    sort_order: 9, is_active: true }],
  game_modes: [{ id: M, game_id: G, name: '150cc Time Trial', score_format: 'time_ms',
    score_direction: 'lower_better', score_unit: null, detail_label_override: null, sort_order: 1, is_active: true }],
  game_details: [{ id: D, game_id: G, mode_id: M, name: 'Boo Cinema', score_format: null,
    score_direction: null, score_unit: null, sort_order: 1, is_active: true }],
  players: [],
  high_scores: [],
}
// Mirrors supabase/security.sql: PINs live apart from players; admin via token
const secrets = new Map() // player_id -> { pin, failed, lockedUntil }
const ADMIN_TOKEN = 'mock-admin-token'
const isAdmin = (req) => (req.headers.authorization || '') === `Bearer ${ADMIN_TOKEN}`
const cleanName = (n) => { const v = String(n ?? '').trim(); if (v.length < 1 || v.length > 30) throw new Error('Name must be 1-30 characters'); return v }
const guestAvatar = (a) => { if (a != null && !/^spookicon:[a-z]{1,20}$/.test(a)) throw new Error('Invalid avatar'); return a ?? null }

// Seed racers (optionally): SEED=0 for an empty board
if (process.env.SEED !== '0') {
  const seed = [['Morticia', 128432], ['Pugsley', 131905], ['Wednesday', 126118], ['Gomez', 135770],
    ['Lurch', 140012], ['Fester', 133301], ['Wednesday', 129550]]
  for (const [name, score] of seed) {
    let p = db.players.find((x) => x.name === name)
    if (!p) { p = { id: randomUUID(), name, avatar_url: null, created_at: now(), updated_at: now() }; db.players.push(p) }
    db.high_scores.push({ id: randomUUID(), player_id: p.id, game_id: G, mode_id: M, detail_id: D,
      score, metadata: {}, achieved_at: now(), created_at: now() })
  }
}

function settings(gid, mid, did) {
  const g = db.games.find((x) => x.id === gid) || {}
  const m = db.game_modes.find((x) => x.id === mid) || {}
  const d = db.game_details.find((x) => x.id === did) || {}
  return {
    score_format: d.score_format || m.score_format || g.default_score_format || 'integer',
    score_direction: d.score_direction || m.score_direction || g.default_score_direction || 'higher_better',
    score_unit: d.score_unit || m.score_unit || g.default_score_unit || null,
  }
}

function leaderboard({ p_game_id, p_mode_id, p_detail_id, p_limit = 10 }) {
  const s = settings(p_game_id, p_mode_id, p_detail_id)
  const sign = s.score_direction === 'lower_better' ? 1 : -1
  return db.high_scores
    .filter((h) => h.game_id === p_game_id && (!p_mode_id || h.mode_id === p_mode_id) && (!p_detail_id || h.detail_id === p_detail_id))
    .sort((a, b) => sign * (a.score - b.score) || a.achieved_at.localeCompare(b.achieved_at))
    .slice(0, p_limit)
    .map((h, i) => {
      const p = db.players.find((x) => x.id === h.player_id) || {}
      return { rank: i + 1, score_id: h.id, score: h.score, achieved_at: h.achieved_at, player_id: p.id,
        player_name: p.name, player_avatar: p.avatar_url, effective_format: s.score_format,
        effective_direction: s.score_direction, effective_unit: s.score_unit }
    })
}

function applyFilters(rows, params) {
  for (const [k, v] of params) {
    if (['select', 'order', 'limit', 'offset', 'columns'].includes(k)) continue
    if (k === 'or') {
      const m = v.match(/mode_id\.eq\.([\w-]+)/)
      rows = rows.filter((r) => r.mode_id == null || (m && r.mode_id === m[1]))
      continue
    }
    const [op, ...rest] = v.split('.')
    const val = rest.join('.')
    if (op === 'eq') rows = rows.filter((r) => String(r[k]) === val)
    if (op === 'in') { const set = val.replace(/[()]/g, '').split(','); rows = rows.filter((r) => set.includes(String(r[k]))) }
  }
  const order = params.get('order')
  if (order) {
    const [col, dir] = order.split(',')[0].split('.')
    rows = [...rows].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (dir === 'desc' ? -1 : 1))
  }
  return rows
}

function embed(table, row, select) {
  if (!select || table !== 'high_scores') return row
  const out = { ...row }
  const rel = { players: ['players', 'player_id'], games: ['games', 'game_id'], game_modes: ['game_modes', 'mode_id'], game_details: ['game_details', 'detail_id'] }
  for (const [name, [t, fk]] of Object.entries(rel)) {
    if (select.includes(name)) out[name] = db[t].find((x) => x.id === row[fk]) || null
  }
  return out
}

const server = http.createServer(async (req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Expose-Headers': '*' }
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end() }

  let body = ''
  for await (const c of req) body += c
  const url = new URL(req.url, 'http://x')
  const single = (req.headers.accept || '').includes('vnd.pgrst.object')
  const send = (status, data) => {
    const payload = single && Array.isArray(data) ? data[0] ?? null : data
    res.writeHead(status, { ...cors, 'Content-Type': 'application/json' })
    res.end(JSON.stringify(payload))
  }
  console.log(req.method, url.pathname + url.search)

  // Minimal auth: one test admin account
  if (url.pathname === '/auth/v1/token') {
    const { email, password } = JSON.parse(body || '{}')
    if (email === 'host@example.com' && password === 'test-password') {
      const user = { id: 'admin-user', aud: 'authenticated', role: 'authenticated', email, app_metadata: {}, user_metadata: {}, created_at: now() }
      return send(200, { access_token: ADMIN_TOKEN, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'r', user })
    }
    return send(400, { error: 'invalid_grant', error_description: 'Invalid login credentials', msg: 'Invalid login credentials' })
  }
  if (url.pathname.startsWith('/auth/v1/logout')) { res.writeHead(204, cors); return res.end() }

  const rpc = url.pathname.match(/^\/rest\/v1\/rpc\/(\w+)/)
  if (rpc) {
    const args = body ? JSON.parse(body) : Object.fromEntries(url.searchParams)
    if (rpc[1] === 'get_leaderboard') return send(200, leaderboard(args))
    if (rpc[1] === 'get_score_settings') return send(200, [settings(args.p_game_id, args.p_mode_id, args.p_detail_id)])
    if (rpc[1] === 'is_admin') return send(200, isAdmin(req))
    if (rpc[1] === 'player_has_pin') return send(200, secrets.has(args.p_player_id))
    try {
      if (rpc[1] === 'create_player') {
        if (args.p_pin != null && !/^\d{4}$/.test(args.p_pin)) throw new Error('PIN must be 4 digits')
        const p = { id: randomUUID(), name: cleanName(args.p_name), avatar_url: guestAvatar(args.p_avatar_url), created_at: now(), updated_at: now() }
        db.players.push(p)
        if (args.p_pin) secrets.set(p.id, { pin: args.p_pin, failed: 0, lockedUntil: 0 })
        return send(200, p)
      }
      if (rpc[1] === 'update_player_profile') {
        const sec = secrets.get(args.p_player_id)
        if (!sec) return send(200, { ok: false, error: 'no_pin' })
        if (sec.lockedUntil > Date.now()) return send(200, { ok: false, error: 'locked', locked_until: new Date(sec.lockedUntil).toISOString() })
        if (args.p_pin !== sec.pin) {
          if (sec.failed + 1 >= 5) { sec.failed = 0; sec.lockedUntil = Date.now() + 15 * 60000; return send(200, { ok: false, error: 'locked', locked_until: new Date(sec.lockedUntil).toISOString() }) }
          sec.failed++
          return send(200, { ok: false, error: 'wrong_pin', attempts_left: 5 - sec.failed })
        }
        sec.failed = 0; sec.lockedUntil = 0
        const p = db.players.find((x) => x.id === args.p_player_id)
        if (args.p_name != null) p.name = cleanName(args.p_name)
        if (args.p_avatar_url != null) p.avatar_url = guestAvatar(args.p_avatar_url)
        return send(200, { ok: true, player: p })
      }
      if (rpc[1] === 'set_player_pin') {
        if (!isAdmin(req)) return send(403, { code: '42501', message: 'Admin only' })
        secrets.set(args.p_player_id, { pin: args.p_pin, failed: 0, lockedUntil: 0 })
        res.writeHead(204, cors); return res.end()
      }
    } catch (e) {
      return send(400, { code: '22023', message: e.message })
    }
    return send(404, { message: `rpc ${rpc[1]} not mocked` })
  }

  const tbl = url.pathname.match(/^\/rest\/v1\/(\w+)/)
  if (!tbl || !db[tbl[1]]) return send(404, { message: 'not mocked: ' + url.pathname })
  const table = tbl[1]
  const select = url.searchParams.get('select')

  if (req.method === 'GET' || req.method === 'HEAD') {
    return send(200, applyFilters(db[table], url.searchParams).map((r) => embed(table, r, select)))
  }
  // Mirrors the RLS policies: only score INSERTs are open; other writes need admin
  const writeAllowed = isAdmin(req) || (req.method === 'POST' && table === 'high_scores')
  if (['POST', 'PATCH', 'DELETE'].includes(req.method) && !writeAllowed) {
    return send(403, { code: '42501', message: `new row violates row-level security policy for table "${table}"` })
  }

  if (req.method === 'PATCH') {
    const patch = JSON.parse(body)
    const rows = applyFilters(db[table], url.searchParams)
    rows.forEach((r) => Object.assign(r, patch, { updated_at: now() }))
    return send(200, rows)
  }
  if (req.method === 'POST') {
    const input = JSON.parse(body)
    const rows = (Array.isArray(input) ? input : [input]).map((r) => ({ id: randomUUID(), created_at: now(), updated_at: now(), ...r }))
    db[table].push(...rows)
    return send(201, rows)
  }
  if (req.method === 'DELETE') {
    const doomed = new Set(applyFilters(db[table], url.searchParams).map((r) => r.id))
    db[table] = db[table].filter((r) => !doomed.has(r.id))
    return send(200, [])
  }
  return send(405, { message: 'method not mocked' })
})

server.listen(54399, '0.0.0.0', () => console.log('Dry-run database listening on port 54399'))
