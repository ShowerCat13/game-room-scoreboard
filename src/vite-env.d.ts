/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** host:port of the haunt-net hub, e.g. elise-pod.local:8765 (optional) */
  readonly VITE_HAUNT_HUB?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __LOCAL_IP__: string;