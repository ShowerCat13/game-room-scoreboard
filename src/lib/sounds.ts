/**
 * Sound System for Game Room Scoreboard
 * 
 * Uses Web Audio API to generate arcade-style sounds programmatically.
 * No external files needed — sounds are synthesized on demand.
 */

type SoundType = 'fanfare' | 'chime' | 'click' | 'error'

// Audio context singleton (created on first user interaction)
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  // Resume if suspended (browsers require user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

/**
 * Play a triumphant fanfare for 1st place victories
 * Ascending arpeggio with harmonics — arcade victory vibes
 */
function playFanfare(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Victory arpeggio notes (C major with octave jump)
  const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
  const noteDuration = 0.12
  
  notes.forEach((freq, i) => {
    const startTime = now + i * noteDuration
    
    // Main tone
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, startTime)
    
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(volume * 0.4, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration + 0.2)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(startTime)
    osc.stop(startTime + noteDuration + 0.3)
    
    // Add shimmer harmonic on last note
    if (i === notes.length - 1) {
      const shimmer = ctx.createOscillator()
      const shimmerGain = ctx.createGain()
      
      shimmer.type = 'sine'
      shimmer.frequency.setValueAtTime(freq * 2, startTime)
      
      shimmerGain.gain.setValueAtTime(0, startTime)
      shimmerGain.gain.linearRampToValueAtTime(volume * 0.15, startTime + 0.05)
      shimmerGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8)
      
      shimmer.connect(shimmerGain)
      shimmerGain.connect(ctx.destination)
      
      shimmer.start(startTime)
      shimmer.stop(startTime + 1)
    }
  })
  
  // Add a subtle bass thump for impact
  const bass = ctx.createOscillator()
  const bassGain = ctx.createGain()
  
  bass.type = 'sine'
  bass.frequency.setValueAtTime(130.81, now) // C3
  bass.frequency.exponentialRampToValueAtTime(65.41, now + 0.1) // Drop to C2
  
  bassGain.gain.setValueAtTime(volume * 0.3, now)
  bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
  
  bass.connect(bassGain)
  bassGain.connect(ctx.destination)
  
  bass.start(now)
  bass.stop(now + 0.4)
}

/**
 * Play a pleasant chime for score saves (non-1st place)
 * Soft bell-like tone with gentle decay
 */
function playChime(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Bell-like tone (two frequencies for richness)
  const frequencies = [880, 1318.5] // A5 and E6 (perfect fifth)
  
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    
    const noteVolume = i === 0 ? volume * 0.3 : volume * 0.15
    
    gain.gain.setValueAtTime(noteVolume, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.7)
  })
  
  // Add subtle high harmonic
  const harmonic = ctx.createOscillator()
  const harmonicGain = ctx.createGain()
  
  harmonic.type = 'sine'
  harmonic.frequency.setValueAtTime(2637, now) // E7
  
  harmonicGain.gain.setValueAtTime(volume * 0.05, now)
  harmonicGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
  
  harmonic.connect(harmonicGain)
  harmonicGain.connect(ctx.destination)
  
  harmonic.start(now)
  harmonic.stop(now + 0.4)
}

/**
 * Play a subtle click for button feedback
 * Very short, non-intrusive
 */
function playClick(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Short click using noise-like synthesis
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  osc.type = 'square'
  osc.frequency.setValueAtTime(1800, now)
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.03)
  
  gain.gain.setValueAtTime(volume * 0.1, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
  
  osc.connect(gain)
  gain.connect(ctx.destination)
  
  osc.start(now)
  osc.stop(now + 0.06)
}

/**
 * Play an error/invalid sound
 * Low buzz to indicate something went wrong
 */
function playError(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Two low tones slightly detuned for "buzz" effect
  const frequencies = [150, 155]
  
  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq, now)
    
    gain.gain.setValueAtTime(volume * 0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.3)
  })
}

/**
 * Sound Manager
 * Central interface for playing sounds with volume control
 */
class SoundManager {
  private enabled: boolean = true
  private volume: number = 0.7 // 0.0 to 1.0
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }
  
  isEnabled(): boolean {
    return this.enabled
  }
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
  }
  
  getVolume(): number {
    return this.volume
  }
  
  play(type: SoundType): void {
    if (!this.enabled) return
    
    try {
      switch (type) {
        case 'fanfare':
          playFanfare(this.volume)
          break
        case 'chime':
          playChime(this.volume)
          break
        case 'click':
          playClick(this.volume)
          break
        case 'error':
          playError(this.volume)
          break
      }
    } catch (error) {
      // Silently fail if audio isn't available
      console.warn('Sound playback failed:', error)
    }
  }
  
  /**
   * Play appropriate sound based on score rank
   */
  playScoreSound(rank: number): void {
    if (rank === 1) {
      this.play('fanfare')
    } else {
      this.play('chime')
    }
  }
  
  /**
   * Initialize audio context on first user interaction
   * Call this from a click/touch handler to enable audio
   */
  init(): void {
    try {
      getAudioContext()
    } catch (error) {
      console.warn('Audio initialization failed:', error)
    }
  }
}

// Export singleton instance
export const sounds = new SoundManager()

// Export types
export type { SoundType }