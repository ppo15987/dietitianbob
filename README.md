# 淙淙健康抽獎

繁體中文抽獎 Web App。前端直接部署到 GitHub Pages，正式資料由 Firebase Authentication 與 Cloud Firestore 保護。不需要前端建置，也不會把帳號密碼寫在程式碼裡。

## 已實作

- 3D 球面名單持續旋轉、抽獎加速、得獎揭曉及紙花效果；支援暫停與減少動態效果偏好。
- 後台一次貼上最多 1,000 人，每行一人；忽略空白行並去除完全相同的整行。
- 新增與刪除獎項，每獎項 1–1,000 份，最多 100 個獎項；有得獎紀錄的獎項不可刪除。
- 每次抽 1–50 位；每位參與者在同一場活動最多中獎一次。
- 得獎紀錄搜尋、CSV 匯出、台北時間顯示；清空活動前二次確認。
- Email／密碼登入、管理員白名單、跨裝置活動同步。
- GitHub Actions 測試及 Pages 自動部署。
- 未設定 Firebase 時可手動進入本機示範模式；正式設定存在時不開放示範入口。

## 目前交付狀態

原始碼已完成。6 組核心邏輯驗證通過，本機 HTTP 預覽回傳 200。
GitHub 儲存庫：`ppo15987/dietitianbob`。Pages 啟用及真實 Firebase 連線仍待完成。
目前環境的瀏覽器控制無法連線，尚未完成實際桌面／手機視覺與端對端操作驗證，也未執行 Firebase Emulator 規則測試。正式活動前請完成下方驗收。

## 快速預覽

在 Node.js 22 環境執行 `npm test` 可執行核心測試。
用任何靜態 HTTP 伺服器服務 `public/`，例如：

```sh
python3 -m http.server 4173 --directory public
```

瀏覽 `http://localhost:4173`，點「體驗示範活動」。不要以 `file://` 直接開啟，ES Modules 需要 HTTP 服務。示範使用 Web Locks 與 Web Crypto，需要現代瀏覽器及 HTTPS／localhost；示範資料只存在瀏覽器的 localStorage，不能當成正式活動備份。

## 第一次正式設定

### 1. 建立獨立 Firebase 專案

