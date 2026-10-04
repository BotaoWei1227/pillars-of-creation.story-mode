/*
  ── Firebase 設定教學（Google 帳號登入＋跨裝置雲端存檔用）──────────

  1. 前往 https://console.firebase.google.com/ ，用 Google 帳號登入，
     建立一個新專案（免費方案 Spark 即可，不需要信用卡）。

  2. 左側選單「建構」→「Firestore Database」→「建立資料庫」，
     位置隨意選，模式先選「以測試模式啟動」即可（下面會換成正式規則）。

  3. 左側選單「建構」→「Authentication」→「開始使用」，在「Sign-in method」
     分頁點「Google」，啟用它，選一個支援電子郵件（一般就是你自己的
     Google 帳號）當作專案的聯絡信箱，儲存。

  4. 還在 Authentication 裡，點上方「Settings」分頁 →「已授權網域」，
     確認你的 GitHub Pages 網域有在清單裡（例如 your-name.github.io）。
     本機測試用的 localhost 預設就有，通常不用額外加。

  5. 左上角齒輪圖示 →「專案設定」→ 最下面「你的應用程式」→ 點網頁圖示
     </> 新增一個網頁應用程式（不用勾 Firebase Hosting）。建立後畫面會
     出現一段 firebaseConfig 設定值，把裡面的內容貼到下面
     window.FIREBASE_CONFIG。

  6. 回 Firestore Database →「規則」分頁，把規則改成：

       rules_version = '2';
       service cloud.firestore {
         match /databases/{database}/documents {
           match /saves/{uid} {
             allow read, write: if request.auth != null && request.auth.uid == uid;
           }
         }
       }

     這組規則代表「只有登入該 Google 帳號的本人」才能讀寫自己的那份存檔，
     其他任何人（包含沒登入的訪客）都不能讀寫，比先前的代碼系統更安全。
     設定完按「發布」。

  7. 把下面六個 "YOUR_..." 換成你自己 Firebase 專案的實際值，存檔後
     重新整理網頁，右上角 ⚙️ 設定視窗裡就會出現「🔑 使用 Google 帳號
     登入」的按鈕。

  完全不想用雲端存檔也沒關係——不改這個檔案，遊戲一樣正常運作，
  只是只能用匯出/匯入 JSON 檔的方式手動搬存檔，無法自動跨裝置同步。
*/

window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
