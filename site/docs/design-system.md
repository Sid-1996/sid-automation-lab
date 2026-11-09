# 設計系統 — Sid Automation Lab「A+C 混合」

> A（訊號工作檯）75% ＋ C（終端主控台）25%
> 單一事實來源：[`../src/styles/tokens.css`](../src/styles/tokens.css)

---

## 一、融合原則

**A 是骨架，C 是點綴。**

C（終端機風格）如果做成滿版掃描線、閃爍游標、霓虹光暈，會變成「駭客風展示頁」，
與「成熟專業的個人自動化產品網站」目標相反。因此：

| 來源 | 佔比 | 體現方式 |
|------|------|----------|
| **A 訊號工作檯** | ~75% | 深色石墨底、青綠訊號色、1px 髮絲線、2–4px 方正圓角、工程網格底紋、儀器面板語彙、通道列 |
| **C 終端主控台** | ~25% | 等寬技術字、指令式語彙（`$ ls ./projects`）、模組化面板、檔名列、單一提示字元 |

### 刻意「不做」的事（與需求一致）

- ❌ 滿版掃描線 / CRT 曲線 / 螢幕抖動
- ❌ 閃爍游標、的打字機效果、霓虹光暈（glow）
- ❌ ASCII banner 當 Hero
- ❌ 用終端機語彙取代中文可讀性（中文一律 Sans）

### C 的元素只出現在三處

1. **首頁「開發理念」區** → `principle.md` 終端區塊
2. **專案詳細頁頁頭右欄** → `<slug>.env` 安裝／取得指令區塊
3. **全站技術標籤與按鈕前綴** → mono 字 + `$` 提示字元（`$ 前往 Releases 下載`）

其餘 75% 的版面（Hero、專案列表、內容區、頁尾）走 A 的工程工作檯語彙。

---

## 二、Design Tokens

### 2.1 色彩 — 底層

| Token | 值 | 用途 |
|-------|-----|------|
| `--bg` | `#0b0e12` | 頁面底（近黑石墨） |
| `--bg-sunk` | `#070a0d` | 凹槽：頁尾、終端區塊本體 |
| `--bg-elev` | `#10151b` | 抬升層：sticky header 底 |
| `--panel` | `#141a21` | 面板（卡片、spec 格） |
| `--panel-2` | `#1a212a` | 面板標題列、hover |
| `--panel-3` | `#202832` | 選取態 |

### 2.2 色彩 — 線

| Token | 值 | 用途 |
|-------|-----|------|
| `--line` | `#232c37` | 主要髮絲線（1px） |
| `--line-soft` | `#1a212a` | 次要分隔線（列表項之間） |
| `--line-strong` | `#33404e` | 強調邊框（ghost 按鈕、hover） |

### 2.3 色彩 — 文字（對比度已核算）

| Token | 值 | 對比 | 用途 |
|-------|-----|------|------|
| `--ink` | `#e8edf2` | 15.2:1 | 主要文字、標題 |
| `--ink-2` | `#9aa8b4` | 7.4:1 | 次要內文 |
| `--ink-3` | `#6b7885` | 4.6:1 | 輔助標籤（限 11px 以上） |
| `--ink-invert` | `#06231a` | — | 綠底上的文字 |

### 2.4 色彩 — 強調與狀態

| Token | 值 | 語意 |
|-------|-----|------|
| `--signal` | `#4ae3b0` | **主強調：訊號綠**。主按鈕、focus ring、連結、active 導覽 |
| `--signal-dim` | `#2fa383` | 綠的邊界、次要 |
| `--signal-fade` | `rgba(74,227,176,.10)` | 綠底淡色 |
| `--amber` | `#ffb454` | 數值讀出、**商業項目**、備註面板 |
| `--amber-fade` | `rgba(255,180,84,.10)` | 備註面板底 |
| `--info` | `#6ba7ff` | 站外專案、提示 |
| `--state-open` | `--signal` | 公開開源 |
| `--state-com` | `--amber` | 商業授權 |
| `--state-ext` | `--info` | 站外獨立站 |

> 綠 / 琥珀 / 藍的語意分工讓 6 個專案的授權狀態在列表上一眼可辨，
> 而不需要另外寫文字說明。

### 2.5 字體 — 零外部請求

```css
--font-sans: "PingFang TC", "Microsoft JhengHei", "Noto Sans TC",
             "Hiragino Sans CNS", system-ui, -apple-system, sans-serif;
--font-mono: "Cascadia Mono", Consolas, "SF Mono", "DejaVu Sans Mono",
             ui-monospace, "Courier New", monospace;
```

