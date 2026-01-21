import { useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { useAvatarUpload } from '@/hooks/useAvatarUpload'
import { getInitials, getPlayerColor } from '@/lib/utils'

interface AvatarUploadProps {
  /** Current avatar URL (if any) */
  currentUrl: string | null
  /** Player name (for initials fallback) */
  playerName: string
  /** Called when avatar URL changes (upload or remove) */
  onChange: (url: string | null) => void
  /** Size in pixels (default 80) */
  size?: number
  /** Player ID (optional, for naming uploaded files) */
  playerId?: string
}

/**
 * AvatarUpload - Tappable avatar with camera overlay
 * 
 * Features:
 * - Shows current avatar or initials fallback
 * - Camera icon overlay indicates it's tappable
 * - Hidden file input triggers on tap
 * - Handles upload to Supabase Storage
 * - Loading state during upload
 * - X button to remove avatar
 * 
 * Touch targets: 80px default (≥56px minimum)
 */
export function AvatarUpload({
  currentUrl,
  playerName,
  onChange,
  size = 80,
  playerId,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploading, error, uploadAvatar } = useAvatarUpload()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    // Upload to storage
    const url = await uploadAvatar(file, playerId)
    
    // Clean up preview
    URL.revokeObjectURL(preview)
    setPreviewUrl(null)
    
    if (url) {
      onChange(url)
    }

    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  // Determine what to show
  const displayUrl = previewUrl || currentUrl
  const initials = getInitials(playerName)
  const bgColor = getPlayerColor(playerName)

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar container */}
      <div className="relative">
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="relative rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-category-golf focus:ring-offset-2 focus:ring-offset-background-card disabled:cursor-wait"
          style={{ width: size, height: size }}
        >
          {/* Avatar image or fallback */}
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={playerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold"
              style={{ 
                backgroundColor: bgColor,
                fontSize: size * 0.35,
              }}
            >
              {initials}
            </div>
          )}

          {/* Camera overlay (always visible, stronger when no image) */}
          <div 
            className={`
              absolute inset-0 flex items-center justify-center
              transition-opacity
              ${displayUrl 
                ? 'bg-black/40 opacity-0 hover:opacity-100' 
                : 'bg-black/30'
              }
            `}
          >
            {uploading ? (
              <Loader2 
                className="text-white animate-spin" 
                style={{ width: size * 0.35, height: size * 0.35 }}
              />
            ) : (
              <Camera 
                className="text-white" 
                style={{ width: size * 0.35, height: size * 0.35 }}
              />
            )}
          </div>
        </button>

        {/* Remove button (only when there's an image and not uploading) */}
        {currentUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Helper text */}
      <p className="text-xs text-text-muted">
        {uploading ? 'Uploading...' : 'Tap to change photo'}
      </p>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}