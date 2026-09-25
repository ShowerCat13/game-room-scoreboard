/** Window event that asks the mounted HauntLayer to play a jump scare */
export const HAUNT_SCARE_EVENT = 'haunt:scare'

export function triggerJumpScare() {
  window.dispatchEvent(new Event(HAUNT_SCARE_EVENT))
}
