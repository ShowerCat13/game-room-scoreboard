import { useEffect, useRef } from 'react'
import { sounds } from '@/lib/sounds'

/**
 * Hook to initialize audio context on first user interaction
 * Browsers require user gesture to enable audio
 */
export function useSoundInit() {
  const initialized = useRef(false)

  useEffect(() => {
    const handleInteraction = () => {
      if (!initialized.current) {
        sounds.init()
        initialized.current = true
      }
    }

    // Listen for first interaction
    document.addEventListener('touchstart', handleInteraction, { once: true })
    document.addEventListener('mousedown', handleInteraction, { once: true })
    document.addEventListener('keydown', handleInteraction, { once: true })

    return () => {
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('mousedown', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
  }, [])
}