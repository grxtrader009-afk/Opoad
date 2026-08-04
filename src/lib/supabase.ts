import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env",
  );
}

// Node.js < 21 has no native WebSocket. Polyfill for Supabase realtime in SSR.
// import.meta.env.SSR is tree-shaken away in the browser bundle so `ws` is
// never included in the client build.
if (import.meta.env.SSR && typeof globalThis.WebSocket === "undefined") {
  const { WebSocket: WS } = await import("ws");
  (globalThis as Record<string, unknown>).WebSocket = WS;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Project = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};
