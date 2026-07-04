# Agent.md — Sid Automation Lab 遷移協作指南

> 接手這份專案的 AI Agent 必讀。內容由本次遷移 PM 整理。

---

## 🎯 專案目標

把 Weebly 匯出的靜態站完整搬遷到 Vercel：
- 視覺與原作者一致
- 行為與功能不退步
- 0 個破壞性外部依賴
- Vercel 上線即用（無 build step）

---

## 🧠 上下文：這個專案是什麼狀況

1. **源頭**：Weebly 導出。HTML 是「拼裝式」靜態頁，內含大量 inline JS、Weebly 主題 class、商業外掛（powr-hit-counter）、外部 CDN 引用。
2. **當前狀態（截至本 agent.md 寫成時）**：
   - ✅ 所有 Mixed content 已轉 https
   - ✅ 所有 Weebly CDN 引用已內化到 `files/cdn_local/`（39 檔，2 MB）
   - ✅ 字型（Cabin / Montserrat / wsocial）已內化
   - ✅ 自包含 fuzzy 搜尋（`search.html` + `search.js` + `search-index.json`）
   - ✅ 自包含輪播（`slideshow-local.js`，取代 Weebly `wSlideshow`）
   - ✅ Weebly footer 推廣已移除
   - ✅ Weebly 的 `powr-hit-counter` 外部計數器已清
   - ✅ Map typo `var var` 已修
   - ✅ `files/theme/` → `files/theme/files/` 路徑已統一
   - ✅ favicon 注入
   - ✅ robots.txt / sitemap.xml / ads.txt 完成
3. **剩餘**：
   - Google Analytics `UA-131254328-2` 仍指向已死的 Universal Analytics（不影響渲染）
   - `googletagmanager` 廣告可能因 `ERR_BLOCKED_BY_CLIENT` 擋（廣告攔截器預期）
   - `powr` 已清乾淨，但被刪除的 `<div>` 包裝可能留 **過剩 `</div>`** — 瀏覽器容忍
   - ~~`sidexiletoolbox.html` 缺 3 張 demo 圖~~ → 已於 2026-07-05 補回（`1847905122_2.png` / `1029564595_2.jpg` / `1003025771_2.jpg`，檔案本來就在 uploads/，純接線）
   - ~~`sidpayfor.html` WeChat QR 卡片區塊內只剩空 `<a></a>` 殼~~ → 已於 2026-07-05 修復；順帶發現並修掉「巢狀 `<html>`」結構債（詳見下方版本紀錄 v1.2）

---

## 🚫 接手時的紅線

| 不要動 | 原因 |
|--------|------|
| `search-index.json` 之外的人工編輯 | 由 `build-index.mjs` 自動生成；下次跑就覆蓋 |
| `vercel.json` 內 `cleanUrls: true` | 已驗證正常 |
| `cdn_local/` 內檔案結構 | 對應路徑已被 16 個 HTML 鎖定；改名 = 全部 404 |
| `slideshow-local.js` 內 `window.wSlideshow.__sid_local__` 旗標 | 多重 include 守門員 |
| 主題版本（jQuery 1.8.3） | main.js 依賴，不可升 |

---

## ✅ 接手時的常見任務

### 任務 A：更新 sitemap 換成真實網域

```powershell
$env:SITE_BASE="https://your-real-domain.com"
node scripts\build-sitemap.mjs
# 手動編輯 robots.txt 把 Sitemap: URL 也換
```

### 任務 B：新增一個 HTML 頁面或修改現有

- 新增後跑 `node scripts\build-index.mjs` 重建索引
- 同時跑 `node scripts\build-sitemap.mjs` 加入 sitemap
- 同時跑 `node scripts\check-missing.mjs` 確認無 404

### 任務 C：替換下載檔（ZIP/EXE）

直接覆蓋 `uploads/7/7/0/3/77032051/safpsg_recoilcontrol_trial.zip`。
注意 `.gitattributes` 內需設定 binary：

```gitattributes
uploads/**/*.zip binary
uploads/**/*.exe binary
```

### 任務 D：擴增內化 CDN 資源（例如新外部 font）

1. `node scripts\download-cdn.mjs` 內加 URL 列表
2. 跑下載
3. 跑 `scripts\rewrite-html-cdn.mjs` 改 HTML 引用

### 任務 E：使用者回報「幻燈片沒出現」

依序排查：
1. F12 Console → 是否有 `search.js` 或 `slideshow-local.js` 載入失敗
2. F12 Network → 看 `200`/`404` 對應
3. 看 `sidrecoilscript.html` line 832 的 init() 是否被呼叫（搜 wSlideshow.render 設中斷點）
4. 圖片 URL → 取 console.log `imgs` array 對 `/uploads/7/7/0/3/77032051/2026-06-17-*` 是否成功

---

## 🔍 環境與工作目錄

