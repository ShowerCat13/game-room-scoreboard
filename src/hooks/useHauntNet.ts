import { useEffect } from 'react'
import { triggerNetHaunt } from '@/lib/haunt/scare'
import type { HauntIntensity } from '@/lib/haunt/scare'

// host:port of the haunt-net hub; empty disables the feature entirely
const HUB = (import.meta.env.VITE_HAUNT_HUB ?? '').trim()

const HELLO = { type: 'hello', role: 'scoreboard', name: 'Razpi4B' }
const RETRY_MIN = 2_000
const RETRY_MAX = 30_000

/**
 * useHauntNet - Join the haunt-net hub and turn its haunts into window events
 *
 * Connects to ws://VITE_HAUNT_HUB/ws, says hello, and dispatches
 * HAUNT_NET_EVENT for each `haunt` message (HauntLayer and PartyDisplay react).
 * Reconnects with backoff (2s doubling to 30s). Never throws; logs once per
 * failure streak.
 */
export function useHauntNet(enabled = true) {
  useEffect(() => {
    if (!enabled || !HUB) return

    const url = `ws://${HUB.replace(/^wss?:\/\//, '').replace(/\/+$/, '')}/ws`
    let ws: WebSocket | null = null
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let delay = RETRY_MIN
    let warned = false
    let stopped = false

    const scheduleRetry = () => {
      if (stopped) return
      clearTimeout(retryTimer)
      retryTimer = setTimeout(connect, delay)
      delay = Math.min(delay * 2, RETRY_MAX)
    }

    function connect() {
      if (stopped) return
      try {
        ws = new WebSocket(url)
      } catch {
        if (!warned) { warned = true; console.warn(`[haunt-net] bad hub address ${url}`) }
        scheduleRetry()
        return
      }

      ws.onopen = () => {
        delay = RETRY_MIN
        warned = false
        ws?.send(JSON.stringify(HELLO))
      }

      ws.onmessage = (event) => {
        let msg: { type?: unknown; victim?: unknown; intensity?: unknown }
        try {
          msg = JSON.parse(String(event.data))
        } catch {
          return
        }
        if (msg?.type !== 'haunt') return
        const n = Number(msg.intensity)
        const intensity = (n >= 3 ? 3 : n >= 2 ? 2 : 1) as HauntIntensity
        const victim = typeof msg.victim === 'string' && msg.victim.trim() ? msg.victim.trim() : null
        triggerNetHaunt({ victim, intensity })
      }

      // onerror is always followed by onclose, so retry from there only
      ws.onclose = () => {
        ws = null
        if (stopped) return
        if (!warned) { warned = true; console.warn(`[haunt-net] hub ${HUB} unreachable, retrying`) }
        scheduleRetry()
      }
    }

    connect()

    return () => {
      stopped = true
      clearTimeout(retryTimer)
      if (ws) {
        ws.onopen = ws.onmessage = ws.onclose = null
        ws.close()
        ws = null
      }
    }
  }, [enabled])
}
