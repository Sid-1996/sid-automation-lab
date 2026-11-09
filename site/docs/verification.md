# 驗收紀錄 — 正式站 Astro 實作（`site/`）

- 執行方式：`npm run verify`（`node verify.mjs`）
- 驗證環境：自動把 `dist/` 掛載到 `<staging>/sid-automation-lab/` 底下，再以 `python -m http.server` 提供服務
  → **真實模擬 GitHub Pages「專案站」的路徑前綴**，而非以根目錄服務
- 完整原始輸出：[`verification-run.log`](verification-run.log)
- 結果：**385 項判定檢查全數 PASS、FAIL 0**（另有 40 項站外 CDN 圖片載入觀察項，全數 PASS）

> 原型階段的 11 項缺陷修正紀錄保留於本機的設計原型目錄
> `devtools/ux_prototypes/a-c-hybrid/docs/verification.md`（該目錄不納入版控）；
> 本文件記錄的是**正式站遷移階段**新發現並修正的缺陷。

各組別實測數量：

| 組別 | 內容 | 判定項 |
|------|------|--------|
| A | 版面量測（10 頁 × 4 視口 × 6 項） | 240 |
| B | 專案列表互動（1440 / 390） | 22 |
| C | 行動版選單（390 / 768） | 10 |
| D | 全頁視覺一致性 | 3 |
| E | 導覽列與連結完整性 | 4 |
| F | 既有 URL 轉址（15 頁 × 6 項） | 90 |
| G | SEO meta（10 頁 × 4 項） | 40 |
| H | 錨點深層連結（3 個錨點 × 3 項） | 9 |
| I | sitemap / robots.txt / ads.txt | 7 |
| | **合計** | **385** |

---

## 一、驗收範圍

| 項目 | 內容 |
|------|------|
| 視口 | 1440 / 1280 / 768 / 390 px（4 種）|
| 內容頁 | 首頁、專案列表、**6 個專案詳情頁**、贊助、授權（**10 頁**）|
| 轉址頁 | **15 個**（既有 16 個 `.html` 扣除 `index.html` 與 5 個直接沿用同名路徑的內容頁）|
| 組合數 | 10 頁 × 4 視口 = **40 組版面量測** |
| 工具 | Playwright（Chromium），本地 headless |

---

## 二、A. 版面量測（40 組合，每組 6 項 = 240 項）

| 檢查 | 判準 | 結果 |
|------|------|------|
| 水平溢出 | `documentElement.scrollWidth - clientWidth === 0` | PASS（全部 overflow=0）|
| H1 數量 | 恰好 1 個 `<h1>` | PASS（全部 h1=1）|
| Console 錯誤 | 0 個 error | PASS |
| `<title>` | 非空 | PASS |
| 站內圖片 | 所有 `/` 開頭的 `<img>` 的 `naturalWidth > 0` | PASS |
| 站外 CDN 圖片 | ECPay / PayPal 圖片載入狀況（**觀察項，不判定失敗**）| PASS |

---

## 三、B–E. 互動與一致性（39 項）

| 組別 | 內容 | 結果 |
|------|------|------|
| B | 分類 / 技術 / 關鍵字三重篩選、URL query 同步、空狀態、重設（1440 與 390 結果一致）| 22 項 PASS |
| C | 行動版選單：顯示鈕、`aria-expanded`、可見性、Esc 關閉、無 JS 錯誤 | 10 項 PASS |
| D | 全頁 Header 高度一致、Footer 結構一致、Design Token（`--signal` = `#4ae3b0`）一致 | 3 項 PASS |
| E | 1024px 導覽項數 = 5、導覽與工具列不重疊、無水平溢出、所有站內連結皆可解析 | 4 項 PASS |

---

## 四、F. 既有 URL 轉址（15 頁 × 6 項 = 90 項）

每個轉址頁檢查 6 項：meta refresh 指向目標、canonical 指向目標頁、canonical 不帶 fragment、
`noindex,follow`、轉址頁無 H1、**瀏覽器實際導向的 pathname / search / hash 正確**，
以及目標頁本身 H1 = 1（站外轉址頁另檢查站外目標可取得）。

| 既有 URL | 目標 | 結果 |
|----------|------|------|
| `/about.html` | `/index.html#principle` | PASS |
| `/contact.html` | `/index.html#contact` | PASS |
| `/sidpayfor.html` | `/license.html` | PASS |
| `/automation-projects.html` | `/projects.html` | PASS |
| `/sidrecoilscript.html` | `/projects/sidallfps.html` | PASS |
| `/search.html?q=壓槍` | `/projects.html?q=壓槍`（查詢字串保留）| PASS |
| `/aethergazer.html` | `/projects/aethergazer-semiauto.html` | PASS |
| `/aethergazersemiauto.html` | `/projects/aethergazer-semiauto.html` | PASS |
| `/browndust2.html` | `/projects/browndust2-music-assist.html` | PASS |
| `/browndust2-music-assist.html` | `/projects/browndust2-music-assist.html` | PASS |
| `/other-tools.html` | `/projects.html#external-tools` | PASS |
| `/path-of-exile.html` | `/projects/poe2-toolbox.html` | PASS |
| `/sidexilegametool.html` | `/projects/poe2-toolbox.html` | PASS |
| `/sidexiletoolbox.html` | `/projects/poe2-toolbox.html` | PASS |
| `/ocr-trigger-clicker.html` | `https://sid-1996.github.io/ocr-trigger-clicker/`（站外）| PASS |