- **中文**一律 Sans（PingFang TC / 微軟正黑體），符合「中文易讀」要求。
- **英文技術資訊**（版本號、技術棧、檔名、指令）一律 Mono。
- **刻意不引入** JetBrains Mono CDN 或自託管思源黑體 → 避免第三方字體請求拖慢首屏、
  避免 GDPR 類隱私疑慮、避免 GitHub Pages 無 CDN 快取時的 FOUT。

### 2.6 字級階梯

| Token | px | 用途 |
|-------|-----|------|
| `--fs-3xs` | 11 | micro label（eyebrow、spec 標籤） |
| `--fs-2xs` | 12 | meta、tag |
| `--fs-xs` | 13 | mono 技術字 |
| `--fs-sm` | 14 | 輔助內文 |
| `--fs-md` | 15 | 內文 |
| `--fs-base` | 16 | 基準 |
| `--fs-lg` | 18 | 小標 |
| `--fs-xl` | 20 | 區塊標 |
| `--fs-2xl` | 24 | 卡片標 |
| `--fs-3xl` | 32 | H2 |
| `--fs-4xl` | 44 | H1 |
| `--fs-5xl` | 56 | display |

行高：`--lh-tight 1.18` / `--lh-snug 1.4` / `--lh-normal 1.7` / `--lh-loose 1.9`
字距：`--tracking-tight -0.02em` / `--tracking-wide .06em` / `--tracking-mono .12em`

> `--tracking-mono` 只用在 11–12px 的全大寫英文標籤上；
> 中文不使用任何字距調整（會破壞中文字形）。

### 2.7 間距、容器、圓角、邊框

```
--sp-1  4px    --sp-2  8px    --sp-3  12px   --sp-4  16px
--sp-5  24px   --sp-6  32px   --sp-7  48px   --sp-8  64px   --sp-9  96px
```

```
--shell        1200px   主容器
--shell-narrow  860px   長文容器
--shell-pad     28px   ≥1024px 左右留白（≤1023 → 24px，≤767 → 20px）
--measure       70ch   正文行寬上限
```

圓角刻意維持方正：`--r-xs 2px` / `--r-sm 3px` / `--r-md 4px`。
陰影幾乎不用（`--shadow-pop` 僅供行動選單使用）。

### 2.8 斷點

| 斷點 | 寬度 | 佈局變化 |
|------|------|----------|
| `--bp-sm` | 480px | — |
| `--bp-md` | 768px | 容器留白 24→20px；spec 4 欄 → 1 欄；pager 直排 |
| `--bp-lg` | 1024px | **主切換點**：頁頭雙欄 → 單欄；詳情頁內容雙欄 → 單欄；sticky 側欄解除 |
| `--bp-xl` | 1280px | — |
| `--bp-2xl` | 1440px | — |

### 2.9 元件狀態

| 狀態 | 呈現 |
|------|------|
| focus | `:focus-visible` → `outline: 2px solid var(--signal)` + 2px offset |
| hover | ghost 按鈕／連結：邊框轉 `--signal`、文字轉綠 |
| active / selected | 篩選鈕 → 綠底 + `--ink-invert` 文字 |
| press | `-webkit-tap-highlight-color: rgba(74,227,176,.18)` |
| reduced motion | `@media (prefers-reduced-motion: reduce)` → 動畫歸零、`scroll-behavior: auto` |
| 最小點擊目標 | 所有可點元素 `min-height: 44px`（行動版 WCAG 建議） |

---

## 三、共用元件

| 元件 | 檔案 | 說明 |
|------|------|------|
| `SiteHeader` | `components/SiteHeader.astro` | A 儀器條（品牌字 + 5 項區段導覽，編號 `01`–`05` 為 C 語彙）；右端 `$ ls ./projects` 為 C 語彙按鈕；≤900px 摺疊為漢堡選單（手機版同樣保留 `01`–`05` 編號） |
| `SiteFooter` | `components/SiteFooter.astro` | 三頁以上共用；品牌 mono 字 + 六個連結 + 版權與 CC 授權聲明 |
| `SignalPanel` | `components/SignalPanel.astro` | 首頁 Hero 的 4 條通道 waveform（純 SVG，無圖片）；右端標籤區分 OCR / SendInput / AHK v2 / OpenCV 四種技術路線 |
| `ProjectRow` | `components/ProjectRow.astro` | A 通道列：左側序號 01–06、中段標籤 + 標題 + 摘要 + 技術棧、右側 `$ 開啟` |
| `TerminalBlock` | `components/TerminalBlock.astro` | C 終端區塊本體（檔名列 + `>` 提示字元 + 指令行） |
| `RedirectPage` | `components/RedirectPage.astro` | 既有公開 URL 的轉址頁：meta refresh + canonical + `noindex,follow` + JS `location.replace`（GitHub Pages 無伺服器端 301） |
| `BaseLayout` | `layouts/BaseLayout.astro` | `<html lang="zh-Hant">`、canonical、OG、Twitter Card、JSON-LD、skip link |

