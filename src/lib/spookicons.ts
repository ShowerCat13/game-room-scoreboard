import {
  Ghost, Skull, Bone, Cat, Moon, Eye, Flame, Axe,
  Biohazard, Brain, HeartCrack, Droplet, FlaskConical, Wand, Worm, Hand,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Spookicons - Halloween player icons
 *
 * Stored in players.avatar_url as "spookicon:<id>" so no schema change is
 * needed; PlayerAvatar renders them instead of an image.
 */
export interface Spookicon {
  id: string
  label: string
  Icon: LucideIcon
  color: string
}

export const SPOOKICONS: Spookicon[] = [
  { id: 'ghost', label: 'Ghost', Icon: Ghost, color: '#9b6bff' },
  { id: 'skull', label: 'Skull', Icon: Skull, color: '#6b7280' },
  { id: 'bone', label: 'Bone', Icon: Bone, color: '#a8a29e' },
  { id: 'cat', label: 'Black Cat', Icon: Cat, color: '#52525b' },
  { id: 'moon', label: 'Moon', Icon: Moon, color: '#3b3f8f' },
  { id: 'eye', label: 'Eye', Icon: Eye, color: '#b91c1c' },
  { id: 'flame', label: 'Hellfire', Icon: Flame, color: '#ea580c' },
  { id: 'axe', label: 'Axe', Icon: Axe, color: '#7f1d1d' },
  { id: 'biohazard', label: 'Biohazard', Icon: Biohazard, color: '#4d7c0f' },
  { id: 'brain', label: 'Brains', Icon: Brain, color: '#db2777' },
  { id: 'heart', label: 'Broken Heart', Icon: HeartCrack, color: '#9f1239' },
  { id: 'blood', label: 'Blood', Icon: Droplet, color: '#991b1b' },
  { id: 'potion', label: 'Potion', Icon: FlaskConical, color: '#15803d' },
  { id: 'wand', label: 'Hex', Icon: Wand, color: '#7e22ce' },
  { id: 'worm', label: 'Grave Worm', Icon: Worm, color: '#854d0e' },
  { id: 'hand', label: 'Zombie Hand', Icon: Hand, color: '#3f6212' },
]

const PREFIX = 'spookicon:'

export function toSpookiconUrl(id: string): string {
  return `${PREFIX}${id}`
}

/** Returns the spookicon for an avatar_url value, or null for real images */
export function getSpookicon(avatarUrl: string | null | undefined): Spookicon | null {
  if (!avatarUrl?.startsWith(PREFIX)) return null
  const id = avatarUrl.slice(PREFIX.length)
  return SPOOKICONS.find((s) => s.id === id) ?? null
}
