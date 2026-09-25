// Pick the address phones on the home Wi-Fi can reach (used for the QR code).
// Prefers private LAN ranges over VPN/CGNAT (100.64.0.0/10, e.g. Tailscale)
// and link-local addresses. Override with LAN_IP=192.168.1.50 if needed.
import os from 'node:os'

function score(ip) {
  if (/^192\.168\./.test(ip)) return 3
  if (/^10\./.test(ip)) return 2
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return 2
  if (/^169\.254\./.test(ip) || /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(ip)) return 0
  return 1
}

export function getLanIp() {
  if (process.env.LAN_IP) return process.env.LAN_IP
  const candidates = Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address)
    .sort((a, b) => score(b) - score(a))
  return candidates[0] ?? 'localhost'
}