1. 到 [Firebase Console](https://console.firebase.google.com/) 建立專案，新增 Web App。
2. Authentication → Sign-in method → 開啟 **Email/Password**。
3. Authentication → Users → 新增管理員 Email 與密碼。請自行建立密碼，不要放入 GitHub 或對話。
4. 複製該使用者的 UID。
5. 建立 Cloud Firestore（Standard / Native mode），採用正式模式，依需求選擇資料位置。
6. Firestore → Rules：貼入本專案根目錄的 `firestore.rules` 並發布。也可用 Firebase CLI：`firebase deploy --only firestore:rules --project YOUR_PROJECT_ID`。
7. Firestore → Data：建立 collection **admins**，document ID 為剛剛的 **UID**。加入 boolean 欄位 `enabled: true`（白名單判斷以文件存在為準，停權請刪除文件，設 false 不會停權）。只有 Firebase Console 或可信任 Admin SDK 可維護這份白名單，前端不能自行新增權限。
8. 將 Project settings → Your apps 的公開 Firebase 設定，填入 `public/config.js`：

```js
export const firebaseConfig = {
  apiKey: 'YOUR_PUBLIC_WEB_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT',
  appId: 'YOUR_WEB_APP_ID'
};
```

Firebase Web 設定不是管理密鑰，可以放前端；資料權限由 Firestore 規則保護。**絕對不要放 service account JSON、管理金鑰、登入密碼或 GitHub token。**

9. Authentication → Settings → Authorized domains 加入 `ppo15987.github.io`；本機測試時視需要另加 `localhost`。
10. 正式系統沒有自助註冊入口。新增管理員須重複建立帳號及 UID 白名單。

### 2. 建立 GitHub 儲存庫並上線

1. 在你的 GitHub 建立獨立 repository，建議名稱 `dietitianbob`。GitHub Free 的 Pages 通常需公開儲存庫；若使用私人儲存庫，請先確認方案支援。
2. 將本資料夾內全部檔案放到儲存庫根目錄，包含隱藏的 `.github/workflows/pages.yml`。不要只上傳 `public/`。
3. 可使用 GitHub Desktop 將本資料夾發布到新 repository；確認主分支名稱為 `main`。
4. Repository → Settings → Pages → Source 選 **GitHub Actions**。
5. Actions → **Deploy 淙淙健康抽獎 to GitHub Pages** → Run workflow，或推送一次 main。
6. 等待工作流程成功。預期網址為 `https://ppo15987.github.io/dietitianbob/`（僅為預期格式，尚未發布）。
7. 以正式網址登入，匯入名單與獎項。正式名單只進入 Firestore，不需要、也不應提交到 GitHub。

GitHub Pages 僅提供靜態檔案，不會執行後端登入程式；本專案透過 Firebase 進行真正的身分驗證與存取控制。前台頁面程式可被任何人載入，但未授權帳號無法讀寫正式名單或得獎資料。現場投影由管理員登入後切換全螢幕，不提供未登入的公開名單連結。

## 使用流程

1. 管理員登入 → 活動管理。
2. 設定活動標題，從 Excel 複製**單欄**名單，每行一人，儲存。
3. 同名者請加編號，例如 `001 王小明`、`002 王小明`。完全相同的整行視為同一人。
4. 輸入獎項名稱與數量，新增所需獎項。
5. 抽獎舞台 → 選擇獎項 → 輸入本次人數 → 開始抽獎。
6. 系統先提交結果，再播放揭曉。關閉揭曉視窗可繼續抽獎。
7. 抽獎後名單鎖定；得獎者自動離開抽獎池。清空活動前先匯出 CSV。

若動畫途中重新整理，請至「得獎紀錄」查看已提交結果，不要以為動畫未完成就沒有抽出。沒有強制重抽功能，避免活動中任意作廢結果。

## 架構與維護

| 檔案／位置 | 用途 |
| --- | --- |
| `public/index.html` | 舞台、後台、紀錄、登入與得獎對話框 |
| `public/style.css` | 響應式、明暗外觀、球形與揭曉動畫 |
| `public/app.js` | UI 狀態、Firebase 連線、交易、球面旋轉 |
| `public/model.js` | 名單解析、資格與剩餘名額、抽獎、CSV |
| `public/config.js` | Firebase 公開 Web 設定 |
| `firestore.rules` | 管理員資料存取控制 |
| `tests/model.test.mjs` | 抽獎邏輯回歸測試 |
| `.github/workflows/pages.yml` | main 分支測試與部署 |
| Firestore `admins/{uid}` | 管理員白名單 |
| Firestore `events/main` | 單場共用活動、名單、獎項與得獎紀錄 |

所有管理員共用一場活動。活動資料以單一文件儲存，使 Firestore transaction 可原子地確認資格、扣除名額並保存結果；交易衝突會重試，不會只依據畫面上的舊名單抽獎。`batchId` 防止同一請求重送重複記錄，`revision` 防止舊畫面的名單覆蓋或清空新結果。示範模式則使用 Web Locks 保護同一裝置多分頁。

亂數使用 `crypto.getRandomValues`，以拒絕取樣去除取餘偏差；抽中者立即自候選陣列移除。旋轉動畫是呈現效果，不影響每人的抽中機率。

這是信任管理員的活動工具：管理員擁有資料編輯權，抽獎在管理員瀏覽器執行，**不提供第三方可驗證、公證或防止管理員自行改碼的抽獎證明**。若未來需要不可竄改稽核，應把抽獎移至可信任伺服器並加入追加式稽核紀錄。Firestore 規則目前提供角色隔離與文件外層型別／數量限制，並非逐個巢狀元素的完整商業規則驗證。

正式寫入失敗不會退回本機假裝成功；Firestore 使用線上 transaction，離線時應顯示錯誤。登入採 session persistence，關閉分頁／工作階段後需重新登入。此版本需網路，尚未提供離線 PWA 或公開觀眾模式。

Firebase 用量與帳務請在自己的專案設定中確認；本交付未建立付費服務。Firebase SDK 固定為 11.10.0，由 gstatic 動態載入；若要升級請同步驗證登入與 transaction。

## 上線前驗收

- [ ] 桌面 Chrome / Safari 與手機 390px 寬版面無溢出，按鈕可操作。
- [ ] Tab 鍵可以操作導覽、表單、對話框，Escape 可關閉對話框。
- [ ] 系統開啟減少動態效果時，球體停止自轉、紙花不播放。
- [ ] 正確管理員能登入；錯誤密碼、非白名單帳號不能載入活動。
- [ ] 未登入與普通帳號直接存取 Firestore 會被拒絕；前端不能建立 admins 文件。
- [ ] 匯入空行、重複姓名與同名不同編號，預覽人數正確。
- [ ] 加入數個獎項，抽獎數量不超過剩餘名額與待抽人數。
- [ ] 兩個管理員同時抽獎，不重複中獎、不超抽。
- [ ] 斷網抽獎顯示失敗，恢復網路後先查紀錄再重試。
- [ ] 動畫途中刷新，已提交的得獎紀錄仍存在。
- [ ] CSV 在 Excel 正確顯示中文，特殊字元及公式前綴不會直接執行。
- [ ] 全螢幕、關閉揭曉、清空取消與確認流程均正常。

## 設計參考與官方文件

- [Apple Design Skill](https://github.com/dickwu/apple-design-skill)：採用留白、清楚階層、系統字體、44px 操作區與減少動態效果等設計原則；這是 Web App，並非原生 Apple App。
- [Firebase Email / Password](https://firebase.google.com/docs/auth/web/password-auth)
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
