import { useEffect } from 'react'

// Pixels of movement before a press becomes a scroll instead of a tap
const DRAG_THRESHOLD = 8

function isScrollable(el: HTMLElement): boolean {
  const { overflowY } = getComputedStyle(el)
  return (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight
}

function findScrollable(start: EventTarget | null): HTMLElement | null {
  let el = start instanceof HTMLElement ? start : null
  while (el && el !== document.body) {
    if (isScrollable(el)) return el
    el = el.parentElement
  }
  return null
}

/**
 * useDragScroll - Drag anywhere in a scroll area to scroll it
 *
 * On the Pi, Chromium often reports the touchscreen as a mouse, so finger
 * drags don't scroll (and neither do mouse drags over Pi Connect). This adds
 * drag-to-scroll for mouse/pen pointers; real touch keeps native scrolling.
 * A press that turns into a drag doesn't also trigger the button under it.
 */
export function useDragScroll(): void {
  useEffect(() => {
    let target: HTMLElement | null = null
    let startY = 0
    let startScroll = 0
    let dragging = false
    let suppressClick = false

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.button !== 0) return
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, [data-no-drag-scroll]')) return
      target = findScrollable(e.target)
      if (!target) return
      startY = e.clientY
      startScroll = target.scrollTop
      dragging = false
    }

    const onMove = (e: PointerEvent) => {
      if (!target) return
      const dy = e.clientY - startY
      if (!dragging && Math.abs(dy) < DRAG_THRESHOLD) return
      dragging = true
      target.scrollTop = startScroll - dy
    }

    const onUp = () => {
      if (dragging) {
        suppressClick = true
        // The click (if any) fires right after pointerup; don't eat a later tap
        setTimeout(() => { suppressClick = false }, 0)
      }
      target = null
      dragging = false
    }

    // Swallow the click that ends a drag so it doesn't press a button
    const onClick = (e: MouseEvent) => {
      if (!suppressClick) return
      suppressClick = false
      e.preventDefault()
      e.stopPropagation()
    }

    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('pointermove', onMove, true)
    document.addEventListener('pointerup', onUp, true)
    document.addEventListener('pointercancel', onUp, true)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('pointermove', onMove, true)
      document.removeEventListener('pointerup', onUp, true)
      document.removeEventListener('pointercancel', onUp, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [])
}
