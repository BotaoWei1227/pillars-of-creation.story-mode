/*
  ── Firebase 設定教學（跨裝置雲端存檔用）────────────────────────

  1. 前往 https://console.firebase.google.com/ ，用 Google 帳號登入，
     建立一個新專案（免費方案 Spark 即可，不需要信用卡）。

  2. 左側選單「建構」→「Firestore Database」→「建立資料庫」，
     位置隨意選，模式先選「以測試模式啟動」即可（之後可依下方規則調整）。

  3. 左側齒輪「專案設定」→ 最下面「你的應用程式」→ 點網頁圖示 </> 新增一個
     網頁應用程式（不用勾 Firebase Hosting）。建立後畫面會出現一段
     firebaseConfig 設定值，把裡面的內容貼到下面 window.FIREBASE_CONFIG。

  4. 到 Firestore Database →「規則」分頁，把規則改成：

       rules_version = '2';
       service cloud.firestore {
         match /databases/{database}/documents {
           match /saves/{code} {
             allow read, write: if true;
           }
         }
       }

     ⚠️ 注意：這組規則代表「任何知道存檔代碼的人」都能讀寫那一筆存檔，
     沒有額外的帳號登入驗證。存檔代碼本身是又長又隨機的亂碼，陌生人
     基本上不可能猜到，但請不要把代碼公開分享給不信任的對象，也不要
     用這個系統存放任何重要的個資。這是為了讓完全不會寫後端的人也能
     簡單做到「輸入代碼就能跨裝置讀存檔」而採用的最簡單做法。

  5. 把下面六個 "YOUR_..." 換成你自己 Firebase 專案的實際值，存檔後
     重新整理網頁，右上角 ⚙️ 設定視窗裡就會出現「☁️ 雲端存檔」功能。

  完全不想用雲端存檔也沒關係——不改這個檔案，遊戲一樣正常運作，
  只是只能用匯出/匯入 JSON 檔的方式手動搬存檔，無法直接用代碼同步。
*/

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDgw-stb4gQxbdV86SpUFbWTBDhGwBpMCs",
  authDomain: "infinite-story-1bc1d.firebaseapp.com",
  projectId: "infinite-story-1bc1d",
  storageBucket: "infinite-story-1bc1d.firebasestorage.app",
  messagingSenderId: "995298604571",
  appId: "1:995298604571:web:e59849b0aa5d7d5cb86abe",
};
