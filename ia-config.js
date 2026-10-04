/*
  ── Infinite Alchemy Developer Platform — client config ──────────────────

  Client ID is PUBLIC (it's meant to be visible in browser code — the thing
  that must never appear here is the Server Secret). Follow the setup
  runbook (INFINITE_ALCHEMY_SETUP.md) to get your own Client ID:

  1. Sign in to Infinite Alchemy with a Google-bound player account.
  2. Open https://pillars-of-creation.funtuan.work/developer and apply for
     an application. A redirect URI is NOT required at this step.
  3. Once approved, come back here and paste the Client ID below.
  4. Deploy this site, then come back to the "🔗 連接 Infinite Alchemy"
     section in ⚙️ 設定 and register the exact deployed URL as the redirect
     URI in Developer Center (or via the Server API — see the Firebase
     Functions backend in /functions for that, which needs the Server
     Secret and must never run in the browser).

  This mini-game only requests the `profile` and `inventory.read` scopes —
  the minimum needed to let a player import their own crafted items. It
  never requests `inventions.read`, `history.read`, or any reward scope.
*/

window.INFINITE_ALCHEMY_CONFIG = {
  baseUrl: "https://pillars-of-creation.funtuan.work/",
  clientId: "ia_DkgDHbWodg043UgSU0HfoegU",
  // Exact redirect URI this app will present during OAuth. Defaults to the
  // page's own deployed URL (origin + path, no query/hash) so it auto-matches
  // wherever you actually host it (localhost while developing, GitHub Pages
  // in production) — just make sure whatever this resolves to in production
  // is EXACTLY what you register in Developer Center.
  redirectUri: window.location.origin + window.location.pathname,
  scopes: "profile inventory.read",
};
