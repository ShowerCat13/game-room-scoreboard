import { useCallback, useEffect, useRef, useState } from 'react'
import { GhostFace } from './GhostFace'
import { JumpScare } from './JumpScare'
import { AMBIENT_SLOTS, playSpooky, preloadSpookySounds } from '@/lib/haunt/spookySounds'
import type { SpookySlot } from '@/lib/haunt/spookySounds'
import { useKioskStore } from '@/stores/kioskStore'
import { HAUNT_NET_EVENT, HAUNT_SCARE_EVENT } from '@/lib/haunt/scare'
import type { HauntNetDetail } from '@/lib/haunt/scare'


// Timings (ms). Random ranges keep it unpredictable.
const LIGHTNING = [35_000, 80_000]
const AMBIENT_SOUND = [45_000, 110_000]
const EYES = [8_000, 18_000]
const BATS = [25_000, 45_000]
const RANDOM_SCARE = [10 * 60_000, 18 * 60_000]
const IDLE_HAUNT_AFTER = 3 * 60_000
const EYES_LIFETIME = 5_000

const rand = ([min, max]: number[]) => min + Math.random() * (max - min)

/** Run `fn` repeatedly at random intervals within `range` */
function useRandomInterval(fn: () => void, range: number[], enabled = true) {
  const fnRef = useRef(fn)
  fnRef.current = fn
  useEffect(() => {
    if (!enabled) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        fnRef.current()
        schedule()
      }, rand(range))
    }
    schedule()
    return () => clearTimeout(timer)
  }, [range, enabled])
}

interface EyePair { id: number; x: number; y: number; scale: number }

// Where eyes may appear on the 800×480 layout (percent), chosen so they
// peek from empty space instead of covering names or times
const EYE_SPOTS = [
  { x: [40, 62], y: [4, 9] },    // header, between title and clock
  { x: [72, 92], y: [74, 78] },  // gap under the QR card
  { x: [20, 60], y: [94, 96] },  // footer
  { x: [0.5, 1.5], y: [20, 80] }, // far left gutter
]

/**
 * HauntLayer - Ambient Halloween effects for the party home screen
 *
 * Only transform/opacity animations plus one small canvas, to stay smooth
 * on a Raspberry Pi 4 at 800×480.
 */
