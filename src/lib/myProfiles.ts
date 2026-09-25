/**
 * Profile PINs remembered on a guest's own phone, so they can edit their
 * profile there without retyping the PIN. Never used on the shared kiosk.
 */
const KEY = 'my-profile-pins'

/** Phones use the mobile layout; the 800×480 kiosk does not */
export function isPersonalDevice(): boolean {
  return window.matchMedia('(max-width: 639px)').matches
}

function read(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function rememberPin(playerId: string, pin: string): void {
  if (!isPersonalDevice()) return
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...read(), [playerId]: pin }))
  } catch {
    // storage unavailable (private mode): just don't remember
  }
}

export function getRememberedPin(playerId: string): string | null {
  if (!isPersonalDevice()) return null
  return read()[playerId] ?? null
}

export function forgetPin(playerId: string): void {
  try {
    const all = read()
    delete all[playerId]
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}
