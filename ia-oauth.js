/*
  Infinite Alchemy Developer Platform — browser-only OAuth (Authorization
  Code + PKCE S256) and read-only Developer API client.

  This file deliberately has NO Server Secret and makes NO Server API
  calls — those require a backend (see /functions) and must never run in
  the browser. Everything here only needs the public Client ID and the
  player's own OAuth access token.

  Follows references/implementation-patterns.md's "Read-only browser
  mini-game" pattern and its PKCE helper example (Web Crypto, not
  Math.random).
*/

(function () {
  const SS_STATE = "ia_oauth_state";
  const SS_VERIFIER = "ia_oauth_verifier";

  // Token is kept in memory only (module closure), per the skill's guidance
  // to avoid long-lived persistent storage of access tokens. It does not
  // survive a page reload — reconnecting is one click (no re-approval
  // needed unless the player revoked access).
  let accessToken = null;
  let tokenExpiresAt = 0;
  let profileCache = null;

  function cfg() {
    return window.INFINITE_ALCHEMY_CONFIG || null;
  }

  function isConfigured() {
    const c = cfg();
    return !!(c && c.clientId && c.clientId !== "YOUR_CLIENT_ID");
  }

  // --- PKCE helpers (verbatim pattern from implementation-patterns.md) ---
  function base64url(bytes) {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function randomUrlSafe(bytes) {
    const value = new Uint8Array(bytes || 32);
    crypto.getRandomValues(value);
    return base64url(value);
  }
  async function createPkce() {
    const verifier = randomUrlSafe(32);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    return { state: randomUrlSafe(24), verifier, challenge: base64url(new Uint8Array(digest)) };
  }

  // --- begin OAuth: redirect the player to the authorize screen ---
  async function beginAuth() {
    if (!isConfigured()) throw new Error("NOT_CONFIGURED");
    const c = cfg();
    const { state, verifier, challenge } = await createPkce();
    sessionStorage.setItem(SS_STATE, state);
    sessionStorage.setItem(SS_VERIFIER, verifier);
    const url = new URL("oauth/authorize", c.baseUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", c.clientId);
    url.searchParams.set("redirect_uri", c.redirectUri);
    url.searchParams.set("scope", c.scopes);
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    window.location.href = url.toString();
  }

  // --- handle the redirect back from the authorize screen, if present ---
  // Returns "connected" | "denied" | "state_mismatch" | null (nothing to do).
  async function handleCallbackIfPresent() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const state = params.get("state");
    if (!code && !error) return null;

    // Always scrub the callback query out of the visible URL/history,
    // regardless of outcome, so a reload doesn't replay a used code.
    const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);

    const savedState = sessionStorage.getItem(SS_STATE);
    const verifier = sessionStorage.getItem(SS_VERIFIER);
    sessionStorage.removeItem(SS_STATE);
    sessionStorage.removeItem(SS_VERIFIER);

    if (error) return "denied";
    if (!state || state !== savedState) return "state_mismatch";
    if (!verifier) return "state_mismatch";

    const c = cfg();
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: c.clientId,
      code,
      redirect_uri: c.redirectUri,
      code_verifier: verifier,
    });
    const res = await fetch(new URL("developer-api/oauth/token", c.baseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || !data.access_token) {
      throw new Error((data && data.error) || `token_exchange_failed_${res.status}`);
    }
    accessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
    profileCache = null;
    return "connected";
  }

  function isConnected() {
    return !!accessToken && Date.now() < tokenExpiresAt;
  }

  function disconnect() {
    accessToken = null;
    tokenExpiresAt = 0;
    profileCache = null;
  }

  // --- Developer API calls (player-authorized, Bearer access token) ---
  async function apiGet(path, searchParams) {
    if (!isConnected()) throw new Error("NOT_CONNECTED");
    const c = cfg();
    const url = new URL(path, c.baseUrl);
    if (searchParams) for (const [k, v] of Object.entries(searchParams)) url.searchParams.set(k, v);
    const res = await fetchWithTimeout(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json().catch(() => null);
    if (res.status === 401) {
      disconnect();
      const err = new Error((data && data.error) || "invalid_token");
      err.code = "invalid_token";
      throw err;
    }
    if (res.status === 429) {
      const err = new Error((data && data.error) || "rate_limited");
      err.code = "rate_limited";
      throw err;
    }
    if (!res.ok || !data) {
      const err = new Error((data && data.error) || `http_${res.status}`);
      err.code = (data && data.code) || `http_${res.status}`;
      throw err;
    }
    return data;
  }

  function fetchWithTimeout(url, options, ms) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), ms || 10000);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(t));
  }

  async function getProfile(force) {
    if (profileCache && !force) return profileCache;
    profileCache = await apiGet("developer-api/v1/me");
    return profileCache;
  }

  // Fetches the player's full inventory, following nextOffset. Capped at a
  // generous number of pages so a pathological response can't hang the UI.
  async function fetchInventory() {
    const items = [];
    let offset = 0;
    for (let page = 0; page < 20; page++) {
      const data = await apiGet("developer-api/v1/inventory", { limit: 100, offset });
      items.push(...(data.items || []));
      if (data.nextOffset == null) break;
      offset = data.nextOffset;
    }
    return items;
  }

  window.IAOAuth = {
    isConfigured,
    beginAuth,
    handleCallbackIfPresent,
    isConnected,
    disconnect,
    getProfile,
    fetchInventory,
  };
})();