### 導覽資訊架構（5 項）

| 編號 | 項目 | 對應正式站 | 說明 |
|------|------|------------|------|
| 01 | 首頁 | `index.html` | 含 `#support`（贊助）與 `#contact`（聯絡）兩個區塊 |
| 02 | 專案 | `automation-projects.html` | 列表 + 6 個詳細頁 |
| 03 | 開發理念 | `about.html` | 併入首頁理念區（`#principle`）與終端區塊 |
| 04 | 贊助 | `index.html#sponsor-section` | 小額贊助，獨立成頁 |
| 05 | 授權 | `sidpayfor.html` | 500 元正式版授權，獨立成頁 |

> 導覽項目變多後，於 ≤1180px 先收窄間距與字級，避免與右端工具列重疊
> （驗收 E 組會實測「導覽結尾 ≤ 工具列起點」）。

### 贊助 vs 授權：兩套金流的設計區隔

正式站有兩個都叫「贊助支持 →」的按鈕，卻指向完全不同的東西。原型把它們拆成兩頁：

| | 贊助（`/sponsor.html`） | 授權（`/license.html`） |
|---|---|---|
| 性質 | 任意金額的自願支持 | 500 元一次性買斷的商品 |
| 對象 | 免費使用的開源專案 | 通用壓槍腳本（SidAllFPS）正式版 |
| 管道 | ECPay `E0E3A` / PayPal Small / PayPal Project / 愛發電 AFDIAN | ECPay `5D513F0` / PayPal `DDK55NCQMW5DU` |
| 交付 | 無 | 付款後提供 HWID，由作者遠端啟用 |
| 視覺 | 青綠訊號色（`.btn--term`） | 琥珀色警示面板（`--amber`） |
| 提醒 | 「贊助非使用條件」 | 「不退款」「單一 HWID 不轉移」 |

兩頁互相加註（贊助頁指向授權頁、授權頁指向專案頁），避免使用者誤認。

---

## 四、內容模型（Content Collections）

`src/content.config.ts` 以 zod schema 定義，欄位即驗證規則：

```
slug / title / shortTitle / order
version / releaseDate
license(open|commercial|external) / licenseLabel
stack[] / techs[python|ahk|csharp|web]
category(battle|music|recoil|repeat|resource) / categoryLabel
summary / features[] / requirements[] / install[]
downloadUrl / downloadLabel / links[]
screenshots[] / motif / notes[] / commercial / external
```

- `techs[]` 是**正規化的篩選鍵**，與 `stack[]`（顯示用原文）分離。
  這是為了讓 `autohotkey v2` 這種描述性 stack 值能被 `ahk` 篩選命中。
- `screenshots[]` 帶 `width` / `height` → 渲染時直接輸出尺寸，避免 CLS。
- `notes[]` 為誠實聲明欄位（版本落差、試用限制、已移除功能）。

新增專案流程：**新增一個 `.md`** → 三頁自動出現該專案，不需改頁面程式碼。

---

## 五、正式站遷移時的對應（尚未執行）

本階段未修改正式站。正式遷移時需處理：

| 項目 | 原型做法 | 正式站對應 |
|------|----------|------------|
| 路由 | `/projects/<slug>.html` | 映射回既有公開 URL（如 `sidrecoilscript.html`），保護搜尋排名 |
| 贊助頁 | `/sponsor.html` | 正式站目前是首頁 `#sponsor-section` 區塊；遷移時可二選一（保留首頁區塊 + 導覽指向該區段，或正式成為獨立頁面並保留首頁捷徑） |
| 授權頁 | `/license.html` | 對應 `sidpayfor.html`，URL 保留不變 |
| 理念與聯絡 | 併入首頁 `#principle` / `#contact` | 正式站為 `about.html` / `contact.html` 兩個獨立頁；遷移時需決定是否仍保留獨立 URL（建議保留並轉址到首頁對應錨點） |
| 樣式 | `tokens.css` + `global.css` | 逐步替換 `instrument-editorial.css` / `main_style.css` |
| JS | `public/site.js`（Vanilla） | 取代 `project-filter.js` / `sid-nav.js` / `search.js`（jQuery 依賴） |
| 搜尋 | — | 沿用 `scripts/build-index.mjs` 產生 `search-index.json` |
| sitemap | — | 沿用 `scripts/build-sitemap.mjs`（排除 `search.html`） |
| 廣告 | 原型未含 | 正式站全站掛 Google AdSense（`ca-pub-1181746742151021`），遷移時需在新架構重新掛載 |
| 部署 | — | GitHub Pages Action（`dist/` → Pages） |
