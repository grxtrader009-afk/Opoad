---
name: Supabase SSR WebSocket polyfill
description: How to fix "Node.js detected but native WebSocket not found" in a Vite SSR / TanStack Start app running on Node 20.
---

# Supabase SSR WebSocket polyfill

## The Rule
Polyfill `globalThis.WebSocket` **inside `src/lib/supabase.ts`** using a top-level `await import("ws")` guarded by `import.meta.env.SSR`. Do NOT put it in `src/server.ts` — Vite's SSR module runner evaluates route modules in an isolated context and doesn't share the server entry's globals at evaluation time.

```ts
// src/lib/supabase.ts — top-level await, guarded so ws is never bundled for browser
if (import.meta.env.SSR && typeof globalThis.WebSocket === "undefined") {
  const { WebSocket: WS } = await import("ws");
  (globalThis as Record<string, unknown>).WebSocket = WS;
}
```

**Why:** `@supabase/realtime-js` checks `globalThis.WebSocket` inside `createClient`. Node 20 doesn't have it natively (added in Node 21). Vite's `ESModulesEvaluator.runInlinedModule` runs route modules in a context where changes to `globalThis` made in `server.ts` are NOT visible at the time supabase.ts is first evaluated.

**How to apply:** Any time Supabase is initialized on the server in a Vite SSR project running Node < 21. The `import.meta.env.SSR` guard ensures Vite tree-shakes the `ws` import from the browser bundle entirely.
