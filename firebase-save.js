// 這個檔案是 ES module，負責跟 Firestore 溝通，透過 window.CloudSave
// 把 save(code, payload) / load(code) / isConfigured() 這幾個方法
// 暴露給 app.js（一般 script）使用。詳細設定步驟請看 firebase-config.js。

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let db = null;
let initError = null;

function isConfigured() {
  const cfg = window.FIREBASE_CONFIG;
  return !!(cfg && cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY");
}

function ensureDb() {
  if (db) return db;
  if (!isConfigured()) {
    throw new Error("尚未設定 Firebase，請先依照 firebase-config.js 裡的教學設定好。");
  }
  try {
    const app = initializeApp(window.FIREBASE_CONFIG);
    db = getFirestore(app);
    return db;
  } catch (e) {
    initError = e;
    throw new Error("Firebase 初始化失敗，請確認 firebase-config.js 裡的設定值是否正確：" + e.message);
  }
}

window.CloudSave = {
  isConfigured,
  async save(code, payload) {
    const database = ensureDb();
    await setDoc(doc(database, "saves", code), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  },
  async load(code) {
    const database = ensureDb();
    const snap = await getDoc(doc(database, "saves", code));
    if (!snap.exists()) {
      const err = new Error("NOT_FOUND");
      err.code = "NOT_FOUND";
      throw err;
    }
    return snap.data();
  },
};
