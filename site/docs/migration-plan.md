# 正式站遷移計畫（Weebly 靜態匯出 → Astro）

> 文件版本：2026-11-09
> 範圍：`site/` 內的 Astro 實作遷移至 GitHub Pages 正式環境
> 狀態：**Phase 1 完成並已上線**（commit `43bd460` + `dccca1d`，Pages 來源已切為 `workflow`）

---

## 一、目標與現況

### 現況（已用 `gh` API 查證）

| 項目 | 現況值 |
|------|--------|
| Pages build_type | `legacy` |
| Pages source | `{branch: main, path: /}` |
| 線上網址 | `https://sid-1996.github.io/sid-automation-lab/` |
| 線上頁面 | 根目錄 16 個 `.html`（9 實質內容頁 + 4 空殼頁 + 2 轉址存根 + 1 noindex 搜尋頁）|
| 線上狀態 | 16 個 URL 目前**全部回應 HTTP 200，無任何 404** |
| CI | 無（`gh api repos/.../actions/workflows` 回傳空）|

### 目標

- 以 Astro 靜態輸出**完全取代**根目錄的 Weebly 匯出頁
- **16 個既有公開 URL 全數保留**（轉址頁承接），保護既有搜尋排名與外部連結
- 設計採用已凍結的 A+C 混合方案（75% / 25%）
- 部署改由 GitHub Actions 產生 artifact，**公開範圍僅限 `site/dist` 內容**

### 非目標（Phase 1 不做）

- 不刪除、不修改 repo 根目錄既有的 16 個 `.html`
- 不改動既有 `scripts/` 維護腳本的行為
- 不進行 AdSense 版位的正式配置（位置待業主指定）
- 不 commit、不 push、不切換部署來源（需業主另行授權）

---

## 二、Phase 1 已完成的工作

### 1. 專案建置

| 項目 | 內容 |
|------|------|
| 位置 | `site/`（與根目錄既有檔案完全隔離）|
| 框架 | Astro 7（靜態輸出）+ Content Collections + Vanilla JS，**未引入 React** |
| 依賴 | 僅 `astro ^7.4.7`，`npm ci` 可完整重現 |
| 產出 | 25 個靜態頁（10 內容頁 + 15 轉址頁）|
| base path | `/sid-automation-lab/`，可用 `SITE_BASE` 覆寫為 `/`（Cloudflare 自訂網域）|

### 2. 既有 URL 承接（16 個全數保留）

| 既有 URL | 新目標 | 型態 |
|----------|--------|------|
| `/index.html` | `/index.html` | 內容頁 |
| `/about.html` | `/index.html#principle` | 轉址 |
| `/contact.html` | `/index.html#contact` | 轉址 |
| `/automation-projects.html` | `/projects.html` | 轉址 |
| `/sidrecoilscript.html` | `/projects/sidallfps.html` | 轉址 |
| `/sidpayfor.html` | `/license.html` | 轉址 |
| `/search.html?q=…` | `/projects.html?q=…`（保留查詢字串）| 轉址 |
| `/sidexilegametool.html` | `/projects/poe2-toolbox.html` | 轉址 |
| `/sidexiletoolbox.html` | `/projects/poe2-toolbox.html` | 轉址 |
| `/path-of-exile.html` | `/projects/poe2-toolbox.html` | 轉址 |
| `/aethergazer.html` | `/projects/aethergazer-semiauto.html` | 轉址 |
| `/aethergazersemiauto.html` | `/projects/aethergazer-semiauto.html` | 轉址 |
| `/browndust2.html` | `/projects/browndust2-music-assist.html` | 轉址 |
| `/browndust2-music-assist.html` | `/projects/browndust2-music-assist.html` | 轉址 |
| `/other-tools.html` | `/projects.html#external-tools` | 轉址 |
| `/ocr-trigger-clicker.html` | `https://sid-1996.github.io/ocr-trigger-clicker/` | 站外轉址（不變）|

轉址實作為四合一：**meta refresh + canonical（不帶 fragment）+ `noindex,follow` + JS `location.replace`**。
GitHub Pages 無伺服器端 301，這是純靜態環境下的標準做法。

### 3. 既有公開資產續用

建置後由 `site/scripts/sync-assets.mjs` 同步，**不複製進版控**：

| 來源 | 產出 | 規模 |
|------|------|------|
| `files/` | `dist/files/` | 64 檔 / 2.41 MB |
| `uploads/` | `dist/uploads/` | 65 檔 / 28.87 MB |
| `ads.txt` / `robots.txt` / `humans.txt` | 同名產出 | — |
| （產生）| `dist/sitemap.xml` | 10 筆，排除 noindex 與轉址頁 |

