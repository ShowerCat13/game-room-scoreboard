import { ReactNode } from 'react'

interface KioskLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * KioskLayout - 800x480 fixed container for Raspberry Pi touchscreen
 * Centers content on screen with themed background
 */
export function KioskLayout({ children, className = '' }: KioskLayoutProps) {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center"
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