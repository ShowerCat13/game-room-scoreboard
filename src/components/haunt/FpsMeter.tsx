import { useEffect, useState } from 'react'

// Read once at startup so the meter survives in-app navigation
const enabled = new URLSearchParams(window.location.search).get('fps') === '1'

/**
 * FpsMeter - Hidden frame-rate readout for checking effects on the Pi
 * Enable by opening the kiosk with ?fps=1 (e.g. http://localhost:4173/?fps=1)
 */
export function FpsMeter() {
  const [fps, setFps] = useState(0)
  const [worst, setWorst] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let frames = 0
    let longest = 0
    let prev = performance.now()
    let windowStart = prev
    let raf = 0

    const tick = (now: number) => {
      frames++
      longest = Math.max(longest, now - prev)
      prev = now
      if (now - windowStart >= 1000) {
        setFps(Math.round((frames * 1000) / (now - windowStart)))
        setWorst(Math.round(longest))
        frames = 0
        longest = 0
        windowStart = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!enabled) return null

  const color = fps >= 50 ? '#7dff9b' : fps >= 30 ? '#ffb81f' : '#ff4d4d'
  return (
    <div
      className="fixed bottom-1 right-1 z-[100] px-2 py-0.5 rounded bg-black/80 font-mono text-xs pointer-events-none"
      style={{ color }}
    >
      {fps} fps · worst {worst}ms
    </div>
  )
}
