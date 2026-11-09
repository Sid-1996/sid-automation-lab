# 設計決策凍結紀錄 — Sid Automation Lab 改版

- **凍結日期**：2026-11-09
- **凍結狀態**：業主已確認全部 18 項決策（「同意全部推薦」）
- **效力**：本文件是後續正式遷移（Phase 1／Phase 2）的唯一依據。
  偏離本文件的設計變更需回到業主確認後才可進行。

---

## 一、決策總表

| # | 議題 | 決策 | 對應實作 |
|---|------|------|----------|
| Q1 | 整體冷度調性 | 維持現況（深色石墨 + 青綠訊號色） | `tokens.css` 全套色票 |
| Q2 | Hero 訊號面板 | 保留並強化（唯一非清單元素，維持品牌記憶點） | `components/SignalPanel.astro` |
| Q3 | 首頁與列表分工 | 首頁放精選 3 筆、列表頁放全部 6 筆 | `index.astro` / `projects.astro` |
| Q4 | 正式站 URL | 保留既有 URL + 轉址（301 語意），保護搜尋排名 | `components/RedirectPage.astro` + 6 個轉址頁 |
| Q5 | Changelog 區塊 | 不加（無統一變更紀錄來源） | — |
| Q6 | 專案頁顯示價格 | 不顯示（價格只在授權頁出現，因該處本來就公開） | `projects/[slug].astro` / `license.astro` |
| Q7 | C 終端元素密度 | 維持現況（四處，局部使用） | 理念區 / 贊助區 / `.env` 區 / mono 標籤 |
| Q8 | 淺色模式 | 不做 | — |
| Q9 | 中文字型 | 系統字（PingFang TC / 微軟正黑體），零外部請求 | `tokens.css` `--font-sans` |
| Q10 | OG 圖片 | 每種頁型各做一張（共 5 張） | 遷移 Phase 2 產出 |
| Q11 | 遷移策略 | 分兩階段（先換視覺層保留 URL，再整理內容與 URL） | 遷移計畫 |
| Q12 | 舊 Weebly／jQuery 依賴 | 遷移完成即全數移除 | — |
| Q13 | 內容真實來源 | 放 repo（Content Collections），不引入 CMS | `src/content/projects/*.md` |
| Q14 | 兩個「贊助支持」按鈕 | 拆兩頁並改名：**贊助開發** / **購買授權** | `sponsor.html` / `license.html` + 導覽與頁尾 |
| Q15 | `sidpayfor.html` meta | 改寫為準確描述「授權購買」（原 meta 寫的是贊助開源，與內容不符） | `license.astro` |
| Q16 | Google AdSense | 保留，需在版型中預留廣告版位 | 遷移 Phase 2 產出 |
| Q17 | `about.html` / `contact.html` | 保留既有 URL + 轉址到首頁對應錨點 | `about.astro` / `contact.astro` |
| Q18 | 導覽項目數 | 維持 5 項（1024px 實測不重疊） | `components/SiteHeader.astro` |

---

## 二、URL 對照表（遷移依據）

GitHub Pages 無伺服器端 301，轉址採「meta refresh + canonical + noindex + JS replace」四合一。

| 既有公開 URL | 轉址目標 | 說明 |
|--------------|----------|------|
| `/index.html` | `/index.html` | 保留，新增 `#support` / `#contact` 錨點 |
| `/automation-projects.html` | `/projects.html` | 專案目錄 |
| `/sidrecoilscript.html` | `/projects/sidallfps.html` | 通用壓槍腳本 |
| `/sidpayfor.html` | `/license.html` | 正式版授權（**網址不變**） |
| `/about.html` | `/index.html#principle` | 開發宗旨併入首頁理念區 |
| `/contact.html` | `/index.html#contact` | 聯絡作者併入首頁聯絡區 |
| `/search.html?q=…` | `/projects.html?q=…` | 查詢字串以 `preserveQuery` 帶過去 |
| 其餘專案頁 | 對應 slug 頁 | 逐頁建立對照表 |
| `/search.html`（索引） | 不入 sitemap | 維持既有規則 |

> 轉址頁皆為 `noindex,follow`，canonical 指向最終目標頁，權重不分散。

---

## 三、內容誠實性原則（不可放寬）

1. 不虛構即時數據、線上狀態、執行紀錄、下載次數、使用者數或評分。
2. 版本／授權／發布日期一律以 `gh` CLI 查證上游 repo 現況，無者顯示「未發布版本」。
3. 官方截圖為原圖複製，圖說如實標註版本落差（例：OCR 截圖為 v0.1.8 時期，現行 v0.4.8）。
4. 商業項目限制如實標註（FDFD 試用版限 3 組槍械預設）。
5. **贊助與授權是兩件不同的事**，文案不得混用：
   - 贊助開發＝任意金額的自願支持，不影響任何功能
   - 購買授權＝500 元一次性買斷的 SidAllFPS 正式版
6. 已知過時內容保留但明確標示（深空之眼舊「烤肉」截圖已排除）。

---

## 四、已產出 vs 待產出

### 已完成

| # | 項目 | 產出位置 |
|---|------|----------|
| 1 | 5 張頁型專屬 OG 圖片（1200x630，Pillow + Noto Sans TC，配色取自 tokens.css） | `public/images/og-{home,projects,detail,sponsor,license}.png`，產生腳本 `scripts/make-og.py` |
| 2 | 既有 URL 轉址頁（6 個） | `src/pages/{about,contact,sidpayfor,automation-projects,sidrecoilscript,search}.astro` |
| 3 | 頁型專屬 OG 接入各頁 meta | `BaseLayout.astro` 的 `og` 屬性 |

### 仍待產出（Phase 2）

| # | 項目 | 狀態 |
|---|------|------|
| 1 | Google AdSense 版位（位置待業主指定） | 待指定位置 |
| 2 | 正式站各專案頁 → slug 的完整 URL 對照表 | 待建立 |
| 3 | 遷移 Phase 1 / Phase 2 執行計畫 | 待撰寫 |

---

## 五、變更紀錄

| 日期 | 變更 |
|------|------|
| 2026-11-09 | 初版凍結。業主確認 Q1／Q4／Q9。 |
| 2026-11-09 | 補做盤點：發現正式站兩套同名「贊助支持」金流、`sidpayfor` meta 與內容不符、全站 AdSense。業主「同意全部推薦」，18 項全數凍結。 |
