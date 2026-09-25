/**
 * GhostFace - Original snarling ghost used for jump scares and idle hauntings
 */
export function GhostFace({ className = '', snarl = true }: { className?: string; snarl?: boolean }) {
  return (
    <svg viewBox="0 0 200 210" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="gf-body" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#e9e4f7" />
          <stop offset="100%" stopColor="#b9aedb" />
        </radialGradient>
        <radialGradient id="gf-eye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="60%" stopColor="#b00000" />
          <stop offset="100%" stopColor="#1a0000" />
        </radialGradient>
      </defs>

      {/* Body with ragged tail */}
      <path
        d="M100 8 C45 8 14 50 14 104 L14 186 L34 168 L52 196 L70 172 L88 204 L106 174 L124 202 L142 170 L160 196 L176 168 L186 184 L186 104 C186 50 155 8 100 8 Z"
        fill="url(#gf-body)"
      />

      {/* Brows */}
      <path d="M40 62 L88 80" stroke="#2a1a3a" strokeWidth="7" strokeLinecap="round" />
      <path d="M160 62 L112 80" stroke="#2a1a3a" strokeWidth="7" strokeLinecap="round" />

      {/* Eyes */}
      <ellipse cx="66" cy="92" rx="20" ry="15" fill="#140a1e" />
      <ellipse cx="134" cy="92" rx="20" ry="15" fill="#140a1e" />
      <circle cx="68" cy="93" r="7" fill="url(#gf-eye)" />
      <circle cx="132" cy="93" r="7" fill="url(#gf-eye)" />

      {snarl ? (
        <>
          {/* Gaping mouth */}
          <path d="M48 124 Q100 110 152 124 Q150 186 100 190 Q50 186 48 124 Z" fill="#1a0610" />
          {/* Tongue */}
          <path d="M72 170 Q100 140 128 170 Q116 188 100 188 Q84 188 72 170 Z" fill="#c2185b" />
          {/* Upper fangs */}
          <path
            d="M52 124 L60 146 L68 122 L78 150 L88 119 L100 152 L112 119 L122 150 L132 122 L140 146 L148 124 Z"
            fill="#fbf8ee"
          />
          {/* Lower teeth */}
          <path d="M66 180 L72 166 L80 182 L90 170 L100 186 L110 170 L120 182 L128 166 L134 180 Z" fill="#fbf8ee" />
        </>
      ) : (
        <path d="M70 140 Q100 160 130 140" stroke="#2a1a3a" strokeWidth="6" fill="none" strokeLinecap="round" />
      )}
    </svg>
  )
}
