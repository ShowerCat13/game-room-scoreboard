// Dry run: build the app against an in-memory stand-in database and serve it,
// so the party screens, haunt, sounds and phones can be tested on the Pi
// without touching the real Supabase project.
//
//   npm run dry-run      (Ctrl+C to stop)
//   npm run build        afterwards, to point the app back at the real database
import { spawn } from 'node:child_process'
import net from 'node:net'
import { getLanIp } from './lan-ip.mjs'

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, '127.0.0.1')
    socket.once('connect', () => { socket.end(); resolve(true) })
    socket.once('error', () => resolve(false))
  })
}

function run(cmd, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, env: { ...process.env, ...env } })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} failed`))))
  })
}

const ip = getLanIp()
// Phones reach the stand-in database through the Pi's network address
const env = { VITE_SUPABASE_URL: `http://${ip}:54399`, VITE_SUPABASE_ANON_KEY: 'dry-run' }

await import('./dry-run-supabase.mjs')

console.log(`\nBuilding against the dry-run database at ${env.VITE_SUPABASE_URL} ...`)
await run('npx', ['tsc', '-b'], env)
await run('npx', ['vite', 'build'], env)

if (await portInUse(4173)) {
  console.log('\nBuild ready. Your existing server on port 4173 (pm2) is serving it - refresh Chromium.')
} else {
  console.log('\nNothing on port 4173, starting a preview server...')
  spawn('npx', ['vite', 'preview', '--port', '4173', '--host'], { stdio: 'inherit', shell: true })
}

console.log(`
DRY RUN - fake racers, nothing is saved to Supabase.
  Kiosk:  http://localhost:4173/?fps=1
  Phones: http://${ip}:4173 (or scan the QR code)
Ctrl+C to stop, then run "npm run build" to go back to the real database.
`)