- **工作目錄**：`C:\Code play first\Sid Automation Lab`
- **平台**：Windows 11、PowerShell
- **Shell 建議**：優先使用 **`pwsh`**（PowerShell 7+，跨平台版）而非舊版 `powershell.exe`（Windows PowerShell 5.1）
  - 原因：`pwsh` 預設以 **UTF-8** 處理輸出入，中文檔名、中文 commit message、`Write-Host` 印中文字串在 `pwsh` 下不易出現亂碼；舊版 `powershell.exe` 預設仍用系統 ANSI code page（繁中 Windows 常為 Big5），中文字元容易在管線輸出或寫檔時變亂碼
  - 若環境沒有 `pwsh`，執行 Agent 應先跑 `pwsh -v` 確認是否已安裝；沒有的話回退用 `powershell.exe`，但建議額外加 `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` 或在指令前加 `chcp 65001`，降低中文亂碼風險
  - 本文件與其他 `.md` 內既有的 ```powershell``` 程式碼區塊，實務上可直接用 `pwsh` 執行，語法相容
- **Node**：v18+（已驗證 v24.15.0 可用）
- **Python**：3.12+（本機驗證效能用）

---

## 📜 文件索引

| 文件 | 讀者 | 何時用 |
|------|------|--------|
| `README.md` | PM / Agent / User | 專案總覽 |
| `AGENT.md` | Agent | 本檔；接手時速讀 |
| `MIGRATION_PROMPT.md` | Agent（執行者） | 完整 Weebly→Vercel 遷移指令、注意事項、Troubleshooting |
| `MIGRATION_RISKS.md` | PM | 風險矩陣、優先順序 |
| `DEPLOY_GUIDE.md` | Agent / 部署者 | Vercel CLI 操作步驟、復原 |

---

## 🧪 標準工作流程（修改後）

```powershell
cd "C:\Code play first\Sid Automation Lab"

# 1. 改 HTML / 改 CSS / 改 JS

# 2. 重新生成衍生檔
node scripts\build-index.mjs
node scripts\build-sitemap.mjs

# 3. 檢查孤兒引用
node scripts\check-missing.mjs
# => 期望輸出：missing 0 file reference(s)：

# 4. 本機驗證
python -m http.server 8000
# http://localhost:8000/<某頁>.html

# 5. 確認無紅字
# F12 → Console → 無 Error

# 6. git push 觸發 Vercel 自動部署
git add .; git commit -m "..."; git push
```

---

## 🆘 常見失敗模式 → 解方

| 症狀 | 看哪個檔 | 解方 |
|------|---------|------|
| F12 報 `Uncaught SyntaxError` 在 `search.js` | `files/search.js:27` | 檢查是否又被誤編 smart quote（`'` vs `'`）|
| 圖片 404 但檔案在 | 確認 zip 解後路徑 | 可能是 `background-images/background-images/` 雙層 → 跑 `ls uploads\7\7\0\3\77032051\background-images` 看 |
| 部署後字型沒套用 | `files/cdn_local/css/social-icons.css` | 內部 `@font-face` 是否仍含 `//cdn2.editmysite.com`（應為 `../fonts/wSocial/...`）|
| main.js / main-customer-accounts-site.js 404 | `files/cdn_local/js/` | 確認內化沒漏，這兩個檔 469 + 521 KB |
| 部署到 Vercel 整站 OK 但 `/search.html` 500 | — | 確認 `search-index.json` 有上傳 |
| ZIP 下載壞掉 | Git attribute | 設定 `*.zip binary` 配合 Git LFS 或直接進 Vercel CLI |
| 圖片「太小」 | `files/slideshow-local.js` 的 aspect-ratio | 看 container 寬度推算，是否被某父層壓扁 |
| 終端機印中文變亂碼（????或亂符號） | 目前 shell 是否為 `powershell.exe` | 改用 `pwsh` 執行同一段指令；或跑 `chcp 65001` + `$OutputEncoding = [System.Text.Encoding]::UTF8` 後再試 |
| `git commit` 中文訊息在 log 顯示亂碼 | Git 設定 | 跑 `git config --global core.quotepath false` 與 `git config --global i18n.commitEncoding utf-8`，並確認用 `pwsh` 操作 |
| Node 腳本讀寫含中文的檔名/路徑失敗 | 執行環境的 code page | 用 `pwsh` 執行（UTF-8 預設），避免用舊版 `powershell.exe` 直接跑 |

---

## 🤝 與 PM 互動的習慣

- PM 給的指令通常是「批次修一批對的東西」。執行 Agent 不必發明新東西；按既有工具交付。
- PM 偏好 built-in tool 跑（`pwsh` + Node + Python），不引入大型框架；中文輸出/檔名一律優先用 `pwsh` 執行，避免舊版 `powershell.exe` 編碼問題。
- 重要改動前，跑 `node scripts\check-missing.mjs` 確認狀態。
- 報告完成時，附上 `missing 0` 證據。

---

## 🗓️ 版本

- v1.0：完整 Weebly → Vercel 遷移，含內化、本地化、SEO 賦能、修缺檔、幻燈片本地化（2026-07-04）
- v1.1：新增 `pwsh` 使用建議（中文編碼更穩定），補充中文亂碼相關 Troubleshooting（2026-07-04）
- v1.2：修復 `sidpayfor.html` 巢狀 `<html>` 結構債（原本內嵌了一份完整獨立 HTML 文件，造成雙重 head/body/html 標籤）；WeChat 改列為「02 / 聯繫作者領取授權」的第二聯繫管道（給無法用 FB 的使用者）；移除「真的有在運作的網站啊」GIF 段落（素材已由使用者確認捨棄）；`sidexiletoolbox.html` 補回 3 張示範截圖（2026-07-05）