export function HauntLayer() {
  const hauntSounds = useKioskStore((s) => s.hauntSounds)
  const hauntScares = useKioskStore((s) => s.hauntScares)

  const [flashKey, setFlashKey] = useState(0)
  const [eyes, setEyes] = useState<EyePair[]>([])
  const [batsKey, setBatsKey] = useState(0)
  const [idleGhostKey, setIdleGhostKey] = useState(0)
  const [scaring, setScaring] = useState(false)
  const lastActivity = useRef(Date.now())
  const lastSlot = useRef<SpookySlot | null>(null)

  useEffect(() => {
    preloadSpookySounds()
    const touch = () => { lastActivity.current = Date.now() }
    const events = ['pointerdown', 'keydown'] as const
    events.forEach((e) => document.addEventListener(e, touch))
    return () => events.forEach((e) => document.removeEventListener(e, touch))
  }, [])

  const shake = useCallback(() => {
    document.documentElement.classList.add('haunt-shake')
    setTimeout(() => document.documentElement.classList.remove('haunt-shake'), 500)
  }, [])

  // Lightning + thunder
  const lightning = useCallback(() => {
    setFlashKey((k) => k + 1)
    if (hauntSounds) setTimeout(() => void playSpooky('thunder', 0.9), 250)
    setTimeout(shake, 300)
  }, [hauntSounds, shake])
  useRandomInterval(lightning, LIGHTNING)

  // Random ambient sound (never the same one twice in a row)
  const ambientSound = useCallback(() => {
    const options = AMBIENT_SLOTS.filter((s) => s !== lastSlot.current)
    const slot = options[Math.floor(Math.random() * options.length)]
    lastSlot.current = slot
    void playSpooky(slot, 0.7)
  }, [])
  useRandomInterval(ambientSound, AMBIENT_SOUND, hauntSounds)

  // Eyes blinking in the dark around the edges
  const spawnEyes = useCallback(() => {
    const spot = EYE_SPOTS[Math.floor(Math.random() * EYE_SPOTS.length)]
    const pair: EyePair = {
      id: Date.now(),
      x: rand(spot.x),
      y: rand(spot.y),
      scale: 0.6 + Math.random() * 0.4,
    }
    setEyes((current) => [...current.slice(-1), pair])
    setTimeout(() => setEyes((current) => current.filter((e) => e.id !== pair.id)), EYES_LIFETIME)
  }, [])
  useRandomInterval(spawnEyes, EYES)

  // Bats
  useRandomInterval(() => setBatsKey((k) => k + 1), BATS)

  // Idle haunting: lure people over when nobody has touched the kiosk
  const idleHaunt = useCallback(() => {
    setIdleGhostKey((k) => k + 1)
    if (hauntSounds) void playSpooky('ghost_laugh', 0.9)
  }, [hauntSounds])
  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - lastActivity.current < IDLE_HAUNT_AFTER) return
      lastActivity.current = Date.now() // repeat every IDLE_HAUNT_AFTER while idle
      idleHaunt()
    }, 10_000)
    return () => clearInterval(timer)
  }, [idleHaunt])

  // Dev only: window.__haunt.lightning() etc. to preview effects on demand
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as unknown as { __haunt?: Record<string, () => void> }
    w.__haunt = {
      lightning,
      eyes: spawnEyes,
      bats: () => setBatsKey((k) => k + 1),
      idle: idleHaunt,
      scare: () => setScaring(true),
    }
    return () => { delete w.__haunt }
  }, [lightning, spawnEyes, idleHaunt])

  // Random scares, only when nobody is mid-tap
  useRandomInterval(() => {
    if (Date.now() - lastActivity.current > 20_000) setScaring(true)
  }, RANDOM_SCARE, hauntScares)

  // External trigger (e.g. a new track record from a phone)
  useEffect(() => {
    const onScare = () => { if (hauntScares) setScaring(true) }
    window.addEventListener(HAUNT_SCARE_EVENT, onScare)
    return () => window.removeEventListener(HAUNT_SCARE_EVENT, onScare)
  }, [hauntScares])

  // haunt-net hub (see useHauntNet): 1 unease, 2 dread, 3 terror
  useEffect(() => {
    const onNetHaunt = (e: Event) => {
      const { intensity } = (e as CustomEvent<HauntNetDetail>).detail
      if (intensity === 3 && hauntScares) {
        setScaring(true)
        return
      }
      lightning()
      if (intensity === 1) {
        if (hauntSounds) ambientSound()
        return
      }
      // Dread: eyes plus the drifting ghost and its laugh (the victim's name
      // glitch lives in PartyDisplay, which knows who is on screen)
      spawnEyes()
      idleHaunt()
    }
    window.addEventListener(HAUNT_NET_EVENT, onNetHaunt)
    return () => window.removeEventListener(HAUNT_NET_EVENT, onNetHaunt)
  }, [hauntSounds, hauntScares, lightning, ambientSound, spawnEyes, idleHaunt])

  return (
    <>
      {/* Behind content */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <EmberCanvas />
      </div>

      {/* In front of content (brief, and kept to empty space) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20" aria-hidden="true">
        {eyes.map((e) => (
          <div
            key={e.id}
            className="haunt-eyes absolute"
            style={{ left: `${e.x}%`, top: `${e.y}%`, transform: `scale(${e.scale})` }}
          >
            <span /><span />
          </div>
        ))}

        {batsKey > 0 && (
          <div key={batsKey} className="haunt-bats absolute inset-0">
            {[0, 1, 2].map((i) => (
              <svg key={i} className={`haunt-bat haunt-bat-${i}`} viewBox="0 0 64 32">
                <path d="M32 14 C28 6 20 4 12 8 C16 10 16 14 14 18 C10 16 4 16 0 20 C8 20 14 26 18 30 C22 24 28 22 32 26 C36 22 42 24 46 30 C50 26 56 20 64 20 C60 16 54 16 50 18 C48 14 48 10 52 8 C44 4 36 6 32 14 Z" />
              </svg>
            ))}
          </div>
        )}

        {idleGhostKey > 0 && (
          <div key={idleGhostKey} className="haunt-idle">
            <div className="haunt-flicker absolute inset-0" />
            <GhostFace className="haunt-idle-ghost absolute w-[180px] h-[190px]" snarl={false} />
          </div>
        )}
      </div>

      {/* Lightning sits above content so the whole screen flashes */}
      {flashKey > 0 && <div key={flashKey} className="haunt-lightning fixed inset-0 z-[60] pointer-events-none" />}

      {scaring && <JumpScare onDone={() => setScaring(false)} />}
    </>
  )
}

/**
 * Rising embers/wisps on a small canvas, capped at ~30fps
 */
function EmberCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const resize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#ff8a1f', '#7dff9b', '#c77dff']
    const particles = Array.from({ length: 36 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.8 + Math.random() * 1.8,
      vy: 0.2 + Math.random() * 0.5,
      drift: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.2 + Math.random() * 0.5,
    }))

    let frame = 0
    let last = 0
    const tick = (t: number) => {
      frame = requestAnimationFrame(tick)
      if (t - last < 33 || document.hidden) return
      last = t
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.y -= p.vy
        p.drift += 0.02
        p.x += Math.sin(p.drift) * 0.3
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width }
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.drift * 3))
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
