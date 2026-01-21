import { ReactNode } from 'react'

interface KioskLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * KioskLayout - Responsive container for all app content
 * 
 * Behavior:
 * - Pi Kiosk (800×480): Fixed dimensions, centered on screen
 * - Mobile (<640px): Full viewport with vertical scrolling
 * - Tablet/Desktop: Adapts to available space
 * 
 * Features:
 * - Safe area insets for notched phones
 * - Themed background
 * - Overflow handling per device type
 */
export function KioskLayout({ children, className = '' }: KioskLayoutProps) {
  return (
    <div 
      className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center safe-area-top safe-area-bottom safe-area-x"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div 
        className={`kiosk-container ${className}`}
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        {children}
      </div>
    </div>
  )
}