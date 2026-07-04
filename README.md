# Sid Automation Lab — Static Site

Weebly 導出後重構為純靜態站，部署於 [Vercel](https://vercel.com)。
已內化所有依賴（Weebly CDN、字型、計數器外掛），無第三方 build 步驟。

---

## 📁 目錄結構

```
Sid Automation Lab/
├─ *.html                 ← 17 個靜態頁面（16 Weebly + 1 search.html）
├─ favicon.svg
├─ robots.txt             ← 搜尋引擎指示
├─ sitemap.xml            ← 18 條 URL，lastmod 由 build-sitemap.mjs 自動填
├─ ads.txt                ← Google AdSense 發布商驗證
├─ search-index.json      ← fuzzy 搜尋索引（17 個頁面）
├─ vercel.json            ← Vercel 部署設定（cleanUrls, headers, cache）
├─ .gitignore
│
├─ apps/                  ← Flash SWF（保留但不主動播放，現代瀏覽器不支援）
│  └─ audioPlayer2.swf
│
├─ files/                 ← 站內靜態資源
│  ├─ main_style.css      ← 主題 stylesheet
│  ├─ search.js           ← 站內 fuzzy 搜尋（內含 fuse.js lazy loader）
│  ├─ slideshow-local.js  ← 取代 Weebly 原 wSlideshow，自包含輪播
│  ├─ file_icons/
│  │  └─ gz.png           ← Weebly 內建 ZIP icon，內化防止外連失效
│  ├─ cdn_local/          ← 從 Weebly CDN 下載回來的資源（39 檔）
│  │  ├─ css/sites.css
│  │  ├─ css/old/fancybox.css
│  │  ├─ css/social-icons.css  字型路徑已 rewrite 到 ../fonts/
│  │  ├─ css/old/slideshow/slideshow.css
│  │  ├─ js/jquery-1.8.3.min.js
│  │  ├─ js/site/main.js
│  │  ├─ js/site/main-customer-accounts-site.js
│  │  ├─ js/lang/zh_TW/stl.js
│  │  ├─ js/old/slideshow-jq.js  ← 保留但 sidrecoilscript.html 已改用 slideshow-local.js
│  │  ├─ fonts/Cabin/{regular,bold,italic,bolditalic}.{eot,woff2,woff,ttf}
│  │  ├─ fonts/Montserrat/{regular,bold}.{eot,woff2,woff,ttf}
│  │  └─ fonts/wSocial/wsocial.{eot,woff,ttf,svg}
│  └─ theme/
│     └─ files/             ← Weebly 原 themes 路徑
│        ├─ plugins.js     ← 主題功能 plugins
│        ├─ custom.js
│        ├─ mobile.js
│        ├─ manifest.json
│        └─ images/        ← 表單 sprite 圖示
│
├─ uploads/               ← 原內容
│  └─ 7/7/0/3/77032051/
│     └─ background-images/   ← 100 多張背景圖
│     └─ background-images/temp/, thumbs/
│     └─ 2026-*.png/jpg  ← 通用圖片
│     └─ 2026-06-17-140*.png  ← 幻燈片用 3 張
│     └─ safpsg_recoilcontrol_trial.{zip,exe}
│     └─ 硬體序號查詢工具.zip
│
└─ scripts/               ← Node 維運工具
   ├─ build-index.mjs      ← 從 *.html 重建搜尋索引
   ├─ build-sitemap.mjs    ← 重建 sitemap.xml（可設 SITE_BASE env var）
   ├─ check-missing.mjs    ← 上線前跑：列出所有 missing 靜態資源
   ├─ download-cdn.mjs     ← 把 Weebly CDN 資源下載到 files/cdn_local/
   ├─ fix-theme-paths.mjs  ← 修 files/theme → files/theme/files 路徑
   ├─ inject-favicon.mjs   ← 注入 favicon 連結到所有 HTML
   ├─ inject-search.mjs    ← 注入 search.js 與 fuse.js loader
   ├─ remove-powr.mjs      ← 移除 Weebly powr-hit-counter 區塊
   ├─ rewrite-html-cdn.mjs ← 改 HTML 內 CDN 引用為本地路徑
   └─ rewrite-links.mjs    ← 改對外站內連結 (lelive.weebly.com) 為本地
```

---

## 🚀 本地啟動

需求：Node 18+（僅用於維運 scripts，不是部署需求）

```powershell
# 本機起 HTTP server
cd "C:\Code play first\Sid Automation Lab"
python -m http.server 8000

# 或用 Node（無需安裝）:
npx http-server -p 8000 -c-1
```

瀏覽器開 `http://localhost:8000/` 看首頁。

---

## 🔧 維運指令

| 任務 | 指令 |
|------|------|
| 上線前檢查 404 | `node scripts/check-missing.mjs` |
| 重新生成搜尋索引 | `node scripts/build-index.mjs` |
| 重新生成 sitemap（自訂網域）| `$env:SITE_BASE="https://你的網域"; node scripts/build-sitemap.mjs` |
| 內化任何漏網 CDN | `node scripts/download-cdn.mjs && node scripts/rewrite-html-cdn.mjs` |

完整遷移歷程與排查，見：
- `MIGRATION_PROMPT.md`  — 給 Agent 的指令包
- `MIGRATION_RISKS.md`   — 風險矩陣 + 修復優先順序
- `DEPLOY_GUIDE.md`      — 部署操作手冊

---

## 📦 部署到 Vercel

### 第一次

1. 在 GitHub 建立空白 repo
2. 把整個專案目錄上傳：
   ```powershell
   git init
   git add .
   git commit -m "Initial commit: Weebly static export, Vercel-ready"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
3. https://vercel.com/new
4. Import Git Repository → 選 repo
5. **Build & Output Settings**：
   - Framework Preset: **Other**
   - Build Command: 留空
   - Output Directory: 留空
6. Deploy

### 之後更新

```powershell
git add .
git commit -m "update: ..."
git push
# Vercel 自動 deploy
```

### 自訂網域

Vercel 後台 → Project → Settings → Domains → 加網域，照指示設定 DNS。
記得把 `sitemap.xml` 重新生成並填入真實網域：

```powershell
$env:SITE_BASE="https://yourdomain.com"
node scripts/build-sitemap.mjs
# 再手動編輯 robots.txt 把 Sitemap URL 換掉
```

---

## ⚠️ 已知限制

| 項目 | 狀態 | 處理建議 |
|------|------|---------|
| Flash SWF（`apps/audioPlayer2.swf`） | 現代瀏覽器不再支援 | 純交付就好，不需修 |
| Google Analytics `UA-131254328-2` | Universal Analytics 已停用，上線後沒數據 | 可改用 GA4 或 GoatCounter |
| `main.js` 內 webpack runtime 仍含 `cdn2.editmysite.com` 字串 | 已由 `STATIC_BASE=''` / `ASSETS_BASE=''` 在 HTML 開頭覆蓋，runtime 不觸發 lazy chunk 載入 | 可接受，少數 page 特效 fallback |
| jQuery 1.8.3 | 主題依賴，無法升級 | 保留 |
| Google AdSense 廣告位 | 需驗證發布商帳號 | ads.txt 已備齊 |
| 桌面圖示（favicon） | SVG 241 bytes | 風格簡潔但與原本不同 |

---

## 🧪 驗收清單（部署後跑）

- [ ] 17 個 HTML 全部 200
- [ ] 沒有 `http://` mixed content
- [ ] 沒有 404 圖片、Favicon、JS、CSS
- [ ] 主題 CSS / 字型 / 選單可正確渲染
- [ ] 站內搜尋在 `/search.html?q=Path` 顯示結果
- [ ] `sidrecoilscript.html` 內可見 3 張輪播
- [ ] 至少 1 個 ZIP 可下載
- [ ] Lighthouse Performance ≥ 70（改善目標 85+）
- [ ] Lighthouse SEO ≥ 90
- [ ] robots.txt / sitemap.xml 可被 `yourdomain.com/robots.txt` 訪問

---

© 2026 SID · 獨立自動化開發者
