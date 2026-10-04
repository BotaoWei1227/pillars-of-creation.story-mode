/*
  Firebase Cloud Functions backend — the ONLY place the Infinite Alchemy
  Server Secret is allowed to exist. This file never sends the secret to
  a client; it only uses it to call the Server API on the developer's
  explicit, authenticated request.

  Per the kit's SKILL.md hard boundaries, this code does NOT:
  - create applications, rotate credentials, or submit reviews
  - issue rewards
  - change live settings on its own initiative

  It exposes exactly one callable action (updateRedirectUri) that a signed-in
  owner can trigger manually, once, after deployment — nothing runs
  automatically.

  ── Setup ──────────────────────────────────────────────────────────────
  1. From this functions/ directory:
       firebase functions:secrets:set INFINITE_ALCHEMY_SERVER_SECRET
     Paste the Server Secret shown ONCE in Developer Center's copy bundle.
     Never put it in a .env file, source file, or the browser.
  2. Set INFINITE_ALCHEMY_CLIENT_ID and OWNER_UID below via Firebase config
     (see the firebase.json / deploy notes in INFINITE_ALCHEMY_SETUP.md) —
     these are not secret, but keeping them as deploy-time params avoids
     hardcoding per-environment values into source.
  3. Deploy: firebase deploy --only functions
  4. Sign in to the mini-game with the Google account whose uid matches
     OWNER_UID, open Settings, and trigger the redirect URI update from
     there (or call this function directly with the Firebase CLI/SDK).
*/

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

const INFINITE_ALCHEMY_SERVER_SECRET = defineSecret("INFINITE_ALCHEMY_SERVER_SECRET");
const INFINITE_ALCHEMY_CLIENT_ID = defineString("INFINITE_ALCHEMY_CLIENT_ID");
const INFINITE_ALCHEMY_BASE_URL = defineString("INFINITE_ALCHEMY_BASE_URL", {
  default: "https://pillars-of-creation.funtuan.work/",
});
// The only Firebase Auth uid allowed to trigger this function — set this to
// your own account's uid so a stranger who somehow calls this function
// can't repoint your app's OAuth redirect URI.
const OWNER_UID = defineString("OWNER_UID");

/**
 * Callable: updateRedirectUri({ redirect_uri: string })
 *
 * Requires the caller to be signed in (Firebase Auth) as OWNER_UID. Calls
 * PUT /developer-server/v1/app/redirect-uri on the Infinite Alchemy
 * Developer Platform using the Server Secret, per
 * references/api-reference.md. Returns the platform's own response;
 * never returns the secret.
 */
exports.updateRedirectUri = onCall(
  { secrets: [INFINITE_ALCHEMY_SERVER_SECRET], cors: true },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError("unauthenticated", "請先用你的 Google 帳號登入再執行這個動作。");
    }
    const ownerUid = OWNER_UID.value();
    if (!ownerUid || request.auth.uid !== ownerUid) {
      throw new HttpsError("permission-denied", "只有專案擁有者可以更新 Redirect URI。");
    }

    const redirectUri = request.data && request.data.redirect_uri;
    if (typeof redirectUri !== "string" || !/^https?:\/\/[^\s#]+$/.test(redirectUri)) {
      throw new HttpsError(
        "invalid-argument",
        "redirect_uri 必須是一個完整的 http(s) URL，且不包含雜湊片段。"
      );
    }

    const base = INFINITE_ALCHEMY_BASE_URL.value();
    const clientId = INFINITE_ALCHEMY_CLIENT_ID.value();
    if (!clientId) {
      throw new HttpsError("failed-precondition", "尚未設定 INFINITE_ALCHEMY_CLIENT_ID。");
    }

    const url = new URL("developer-server/v1/app/redirect-uri", base);
    let res;
    try {
      res = await fetchWithTimeout(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Client-ID": clientId,
          Authorization: `Bearer ${INFINITE_ALCHEMY_SERVER_SECRET.value()}`,
        },
        body: JSON.stringify({ redirect_uri: redirectUri }),
      });
    } catch (e) {
      logger.error("redirect-uri update network error", { message: e.message });
      throw new HttpsError("unavailable", "連線到 Infinite Alchemy 失敗，請稍後再試。");
    }

    const data = await res.json().catch(() => null);

    if (res.status === 401) {
      logger.error("redirect-uri update: invalid_client — Server Secret may be wrong/rotated");
      throw new HttpsError("failed-precondition", "Server Secret 無效，請確認是否過期或已被重新產生。");
    }
    if (res.status === 429) {
      throw new HttpsError("resource-exhausted", "Server API 請求過於頻繁，請稍後再試。");
    }
    if (!res.ok || !data) {
      const code = (data && data.code) || `http_${res.status}`;
      const msg = (data && data.error) || `HTTP ${res.status}`;
      logger.error("redirect-uri update failed", { code, status: res.status });
      throw new HttpsError("internal", `更新失敗（${code}）：${msg}`);
    }

    logger.info("redirect-uri updated", { redirect_uri: data.redirect_uri, by: request.auth.uid });
    return { redirect_uri: data.redirect_uri, updated_at: data.updated_at };
  }
);

function fetchWithTimeout(url, options, ms = 10000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(t));
}