> 檢查靜態標記時**不能**讀頁面 DOM：meta refresh 是瀏覽器功能，即使關閉 JS 也會自動導向，
> 讀到的已是目標頁。腳本改為直接抓原始 HTML 再以 regex 解析標記。

---

## 五、G. SEO meta（10 頁 × 4 項 = 40 項）

| 檢查 | 說明 |
|------|------|
| og:image 為頁型專屬圖 | 決策 Q10：首頁 / 專案列表 / 專案詳情 / 贊助 / 授權各一張 |
| canonical 指向自身 | 每頁 canonical 為自己的正式站網址 |
| title 非空 | — |
| og:image 可取得 | 實際抓取該路徑確認檔案存在（og 為正式站絕對網址，驗證時改抓本機同一路徑）|

---

## 六、H. 錨點深層連結（3 個錨點 × 3 項 = 9 項）

| 檢查 | 說明 |
|------|------|
| fragment 載入後保留 | 頁面載入後 URL 的 hash 不得被洗掉 |
| 目標元素存在 | `#principle` / `#contact` / `#external-tools` 皆存在於對應頁面 |
| 目標元素捲入畫面 | 捲動結束後目標元素位於視窗內 |

> 此組的存在原因是為了鎖住 `site.js` 的 fragment 遺失缺陷（見第七節第 1 項）。

---

## 七、I. sitemap / robots.txt（7 項）

| 檢查 | 結果 |
|------|------|
| `sitemap.xml` 可取得 | PASS |
| 網址數 = 內容頁數（10）| PASS |
| 不含轉址頁 | PASS |
| 每筆網址皆可取得 | PASS |
| 每筆 `loc` 與該頁 canonical 一致 | PASS |
| `robots.txt` 指向正確的 sitemap URL | PASS |
| `ads.txt` 可取得（AdSense 驗證保留）| PASS |

---

## 八、正式站遷移階段修正的實際缺陷

| # | 缺陷 | 症狀 | 修正 |
|---|------|------|------|
| 1 | `public/site.js` 的 `syncUrl()` 只用 `pathname + query` 重建 URL | 任何帶錨點的深層連結（`/projects.html#external-tools`）在頁面載入時 fragment 被 `history.replaceState` 洗掉，訪客落到頁面頂端而非「站外推薦的開源工具」區塊 | 改為保留 `window.location.hash`；並新增 H 組回歸鎖定 |
| 2 | `scripts/sync-assets.mjs` 的轉址頁清單以「檔名（flat）」比對 | `projects/browndust2-music-assist.html` 與 `projects/ocr-trigger-clicker.html` 被誤判為轉址頁排除，`sitemap.xml` 由 10 筆掉成 8 筆 | 改以根目錄相對路徑完整比對 |
| 3 | 驗收腳本 I 組用 `endsWith` 判斷轉址頁 | `projects/browndust2-music-assist.html` 誤判為轉址頁 | 改為完整相對路徑比對 |
| 4 | 驗收腳本 H 組固定等待 700ms | 站內使用 `scroll-behavior: smooth`，平滑捲動尚未結束就量測，造成 `#contact` 誤判 | 改為等待 `scrollY` 連續穩定後再判定 |
| 5 | 驗收腳本總結行的項數統計 | `results` 陣列從未被累加，總結恆顯示「0 頁面視口組合量測完成」 | `check()` 內累加，總結改顯示實際判定項數 |

---

## 九、完整頁面截圖

輸出於 [`screenshots/`](screenshots/)：**10 個內容頁 × 4 個視口 = 40 張完整頁面截圖**（fullPage）。

---

## 十、尚待人工確認的事項（自動化測試無法涵蓋）

| # | 事項 | 說明 |
|---|------|------|
| 1 | 中文可讀性 | 自動化只能驗證對比數值與字級，實際閱讀感受需人工判斷 |
| 2 | 品牌調性 | 「夠成熟嗎」「太冷了嗎」「C 元素會不會太少」屬主觀評估 |
| 3 | 贊助與授權的頁面區隔是否夠清楚 | 舊站兩個按鈕同名「贊助支持 →」卻指向不同內容，新版需人工確認能否一眼分辨 |
| 4 | 導覽 5 項是否太擠 | 1280px 與 1024px 已實測無重疊，但視覺密度需人工判斷 |
| 5 | 5 張 OG 圖的文案與構圖 | 自動化只能驗證存在性與可取得性 |
| 6 | 切換後線上實站 | 本驗收跑在本地 staging，**線上正式站尚未切換**；切換後需依 [`migration-plan.md`](migration-plan.md) 的清單再做一次線上巡檢 |
