# Sid Automation Lab 正式站（`site/`）

> 本目錄是 **Sid Automation Lab 正式網站的 Astro 實作**，取代原本的 Weebly 靜態匯出。
> 設計為 **A（訊號工作檯）75% + C（終端主控台）25%** 混合風格，18 項設計決策已凍結（見 [`docs/decision-log.md`](docs/decision-log.md)）。
> repo 根目錄的 16 個既有 `.html` 是**線上舊站**，在正式切換部署來源前完全未被修改。

---

## 一、這個目錄做什麼

| 項目 | 內容 |
|------|------|
| 技術架構 | Astro 7（靜態輸出）+ Content Collections + Vanilla JS，**未引入 React／框架** |
| 頁型 | 5 種（首頁 / 專案列表 / 專案詳細頁 / 贊助開發 / 購買授權） |
| 產出頁數 | **25 個靜態頁** = 10 個內容頁 + 15 個轉址頁 |
| 專案內容 | 6 個專案，版本／授權／發布日期／下載連結皆經 `gh` CLI 查證上游 repo |
| 圖片 | 6 張**官方原始截圖**（二進位複製，未重繪）+ WeChat QR 原圖 + 5 張頁型專屬 OG 圖 |
| 唯一相依 | `astro ^7.4.7`（`npm ci` 可完整重現） |
| 部署 | GitHub Actions → GitHub Pages，artifact 為 `site/dist` |

---

## 二、本機開發

```powershell
cd "C:/Code play first/Sid Automation Lab/site"
npm ci          # 首次或 lockfile 變更後
npm run dev     # http://localhost:4321/sid-automation-lab/
```

| 指令 | 用途 |
|------|------|
| `npm run dev` | Astro 開發伺服器（熱重載） |
| `npm run build` | `astro build` + `scripts/sync-assets.mjs`（同步資產並產生 `sitemap.xml`） |
| `npm run preview` | Astro 內建 preview |
| `npm run serve` | 以 `python -m http.server` 服務 `dist/`（port 8144） |
| `npm run verify` | Playwright 全站驗收（見下方第六節） |
| `npm run og` | 重新產生 5 張頁型專屬 OG 圖（Pillow + Noto Sans TC） |

> ⚠️ `npm run serve` 直接服務 `dist/` **根目錄**，但站點以 base 前綴 `/sid-automation-lab/` 部署，
> 因此本機要看完整效果請用 `npm run verify`（它會把 `dist/` 掛到 `/sid-automation-lab/` 底下）或
> `npm run preview`。直接用 `npm run serve` 時，站內連結會指向不存在的路徑。

### base path

GitHub Pages 的「專案站」掛在 `/<repo>/` 之下，因此：

- `astro.config.mjs` 的 `base` 預設為 `/sid-automation-lab/`
- 所有站內連結與資產路徑一律經由 `src/lib/url.ts` 的 `u()` helper 產生，**不要在頁面裡手寫絕對路徑**
- 若日後改用 Cloudflare Pages 自訂網域，建置時設定環境變數即可，無需改任何頁面：

```powershell
$env:SITE_BASE = '/'; npm run build
```

---

## 三、內容維護（唯一真實來源）

專案資料只存在於 `src/content/projects/*.md`（Content Collection）。
**新增一個專案 = 新增一個 `.md` + 一張符合 schema 的欄位**，不需動任何頁面程式碼。

| 檔案 | slug | 說明 |
|------|------|------|
| `sidallfps.md` | `sidallfps` | SidAllFPS 錄影幀數優化 |
| `poe2-toolbox.md` | `poe2-toolbox` | PoE2 工具箱（取代已下架的 PoE1 版本） |
| `ocr-trigger-clicker.md` | `ocr-trigger-clicker` | OCR Trigger Clicker |
| `aethergazer-semiauto.md` | `aethergazer-semiauto` | Aether Gazer 半自動 |
| `browndust2-music-assist.md` | `browndust2-music-assist` | BrownDust 2 音樂輔助 |
| `wuthering-waves-calculator.md` | `wuthering-waves-calculator` | 鳴潮計算器 |