### 4. 既有缺陷修正

| 缺陷 | 影響 | 處置 |
|------|------|------|
| `site.js` 的 `syncUrl()` 重建 URL 時丟棄 fragment | `/projects.html#external-tools` 深層連結會把訪客丟在頁面頂端 | 修正為保留 `location.hash`，並於驗收加入 H 組回歸鎖定 |
| `sync-assets.mjs` 轉址頁清單以檔名比對 | 會誤排除 `projects/` 底下同名內容頁，sitemap 由 10 筆掉成 8 筆 | 改以根目錄相對路徑比對，並於驗收加入 I 組 sitemap 檢查 |

---

## 三、Phase 1 驗收狀態

驗收程式：`site/verify.mjs`（`npm run verify`）
執行方式：自動把 `dist/` 掛載到 `/sid-automation-lab/` 底下再提供服務，**真實模擬 GitHub Pages 路徑前綴**。

| 組別 | 內容 |
|------|------|
| A | 版面量測（1440 / 1280 / 768 / 390 四視口 × 10 內容頁）|
| B | 專案列表互動（分類 / 技術 / 關鍵字三重篩選、URL query 同步）|
| C | 行動版選單（390 / 768：開關、Esc、焦點返回）|
| D | 全頁視覺一致性（Header 高度、Footer 結構、token 值）|
| E | 導覽列與連結完整性（5 項導覽、內部連結無斷裂）|
| F | 既有 URL 轉址（15 個轉址頁的靜態標記 + 實際導向）|
| G | SEO meta（頁型專屬 OG 圖、canonical、title、OG 圖可取得）|
| H | 錨點深層連結（fragment 保留 + 目標元素捲入畫面）|
| I | sitemap / robots.txt / ads.txt |

> 最新一次執行結果見 `docs/verification-run.log`（原始輸出）與 `docs/verification.md`（整理後紀錄）。

---

## 四、實際切換紀錄（2026-11-09）

### 執行的 commit

| commit | 內容 |
|--------|------|
| `43bd460` | `feat: migrate site to Astro (A+C hybrid) with legacy URL redirects`（105 檔案，+9306 行）|
| `dccca1d` | `fix: bump Pages workflow to Node 22 (Astro 7 requires >=22.23.4)` |

### 切換過程中的兩個真實狀況

1. **Actions 的 deploy 步驟會直接覆蓋已發布內容**，即使 Pages 設定仍是 `legacy`。
   首次 workflow 成功後，線上已立即是新版 Astro build。
   → **這代表「不切換」其實是不安全的**：下一次 push 觸發的 legacy 建置會把線上覆蓋回舊站。
   因此 `build_type` 必須切成 `workflow`，否則新舊會互相覆蓋。
2. **Astro 7 要求 Node ≥ 22.23.4**，workflow 原本寫 Node 20 導致首次建置失敗
   （`Node.js v20.20.2 is not supported by Astro!`），已改為 Node 22。

### 切換後的線上巡檢結果（`npm run live-check`，24 項全 PASS）

| 項目 | 結果 |
|------|------|
| 16 個既有公開 URL | 全部 HTTP 200，無 404 |
| 13 個站內轉址 | 實際導向的 pathname 與 fragment 全部正確（含 `other-tools.html` → `projects.html#external-tools`）|
| `/search.html?q=壓槍` | 查詢字串保留，且篩選已套用（顯示 1 / 6 個專案）|
| `/ocr-trigger-clicker.html` | 站外導向 `https://sid-1996.github.io/ocr-trigger-clicker/` 成功 |
| `sitemap.xml` | 10 筆，內容頁 canonical 一致，無轉址頁 |
| `robots.txt` / `ads.txt` / `humans.txt` | 內容與 repo 根目錄一致 |
| 5 張頁型專屬 OG 圖 | `/images/og-*.png` 全部 200 |
| `uploads/` 既有資產 | 抽查可正常取得 |
| 首頁 H1 / 站內圖片 / 水平溢出 | H1 = 1、圖片全載入、overflow = 0 |
| 專案列表篩選 / URL 同步 | 分類篩選可用，URL 同步為 `?category=battle` |
| 行動版選單 | 可開啟、Esc 可關閉 |
| Console 錯誤 | 0 |

> 重跑方式：`cd site && npm run live-check`

---

## 五、部署切換計畫（**已執行**）

切換前線上仍是 `main` 分支的 legacy 部署，`site/` 的任何變動對線上**零影響**。

### 步驟

