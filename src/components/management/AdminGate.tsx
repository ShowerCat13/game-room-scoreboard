import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import { KioskLayout } from '@/components/layout'
import { supabase } from '@/lib/supabase'

async function checkIsAdmin(): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('is_admin')
  return !error && data === true
}

/**
 * AdminGate - Requires the host's Supabase admin login (see supabase/security.sql)
 *
 * The database only allows edits/deletes for accounts listed in public.admins,
 * so this sign-in is the real protection; the admin PIN is a convenience lock.
 * The session lives in memory only and is signed out when leaving this screen,
 * so the shared kiosk never stays signed in.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [state, setState] = useState<'checking' | 'signed-out' | 'admin'>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      const ok = data.session ? await checkIsAdmin() : false
      if (active) setState(ok ? 'admin' : 'signed-out')
    })
    return () => {
      active = false
      void supabase.auth.signOut()
    }
  }, [])

  const handleSignIn = async () => {
    setBusy(true)
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (signInError) {
        setError('Email or password is incorrect')
        return
      }
      if (await checkIsAdmin()) {
        setPassword('')
        setState('admin')
      } else {
        await supabase.auth.signOut()
        setError("That account isn't an admin for this scoreboard")
      }
    } catch {
      setError("Couldn't reach the scoreboard")
    } finally {
      setBusy(false)
    }
  }

  if (state === 'admin') return <>{children}</>

  const inputClass =
    'w-full h-[48px] px-md bg-background-card rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-category-darts'

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        <div className="h-[56px] px-md flex items-center border-b border-background-elevated">
          <button onClick={() => navigate('/settings')} className="flex items-center gap-1 text-text-secondary">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-md">
          {state === 'checking' ? (
            <p className="text-text-secondary">Checking...</p>
          ) : (
            <form
              className="w-full max-w-[360px] space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                if (!busy) void handleSignIn()
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-6 h-6 text-accent-primary" />
                <h1 className="text-lg font-bold text-text-primary">Host sign-in</h1>
              </div>
              <p className="text-sm text-text-muted">
                Editing and deleting scores, players and games is host-only.
              </p>
              <input
                type="email"
                autoComplete="username"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={busy || !email || !password}
                className="w-full h-[48px] rounded-lg font-bold party-cta disabled:opacity-50"
              >
                {busy ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}
        </div>
      </div>
    </KioskLayout>
  )
}
