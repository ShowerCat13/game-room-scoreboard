/**
 * Spooky sound slots for the Halloween haunt
 *
 * Each slot plays a real clip from public/sounds/<slot>.(mp3|ogg|wav) when
 * one exists, and otherwise falls back to a synthesized approximation so the
 * haunt works before any audio files are added. See public/sounds/README.md.
 */
import { getAudioContext, sounds } from '@/lib/sounds'

export type SpookySlot =
  | 'ghost_laugh'
  | 'zombie_groan'
  | 'witch_cackle'
  | 'thunder'
  | 'wolf_howl'
  | 'creaky_door'
  | 'evil_laugh'
  | 'scream'
  | 'heartbeat'

/** Slots used for the random ambient sounds between races */
export const AMBIENT_SLOTS: SpookySlot[] = [
  'ghost_laugh', 'zombie_groan', 'witch_cackle', 'wolf_howl', 'creaky_door', 'evil_laugh',
]

const EXTENSIONS = ['mp3', 'ogg', 'wav']

// undefined = not loaded yet, null = no file (use synth)
const buffers = new Map<SpookySlot, AudioBuffer | null>()
const loading = new Map<SpookySlot, Promise<AudioBuffer | null>>()

async function loadSlot(slot: SpookySlot): Promise<AudioBuffer | null> {
  if (buffers.has(slot)) return buffers.get(slot) ?? null
  const pending = loading.get(slot)
  if (pending) return pending

  const promise = (async () => {
    const ctx = getAudioContext()
    for (const ext of EXTENSIONS) {
      try {
        const res = await fetch(`/sounds/${slot}.${ext}`)
        // The dev server answers missing files with index.html, so check the type
        if (!res.ok || !(res.headers.get('content-type') || '').startsWith('audio/')) continue
        const buffer = await ctx.decodeAudioData(await res.arrayBuffer())
        buffers.set(slot, buffer)
        return buffer
      } catch {
        // try the next extension
      }
    }
    buffers.set(slot, null)
    return null
  })()

  loading.set(slot, promise)
  return promise
}

/** Warm the cache so the first scare isn't delayed by a download */
export function preloadSpookySounds(): void {
  const slots: SpookySlot[] = [...AMBIENT_SLOTS, 'thunder', 'scream', 'heartbeat']
  slots.forEach((slot) => { void loadSlot(slot) })
}

/**
 * Play a spooky slot. Respects the global sound on/off and volume.
 * @param gain - Extra multiplier on top of the global volume
 */
export async function playSpooky(slot: SpookySlot, gain = 1): Promise<void> {
  if (!sounds.isEnabled()) return
  try {
    const ctx = getAudioContext()
    const volume = sounds.getVolume() * gain
    const buffer = await loadSlot(slot)

    if (buffer) {
      const src = ctx.createBufferSource()
      const g = ctx.createGain()
      src.buffer = buffer
      g.gain.value = volume
      src.connect(g).connect(ctx.destination)
      src.start()
      return
    }

    SYNTH[slot](ctx, volume)
  } catch (error) {
    console.warn('Spooky sound failed:', error)
  }
}

// ============================================================================
// SYNTHESIZED FALLBACKS
// Rough approximations; real clips in public/sounds sound far better.
// ============================================================================

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function envelope(g: GainNode, t: number, peak: number, attack: number, release: number) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release)
}

/** Voice-ish "ha ha ha" bursts through a formant filter */
function laugh(ctx: AudioContext, volume: number, opts: {
  base: number; count: number; gap: number; type: OscillatorType; formant: number; drop: number
}) {
  const now = ctx.currentTime
  for (let i = 0; i < opts.count; i++) {
    const t = now + i * opts.gap
    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const g = ctx.createGain()
    osc.type = opts.type
    const f = opts.base * (1 - (i / opts.count) * opts.drop)
    osc.frequency.setValueAtTime(f * 1.15, t)
    osc.frequency.exponentialRampToValueAtTime(f, t + opts.gap * 0.7)
    filter.type = 'bandpass'
    filter.frequency.value = opts.formant
    filter.Q.value = 3
    envelope(g, t, volume * 0.5, 0.02, opts.gap * 0.75)
    osc.connect(filter).connect(g).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + opts.gap)
  }
}

