/** Window event that asks the mounted HauntLayer to play a jump scare */
export const HAUNT_SCARE_EVENT = 'haunt:scare'

export function triggerJumpScare() {
  window.dispatchEvent(new Event(HAUNT_SCARE_EVENT))
}

/** Window event fired when the haunt-net hub sends a haunt (see useHauntNet) */
export const HAUNT_NET_EVENT = 'haunt:net'

export type HauntIntensity = 1 | 2 | 3

export interface HauntNetDetail {
  /** Guest name the hub picked, or null for a room-wide haunt */
  victim: string | null
  intensity: HauntIntensity
}

export function triggerNetHaunt(detail: HauntNetDetail) {
  window.dispatchEvent(new CustomEvent<HauntNetDetail>(HAUNT_NET_EVENT, { detail }))
}