| # | 動作 | 可逆性 |
|---|------|--------|
| 1 | 將 `site/` 與 `.github/workflows/pages.yml` commit + push 到 `main` | 可 revert |
| 2 | 確認 workflow 首次執行成功（`gh run list`）| 可停用 |
| 3 | 切換 Pages source：**Settings → Pages → Build and deployment → Source → GitHub Actions**<br>（或 API：`gh api --method PUT repos/Sid-1996/sid-automation-lab/pages -f build_type=workflow`）| **可逆：改回 main 分支即可** |
| 4 | 線上驗收（下方檢查清單）| — |
| 5 | 觀察期 7 天，再考慮刪除根目錄舊 `.html` | 可由 git 還原 |

### 切換後線上檢查清單

- [ ] 16 個既有 URL 全部 HTTP 200（以 `curl -sI` 逐一確認）
- [ ] 15 個轉址頁實際導向正確目標（含 `ocr-trigger-clicker.html` 站外）
- [ ] `https://sid-1996.github.io/sid-automation-lab/sitemap.xml` 回應 200 且含 10 筆
- [ ] `robots.txt`、`ads.txt`、`humans.txt` 皆可取得
- [ ] `/files/*` 與 `/uploads/*` 的既有資源連結未失效（抽查至少 3 個）
- [ ] 首頁 / 專案列表 / 專案詳細 / 贊助 / 授權 五種頁型 OG 圖正確
- [ ] 站內導覽 5 項可點、專案篩選可運作、行動版選單可開關
- [ ] AdSense 廣告仍可投放（`ads.txt` 與頁面 slot 皆存在）

### 回滾

若切換後有問題，**最保險的做法是把 Pages source 改回 `main` 分支**（Settings 一鍵，或
`gh api --method PUT repos/Sid-1996/sid-automation-lab/pages -f build_type=legacy -f source[branch]=main -f source[path]=/`），
舊站會立即重新上線（因為根目錄的 16 個 `.html` 從未被刪除或修改）。

---

## 六、風險與緩解

| 風險 | 機率 | 影響 | 緩解 |
|------|------|------|------|
| 搜尋引擎對轉址頁的重新收錄需要時間 | 高 | 中 | 轉址頁帶 `noindex,follow` + canonical 指向目標；目標頁本身完整且 URL 穩定 |
| AdSense 在新站需重新審查 | 中 | 中 | `ads.txt` 與 `ca-pub-1181746742151021` 皆保留；版位位置待業主指定 |
| base path 設定錯誤導致全站 404 | 低 | 高 | 驗收以 `/sid-automation-lab/` 前綴實際服務驗證，非根目錄驗證 |
| 舊 Weebly jQuery / 外部 CDN 依賴遺留 | 低 | 低 | 新架構零 jQuery、零外部字型請求（系統字）|
| 既有外部連結指向舊 slug 格式 | 中 | 中 | 16 個 URL 全數保留且自動轉址 |

---

## 七、Phase 2 待辦（切換後執行）

1. **Google AdSense 版位位置**：待業主指定（首頁 / 專案詳細頁 / 列表頁）
2. **舊篩選參數相容**：`automation-projects.html` 舊契約為 `?game=&task=&tech=&q=`，
   新架構為 `?category=&tech=&q=`；需決定是否加相容映射（舊連結帶 `game=` 參數時自動轉為 `category=`）
3. **既有維護腳本的既有 bug**（可順手修正，非阻塞）：
   - `scripts/build-sitemap.mjs` 的 `xmlEscape` 替換目標與替換字串相同（未真正跳脫 `& < > "`）
   - `scripts/build-index.mjs` 的 `decodeEntities` 同上，產物中 contact 標題殘留 `&rarr;`
   - 兩支腳本皆假設 HTML 在 repo 根目錄一層，切換後需調整
4. **根目錄舊 `.html` 的移除時機**：建議觀察期結束、搜尋引擎完成重新收錄後再刪
5. **內容更新機制**：既有 `scripts/` 維護流程改為對 `src/content/projects/*.md` 操作

---

## 八、業主決策與待辦

| # | 事項 | 決策 / 狀態 |
|---|------|-------------|
| 1 | commit + push `site/` 與 `.github/workflows/pages.yml` | ✅ 已執行（`43bd460`）|
| 2 | 切換 Pages source 為 GitHub Actions | ✅ 已執行（`build_type: workflow`）|
| 3 | 舊篩選參數 `?game=&task=` 相容映射 | ✅ 業主決定**不做**，舊參數讓其失效 |
| 4 | 舊 `scripts/` 的 `xmlEscape` / `decodeEntities` bug 是否順手修正 | 待確認（不阻塞；根目錄舊 `.html` 已不對外提供服務）|
| 5 | AdSense 版位位置 | 待指定 |
| 6 | 根目錄舊 `.html` 的刪除時機 | 建議觀察期（7 天）後，搜尋引擎重新收錄完成再刪 |