const SYNTH: Record<SpookySlot, (ctx: AudioContext, volume: number) => void> = {
  ghost_laugh: (ctx, v) =>
    laugh(ctx, v, { base: 520, count: 6, gap: 0.14, type: 'triangle', formant: 1100, drop: 0.35 }),

  evil_laugh: (ctx, v) =>
    laugh(ctx, v * 1.2, { base: 130, count: 7, gap: 0.2, type: 'sawtooth', formant: 600, drop: 0.25 }),

  witch_cackle: (ctx, v) =>
    laugh(ctx, v, { base: 780, count: 10, gap: 0.09, type: 'square', formant: 1800, drop: 0.3 }),

  zombie_groan: (ctx, v) => {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    const g = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(95, now)
    osc.frequency.linearRampToValueAtTime(70, now + 1.8)
    lfo.frequency.value = 5
    lfoGain.gain.value = 6
    lfo.connect(lfoGain).connect(osc.frequency)
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(350, now)
    filter.frequency.linearRampToValueAtTime(600, now + 0.8)
    filter.frequency.linearRampToValueAtTime(300, now + 1.8)
    filter.Q.value = 4
    envelope(g, now, v * 0.7, 0.3, 1.6)
    osc.connect(filter).connect(g).connect(ctx.destination)
    osc.start(now); lfo.start(now)
    osc.stop(now + 2); lfo.stop(now + 2)
  },

  wolf_howl: (ctx, v) => {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const vib = ctx.createOscillator()
    const vibGain = ctx.createGain()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(380, now)
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.9)
    osc.frequency.exponentialRampToValueAtTime(520, now + 2.6)
    vib.frequency.value = 6
    vibGain.gain.value = 10
    vib.connect(vibGain).connect(osc.frequency)
    envelope(g, now, v * 0.35, 0.4, 2.3)
    osc.connect(g).connect(ctx.destination)
    osc.start(now); vib.start(now)
    osc.stop(now + 2.8); vib.stop(now + 2.8)
  },

  creaky_door: (ctx, v) => {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const g = ctx.createGain()
    osc.type = 'sawtooth'
    // Irregular stick-slip pitch
    let t = now
    while (t < now + 1.6) {
      osc.frequency.setValueAtTime(60 + Math.random() * 90, t)
      t += 0.03 + Math.random() * 0.05
    }
    filter.type = 'bandpass'
    filter.frequency.value = 1400
    filter.Q.value = 6
    envelope(g, now, v * 0.5, 0.1, 1.5)
    osc.connect(filter).connect(g).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 1.7)
  },

  thunder: (ctx, v) => {
    const now = ctx.currentTime
    // Crack
    const crack = ctx.createBufferSource()
    const hp = ctx.createBiquadFilter()
    const cg = ctx.createGain()
    crack.buffer = noiseBuffer(ctx, 0.4)
    hp.type = 'highpass'
    hp.frequency.value = 1500
    envelope(cg, now, v * 0.5, 0.005, 0.35)
    crack.connect(hp).connect(cg).connect(ctx.destination)
    crack.start(now)
    // Rumble
    const rumble = ctx.createBufferSource()
    const lp = ctx.createBiquadFilter()
    const rg = ctx.createGain()
    rumble.buffer = noiseBuffer(ctx, 4)
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(400, now)
    lp.frequency.exponentialRampToValueAtTime(80, now + 3.5)
    envelope(rg, now + 0.05, v * 1.1, 0.15, 3.4)
    rumble.connect(lp).connect(rg).connect(ctx.destination)
    rumble.start(now + 0.05)
  },

  scream: (ctx, v) => {
    // Horror stinger: dissonant cluster + noise burst
    const now = ctx.currentTime
    ;[311, 330, 466, 494].forEach((f) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(f, now)
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.9)
      envelope(g, now, v * 0.18, 0.01, 1.0)
      osc.connect(g).connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 1.1)
    })
    const burst = ctx.createBufferSource()
    const g = ctx.createGain()
    burst.buffer = noiseBuffer(ctx, 0.6)
    envelope(g, now, v * 0.4, 0.005, 0.5)
    burst.connect(g).connect(ctx.destination)
    burst.start(now)
  },

  heartbeat: (ctx, v) => {
    const now = ctx.currentTime
    ;[0, 0.28, 0.9, 1.18].forEach((offset, i) => {
      const t = now + offset
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(i % 2 ? 50 : 60, t)
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.15)
      envelope(g, t, v * 0.9, 0.01, 0.2)
      osc.connect(g).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.25)
    })
  },
}
