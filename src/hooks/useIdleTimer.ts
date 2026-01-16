import { useEffect, useState, useCallback } from 'react'

const IDLE_TIMEOUT = 30000 // 30 seconds in milliseconds

interface UseIdleTimerResult {
  isIdle: boolean
  resetTimer: () => void
}

/**
 * useIdleTimer - Tracks user inactivity
 * Returns true after 30 seconds of no touch/mouse interaction
 *
 * @param timeout - Milliseconds until idle (default: 30000)
 */
export function useIdleTimer(timeout = IDLE_TIMEOUT): UseIdleTimerResult {
  const [isIdle, setIsIdle] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now())
    setIsIdle(false)
  }, [])

  useEffect(() => {
    // Events to listen for (touch and mouse for compatibility)
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'touchmove',
      'click',
    ]

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer()
    }

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    // Check for idle state every second
    const interval = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity
      if (timeSinceActivity >= timeout) {
        setIsIdle(true)
      }
    }, 1000)

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      clearInterval(interval)
    }
  }, [lastActivity, timeout, resetTimer])

  return { isIdle, resetTimer }
}