Schema 定義於 `src/content.config.ts`（zod）。技術棧欄位 `techs` 為正規化後的小寫值，
供列表頁的技術棧篩選比對使用。

---

## 四、既有公開 URL 的承接策略（決策 Q4 / Q17）

GitHub Pages 無伺服器端 301，轉址頁採四合一：
**meta refresh + canonical（不帶 fragment）+ `noindex,follow` + JS `location.replace`**。

既有 16 個 `.html` URL **全部保留**，無一變成 404：

| 既有 URL | 新目標 |
|----------|--------|
| `/index.html` | 內容頁（canonical = `https://sid-1996.github.io/sid-automation-lab/`）|
| `/about.html` | `/index.html#principle` |
| `/contact.html` | `/index.html#contact` |
| `/automation-projects.html` | `/projects.html` |
| `/sidrecoilscript.html` | `/projects/sidallfps.html` |
| `/sidpayfor.html` | `/license.html` |
| `/search.html?q=…` | `/projects.html?q=…`（保留查詢字串）|
| `/sidexilegametool.html` | `/projects/poe2-toolbox.html` |
| `/sidexiletoolbox.html` | `/projects/poe2-toolbox.html` |
| `/path-of-exile.html` | `/projects/poe2-toolbox.html` |
| `/aethergazer.html` | `/projects/aethergazer-semiauto.html` |
| `/aethergazersemiauto.html` | `/projects/aethergazer-semiauto.html` |
| `/browndust2.html` | `/projects/browndust2-music-assist.html` |
| `/browndust2-music-assist.html` | `/projects/browndust2-music-assist.html` |
| `/other-tools.html` | `/projects.html#external-tools` |
| `/ocr-trigger-clicker.html` | `https://sid-1996.github.io/ocr-trigger-clicker/`（站外，不變）|

> `other-tools.html` 的內容（站外推薦的開源工具）已併入專案列表頁的 `#external-tools` 區塊，
> 不另開頁型，以維持已凍結的 5 項導覽。

---

## 五、資產同步（`scripts/sync-assets.mjs`）

建置後自動把 repo 根目錄的既有公開資產複製進 `dist/`，確保舊路徑全部續用：

| 來源 | 產出 | 數量 / 容量 |
|------|------|------------|
| `files/` | `dist/files/` | 64 檔 / 2.41 MB |
| `uploads/` | `dist/uploads/` | 65 檔 / 28.87 MB |
| `ads.txt` | `dist/ads.txt` | AdSense 驗證檔 |
| `robots.txt` | `dist/robots.txt` | 已指向正確 sitemap URL |
| `humans.txt` | `dist/humans.txt` | — |

並依各頁 canonical 產生 `dist/sitemap.xml`（排除 `noindex` 頁與轉址頁，共 10 筆）。

**資產不複製進版控**，一律在建置後於 CI 內同步，因此 repo 不會膨脹。

---

## 六、驗收（`npm run verify`）

Playwright 全站驗收，**自動以 `/sid-automation-lab/` 前綴服務 `dist/`**（真實模擬 GitHub Pages 路徑）：

| 組別 | 內容 |
|------|------|
| A | 版面量測（1440 / 1280 / 768 / 390 四視口 × 10 內容頁）|
| B | 專案列表互動（分類／技術／關鍵字三重篩選、URL query 同步）|
| C | 行動版選單（390 / 768，開關、Esc、焦點返回）|
| D | 全頁視覺一致性（Header 高度、Footer 結構、token 值）|
| E | 導覽列與連結完整性（5 項導覽、內部連結無斷裂）|
| F | 既有 URL 轉址（15 個轉址頁：meta refresh / canonical / noindex / 實際導向）|
| G | SEO meta（頁型專屬 OG 圖、canonical、title、OG 圖可取得）|
| H | 錨點深層連結（fragment 不得被洗掉、目標元素須捲入畫面）|

