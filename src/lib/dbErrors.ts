/**
 * Turn a Supabase error into a message a guest or the host can act on.
 *
 * supabase-js returns database errors as plain objects ({ code, message }),
 * not Error instances, so `err instanceof Error` checks miss them and fall
 * back to a generic message that hides the cause.
 */
export function describeDbError(err: unknown): string {
  const { code, message } = (err ?? {}) as { code?: string; message?: string }
  const text = message ?? (typeof err === 'string' ? err : '')

  // PostgREST can't find the function: supabase/security.sql hasn't been run
  if (code === 'PGRST202' || /could not find the function/i.test(text)) {
    return "The scoreboard database isn't set up yet (supabase/security.sql)."
  }
  if (code === 'PGRST301' || /jwt expired/i.test(text)) {
    return 'The host sign-in has expired. Sign out and back in.'
  }
  if (code === '42501' || /row-level security|permission denied|admin only/i.test(text)) {
    return 'Only the host can do that.'
  }
  if (/failed to fetch|fetcherror|networkerror|load failed|network request failed/i.test(text)) {
    return "Couldn't reach the scoreboard. Check the Wi-Fi."
  }
  return text || 'Something went wrong'
}

/** An Error carrying the readable message, for code that throws */
export function dbError(err: unknown): Error {
  return new Error(describeDbError(err))
}

/** An update or delete that matched no rows: the database refused it without an error */
export const NOT_SAVED = 'Nothing was saved. Sign out of Manage, sign back in, and try again.'
