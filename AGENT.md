# Agent.md — Sid Automation Lab 協作指南

> 接手這份專案的 AI Agent 必讀。內容由 PM 維護。

## 一句話定位

> 這是站主 (Sid)「自動化 / 工具作品發布與下載入口」的原始碼 repo。
>
> 站本身同時部署於 GitHub Pages、Vercel 等多個免費平台，目的是**分散曝光與提升可達性**。

---

## 專案目標

**這是一個個人作品工具的曝光平台 repo，不是純測試場，也不是檔案倉庫。**

- 站主最終目標：把分散開發的自動化、遊戲輔助、影像辨識研究與工具集中在一個**有 SEO 的固定入口**，藉由 GitHub Pages / Vercel 等多平台鏡像**提升作品的可達性與曝光率**
- 維護具體目標：保留 Weebly 匯出靜態站的特徵，製作易維護、不改外觀的 static site

---

## 上下文：這個專案是什麼狀況

1. **源頭**：Weebly 導出 → 純靜態無 build step。
2. **當前狀態（截至本 agent.md 寫成時）**：
   - ✅ 所有外部 CDN 已內化到 `files/cdn_local/`（39 檔，2 MB）
   - ✅ 自包含 fuzzy 搜尋（`search.html` + `search.js` + `search-index.json`）
   - ✅ 自包含輪播（`slideshow-local.js`，取代 Weebly `wSlideshow`）
   - ✅ 0 個內部外部關聯斷裂 (`check-missing` = missing 0)
   - ✅ favicon、robots.txt、sitemap.xml、ads.txt 基本 SEO 到位
   - ✅ 聯絡已改為 Google Form（外部分頁）
   - ✅ Gmail 信箱全站清除
   - ✅ 下載已改 Mega mirror，不存 repo
   - ✅ uploads 扁平化(圖床)
   - ✅ GitHub Pages + Vercel-ready（vercel.json）
3. **已知限制**：
   - Google Analytics `UA-131254328-2` (死掉的 UA)，不影響渲染
   - jQuery 1.8.3 主題依賴無法升
   - `main.js` 內含少數 `cdn2.editmysite.com` string（runtime 不觸發，base 已在 HTML 開頭 overwrite)

---

## 紅線

| 不要動 | 原因 |
|---|---|
| `search-index.json` | 由 `build-index.mjs` 自動生成 |
| `vercel.json` `cleanUrls: true` | 已驗證正常 |
| `cdn_local/` 內檔案結構 | 15+ 個 HTML 依賴這些路徑 |
| jQuery 1.8.3 及相關主題 scripts | main.js 依賴 |

---

## 常見任務

### A. 更新 sitemap（換網域時用）
```powershell
$env:SITE_BASE="https://your-real-domain.com"
node scripts/build-sitemap.mjs
```
記得 `robots.txt` 裡 Sitemap 行也要換。

### B. 換下載鏈接（Mega 外部）
在 `sidrecoilscript.html` 改 line ~782/788 的 Mega 連結。fail：要驗 QR code / ZIP 是在外部未在 repo 中。

### C. 新加 HTML / 刪除 HTML
- 加/刪後跑 `node scripts/build-index.mjs` 重建索引
- 跑 `node scripts/build-sitemap.mjs` 重建 sitemap
- 跑 `node scripts/check-missing.mjs` 確認 0

### D. 替換專案卡片（首頁 .project-grid）
在 `index.html` line ~1121-1188 內編輯 `.project-card` 區段。
卡片 HTML 格式可複製，SVG icon 保持 `#00f2ff` stroke 風格。

### E. 聯絡表單更新
目前 Google Form ID：`1FAIpQLSdk7p6XQXcX0z5ls7DMlEIzy0aj43MrnUOYviH9Taum4J68Bg`
更改表單後需：
1. 改 `32879320972031632773-rarr.html` 內 iframe `src`
2. 改所有 15 個 `.html` nav JSON 的 `"url":"https://docs.google.com/forms/..."` 值
3. 改 dropdown 子項 `<a href="...">` 中也有的 href

### F. 展開 flick、幻燈片故障
- `sidrecoilscript.html:832+` JS 本地渲染 3 張圖 (`uploads/content/2026-06-17-*.png`)
- `files/slideshow-local.js:23` URL 構建路徑

### G. 搜尋無法運作
- 檢查 `search.html` + `files/search.js` 是否被誤編碼
- 重跑 `node scripts/build-index.mjs` → `search-index.json` 再生

---

## 標準工作流（修改後）

```powershell
cd "C:\Code play first\Sid Automation Lab"

# 1. 改 HTML / JS / CSS

# 2. 重建衍生檔
node scripts/build-index.mjs
node scripts/build-sitemap.mjs

# 3. 檢查孤兒引用
node scripts/check-missing.mjs
# => 期望輸出：missing 0 file reference(s)：

# 4. 本機驗證
.\serve.bat
# 開 http://localhost:8080/

# 5. F12 → Console → 無 Error (搜尋/幻燈片 OK)

# 6. git commit + push
git add -A; git commit -m "..."; git push
```

---

## 常見失敗模式 → 解方

| 症狀 | 看哪個檔 | 解方 |
|---|---|---|
| F12 `Uncaught SyntaxError` 在 `search.js` | `files/search.js:27` | smart quote 汙染 |
| 圖片 404 但檔案在 | `uploads/content/` | 跑 `node scripts\check-missing.mjs` |
| 部署後字型／icon 沒套用 | `files/cdn_local/css/social-icons.css` | 內部 `@font-face` 路徑是否誤用遠端 URL |
| main.js 404 | `files/cdn_local/js/` | 確認這兩個 469+521KB 檔存在 |
| `search.html` 500 或搜尋沒結果 | `search-index.json` | 跑 `build-index.mjs` 重建 |
| 幻燈片沒渲染 | `sidrecoilscript.html:832` | Console.log `imgs` array |
| 終端機列印中文變亂碼 | Shell 編碼 | 用 `pwsh` 而非舊版 `powershell.exe` |
| git commit 中文亂碼 | Git 設定 | `git config --global i18n.commitEncoding utf-8` |

---

## 文件索引

| 文件 | 讀者 | 何時用 |
|---|---|---|
| `README.md` | PM / 暴露者 / Agent | 專案總覽 |
| `AGENT.md` | Agent | 本檔；接手時速讀 |

---

## 版本歷程（摘要）

- v1.0：Weebly → Vercel 遷移、內化 CDN、SEO 賦能、幻燈片本地化（2026-07-04）
- v1.1：`pwsh` 使用建議、中文亂碼 Troubleshooting（2026-07-04）
- v1.2：修 `sidpayfor.html` 巢狀 HTML 結構債、WeChat 聯繫管道、`sidexiletoolbox.html` 補回 3 張圖（2026-07-05）
- v1.3：重定位為曝光平台、全站除 Gmail、聯絡改為外連 Google Form、README 重寫、GitHub repo About 更新（2026-07-05）
- v1.4：清理死檔、瘦身文檔、pull sitemap bug、正規化維護性（2026-07-05）

© 2026 Sid · 獨立自動化開發者