import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface UseAvatarUploadResult {
  uploading: boolean
  error: string | null
  uploadAvatar: (file: File, playerId?: string) => Promise<string | null>
  deleteAvatar: (url: string) => Promise<boolean>
}

/**
 * useAvatarUpload - Handle avatar uploads to Supabase Storage
 * 
 * Uploads to the 'avatars' bucket with unique filenames.
 * Returns the public URL on success.
 */
export function useAvatarUpload(): UseAvatarUploadResult {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadAvatar = useCallback(async (file: File, playerId?: string): Promise<string | null> => {
    setUploading(true)
    setError(null)

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('Image must be less than 2MB')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const fileName = playerId 
        ? `${playerId}-${timestamp}.${fileExt}`
        : `new-${timestamp}-${randomId}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite if exists
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload avatar'
      setError(message)
      console.error('Avatar upload error:', err)
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  const deleteAvatar = useCallback(async (url: string): Promise<boolean> => {
    try {
      // Extract filename from URL
      const urlParts = url.split('/avatars/')
      if (urlParts.length < 2) return false
      
      const fileName = urlParts[1]
      
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([fileName])

      if (deleteError) {
        throw deleteError
      }

      return true
    } catch (err) {
      console.error('Avatar delete error:', err)
      return false
    }
  }, [])

  return {
    uploading,
    error,
    uploadAvatar,
    deleteAvatar,
  }
}