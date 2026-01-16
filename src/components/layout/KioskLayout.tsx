import { ReactNode } from 'react'

interface KioskLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * KioskLayout - 800x480 fixed container for Raspberry Pi touchscreen
 * Centers content on screen with dark background
 */
export function KioskLayout({ children, className = '' }: KioskLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-primary">
      <div className={`kiosk-container bg-background-primary ${className}`}>
        {children}
      </div>
    </div>
  )
}
