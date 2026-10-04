// 這個檔案是 ES module，負責跟 Firebase（Firestore + Google 登入）溝通，
// 透過 window.CloudSave / window.CloudAuth 把方法暴露給 app.js（一般 script）
// 使用。詳細設定步驟請看 firebase-config.js。

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFunctions, httpsCallable,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-functions.js";

let app = null;
let db = null;
let auth = null;
let provider = null;
let functionsInstance = null;

function isConfigured() {
  const cfg = window.FIREBASE_CONFIG;
  return !!(cfg && cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY");
}

function toPlainUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    displayName: user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || "",
  };
}

function ensureApp() {
  if (app) return app;
  if (!isConfigured()) {
    throw new Error("尚未設定 Firebase，請先依照 firebase-config.js 裡的教學設定好。");
  }
  try {
    app = initializeApp(window.FIREBASE_CONFIG);
    db = getFirestore(app);
    auth = getAuth(app);
    functionsInstance = getFunctions(app);
    provider = new GoogleAuthProvider();

    // Tell app.js (a plain classic script, loaded separately from this
    // module) whenever the signed-in user changes, via a CustomEvent —
    // this avoids needing app.js itself to be a module.
    onAuthStateChanged(auth, (user) => {
      window.dispatchEvent(new CustomEvent("cloud-auth-changed", { detail: toPlainUser(user) }));
    });

    window.CloudAuth = {
      signIn: () => signInWithPopup(auth, provider),
      signOut: () => signOut(auth),
      currentUser: () => toPlainUser(auth.currentUser),
    };
  } catch (e) {
    app = null;
    throw new Error("Firebase 初始化失敗，請確認 firebase-config.js 裡的設定值是否正確：" + e.message);
  }
  return app;
}

window.CloudSave = {
  isConfigured,
  async save(payload) {
    ensureApp();
    const uid = auth.currentUser && auth.currentUser.uid;
    if (!uid) throw new Error("尚未登入 Google 帳號。");
    await setDoc(doc(db, "saves", uid), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  },
  async load() {
    ensureApp();
    const uid = auth.currentUser && auth.currentUser.uid;
    if (!uid) throw new Error("尚未登入 Google 帳號。");
    const snap = await getDoc(doc(db, "saves", uid));
    return snap.exists() ? snap.data() : null;
  },
};

// Thin wrapper around the one callable Cloud Function this project ships
// (functions/index.js: updateRedirectUri). The backend itself re-checks
// that the signed-in uid is the configured OWNER_UID — this client just
// surfaces a friendlier error if someone who isn't signed in tries it.
window.CloudFunctions = {
  async updateInfiniteAlchemyRedirectUri(redirectUri) {
    ensureApp();
    if (!(auth.currentUser)) throw new Error("請先用 Google 帳號登入。");
    const call = httpsCallable(functionsInstance, "updateRedirectUri");
    const result = await call({ redirect_uri: redirectUri });
    return result.data;
  },
};

// Initialize as soon as this module loads (if configured) so the
// onAuthStateChanged listener attaches immediately — this is what lets a
// returning visitor's existing Google session auto-fire a
// "cloud-auth-changed" event without them clicking anything.
if (isConfigured()) {
  try { ensureApp(); } catch (e) { /* app.js will surface this via isConfigured() checks */ }
}