輸出：`docs/verification-run.log` 與 `docs/screenshots/`。

> **H 組的存在原因**：舊版 `public/site.js` 的 `syncUrl()` 只用 `pathname + query` 重建 URL，
> 會在頁面載入時把 fragment 洗掉，導致 `/projects.html#external-tools` 這類深層連結
> 把訪客丟在頁面頂端。已修正並加上回歸鎖定。

---

## 七、部署

`.github/workflows/pages.yml`：push 到 `main` 且 `site/**` 有變動時觸發
（`npm ci` → `npm run build` → 上傳 `site/dist` → deploy 到 GitHub Pages）。

**首次切換**（需業主授權，屬對外可見動作）：

1. repo **Settings → Pages → Build and deployment → Source** 改為 **GitHub Actions**
2. 手動觸發一次 workflow（Actions → Deploy site to GitHub Pages → Run workflow）
3. 驗證線上 16 個既有 URL 全部 200 且轉址正確

> 切換前線上仍由 `main` 分支的舊站（legacy 部署）提供服務，**不受本目錄任何變動影響**。
> 切換後公開的只有 `site/dist` 內容，`devtools/`、`scripts/` 等不再對外公開。

---

## 八、資料誠實性原則

- 版本、發布日期、授權 → 以 `gh` CLI 查證上游 repo 現況後填入，無版本者顯示「未發布版本」。
- 不呈現即時數據、線上狀態、執行紀錄、下載次數、使用者數或評分。
- **贊助與授權是兩件不同的事**：`/sponsor.html` 是小額贊助，`/license.html` 是 500 元一次性買斷授權。
- 站外推薦的開源工具明確標註為「其他開發者的公開專案，本站只做推薦與連結」。

---

## 九、目錄結構

```
site/
├─ astro.config.mjs          site / base(SITE_BASE) / build.format:'file'
├─ package.json              scripts: dev / build / preview / serve / verify / og
├─ package-lock.json
├─ verify.mjs                Playwright 全站驗收（A–H 共 8 組）
├─ src/
│  ├─ content.config.ts      Content Collections schema（zod）
│  ├─ content/projects/      6 個專案 .md（內容唯一真實來源）
│  ├─ layouts/BaseLayout.astro   lang / meta / canonical / OG / Twitter / JSON-LD
│  ├─ components/
│  │  ├─ SiteHeader.astro    A 儀器條 + C 指令式標籤
│  │  ├─ SiteFooter.astro
│  │  ├─ SignalPanel.astro   Hero 訊號面板
│  │  ├─ ProjectRow.astro    A 通道列 + data-category / data-stack
│  │  ├─ TerminalBlock.astro C 局部終端區塊
│  │  └─ RedirectPage.astro  轉址頁（四合一）
│  ├─ lib/url.ts             BASE + u() base-path helper
│  ├─ pages/
│  │  ├─ index.astro / projects.astro / projects-[slug].astro
│  │  ├─ sponsor.astro / license.astro
│  │  └─ 15 個轉址頁
│  └─ styles/tokens.css      Design Tokens（單一事實來源）
├─ scripts/
│  ├─ sync-assets.mjs        資產同步 + sitemap 產生
│  └─ make-og.py             5 張頁型專屬 OG 圖產生器
├─ public/
│  ├─ site.js                行動選單 + 三重篩選 + URL 同步（Vanilla，無框架）
│  ├─ favicon.svg
│  └─ images/                6 張官方截圖 + wechat-qr.jpg + 5 張 OG 圖
└─ docs/
   ├─ decision-log.md        18 項設計決策凍結紀錄
   ├─ design-system.md       設計系統與 A/C 融合方式
   ├─ verification.md        驗收紀錄
   ├─ verification-run.log   原始測試輸出
   └─ screenshots/           完整頁面截圖
```
