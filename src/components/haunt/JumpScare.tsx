import { useEffect } from 'react'
import { GhostFace } from './GhostFace'
import { playSpooky } from '@/lib/haunt/spookySounds'

const SCARE_MS = 1500

/**
 * JumpScare - Full-screen ghost lunge with scream and screen shake
 *
 * Pure CSS transform/opacity animation so it stays smooth on a Pi 4.
 */
export function JumpScare({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    void playSpooky('scream', 1.1)
    void playSpooky('evil_laugh', 0.9)
    document.documentElement.classList.add('haunt-shake')
    const shake = setTimeout(() => document.documentElement.classList.remove('haunt-shake'), 600)
    const done = setTimeout(onDone, SCARE_MS)
    return () => {
      clearTimeout(shake)
      clearTimeout(done)
      document.documentElement.classList.remove('haunt-shake')
    }
  }, [onDone])

  return (
    <div className="jump-scare fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
      <div className="jump-scare-flash absolute inset-0" />
      <GhostFace className="jump-scare-face relative w-[92vmin] h-[92vmin]" />
    </div>
  )
}
