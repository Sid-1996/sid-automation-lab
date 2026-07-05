# AGENTS.md — Sid Automation Lab 開發協定

本專案為 GitHub Pages 靜態網站，內容為繁體中文。以下協定為必須遵守的硬性規則。

## 1. 編碼協定（最重要）

**所有檔案 I/O 必須使用 UTF-8。**

- ❌ 禁止使用 PowerShell `Set-Content` / `Out-File` / `Add-Content` 寫入含中文的檔案
  - PowerShell 5.1 預設使用 BIG5/GBK 編碼，會將非 ASCII 字元替換為 `?` (U+FFFD / 0xEFBFBD)
  - 這是本專案最嚴重的損壞來源，曾導致 13+ 個 HTML 檔案需要從 git 重建
- ✅ 寫入檔案請使用 Python：
  ```python
  with open(path, 'r', encoding='utf-8') as f: content = f.read()
  with open(path, 'w', encoding='utf-8') as f: f.write(content)
  ```
- ✅ 讀取/編輯檔案請使用 opencode 的 `read` / `edit` / `write` 工具（自動使用 UTF-8）
- ✅ 寫入完成後請驗證 FFFD=0：
  ```python
  assert open(path, 'rb').read().count(b'\xef\xbf\xbd') == 0
  ```

## 2. 專案結構

- 根目錄：`.html` 頁面（Weebly 靜態匯出）
- `uploads/content/`：圖片資源
- `files/`：`og-image.png` 等靜態資源
- `scripts/build-sitemap.mjs`：自動生成 `sitemap.xml`（讀取所有 `.html` 並排除 `REDIRECT_FILES` Set 中的重新導向頁）
- `scripts/build-index.mjs`：自動生成 `search-index.json` 給 `search.html` 用

### 重新命名歷史
以下 Weebly 原始檔名已重新命名為語意化檔名，舊檔保留作為 `<meta http-equiv="refresh">` 重新導向：

| 舊檔名 | 新檔名 |
|--------|--------|
| `122982683...html` | `browndust2-music-assist.html` |
| `208542018...html` | `other-tools.html` |
| `328793209...html` | `contact.html` |
| `332582120...html` | `automation-projects.html` |
| `382833033...html` | `about.html` |

涉及 `REDIRECT_FILES` Set 修改時請同步更新 `scripts/build-sitemap.mjs`。
`search.html` 永遠在 `REDIRECT_FILES` 中（noindex，不入 sitemap）。

## 3. Weebly 類別保留

- `wsite-*` 類別為 Weebly 佈局/樣式，**不可刪除或重新命名**
- 工具頁面的 `body class="wsite-... <page-id>"` 中 `<page-id>` 必須與檔名對應（例如 `ocrtriggerclicker`）
- 區塊結構 `wsite-section-wrap` / `wsite-section-content` / `wsite-section-elements` 必須保留

## 4. SEO 規則

每個公開頁面必須包含：
- `<html lang="zh-Hant">`
- Canonical tag：`<link rel="canonical" href="https://sid-1996.github.io/sid-automation-lab/<file>.html">`
- Meta description（繁體中文，80-160 字）
- OG tags：`og:title` / `og:description` / `og:image` / `og:url` / `og:type`
- Twitter Card：`twitter:card=summary_large_image`
- JSON-LD：`SoftwareApplication` 或 `WebSite`（首頁）
- H1 每頁僅一個

`search.html` 必須有 `<meta name="robots" content="noindex">` 且不入 sitemap。

## 5. Base URL

- 站台：`https://sid-1996.github.io/sid-automation-lab/`
- Repo：`https://github.com/Sid-1996/sid-automation-lab`

## 6. Commit 協定

- 訊息以 `seo:` / `fix:` / `feat:` / `chore:` 開頭
- SEO 任務 commit 訊息：`seo: <task summary>`
- 不要 amend 失敗的 commit — 修正後開新 commit
- 不要 force-push
- 提交前必跑 `node scripts/build-sitemap.mjs` + `node scripts/build-index.mjs`
- 提交前必驗證所有變更檔案 FFFD=0

## 7. 字型

- 繁體中文優先：`'PingFang TC'`, `'Microsoft JhengHei'`
- 程式碼：`'JetBrains Mono'`, `'Consolas'`, monospace
- `og-image.png` 使用 Noto Sans TC（Pillow 生成，1200x630）
