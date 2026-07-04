# Sid Automation Lab — Weebly → Vercel 遷移指令包

> 角色：執行 Agent（由 PM/技術專家主控）
> 工作目錄：`C:\Code play first\Sid Automation Lab`
> 目標：將 Weebly 封裝導出的靜態站完整遷移至 Vercel，並保留視覺與行為一致。

---

## 0. 任務大綱（必讀，先確認再開工）

1. **盤點** — 列舉 HTML 頁、外部 CDN、相依資源（SWF、ZIP、EXE、字型）並記錄權重。
2. **清理外部依賴** — Weebly CDN（`cdn*.editmysite.com`、`www.weebly.com`）在 Vercel 上仍可運作，但**應該內化**以避免第三方失效。
3. **修正路徑** — Weebly 內部連結是相對根，Vercel 用絕對或基底相對，需檢查不漏。
4. **字型內化** — Cabin、Montserrat 為 Google Fonts 鏡像於 Weebly CDN，建議改為本機。
5. **媒體** — `apps/audioPlayer2.swf`、下載 ZIP/EXE 在 Vercel 正常提供，需設 MIME。
6. **驗證** — 本機 `vercel dev` 或 `python -m http.server` 全巡一遍。
7. **部署** — `vercel deploy`，確認 Console 0 Error 0 Warning。

---

## 1. 注意事項提醒（Cautions）

| # | 項目 | 提醒 |
|---|------|------|
| C-01 | **檔名亂碼** | uploads 內有中文檔名（如 `硬體序號查詢工具.zip`），Git 預設 UTF-8，Vercel 部署正常；但若走 FTP/zip 上傳需注意。 |
| C-02 | **HTML entities** | 標題出現大量 `&#xxxxx;` 編碼（UTF-8 中文），無需解碼，瀏覽器會自動還原。 |
| C-03 | **`http://` 混用** | index.html 部分 CSS 用 `http://cdn*.editmysite.com/`，Vercel 預設 HTTPS，瀏覽器會擋 mixed content，**必須升級為 `https://`**。 |
| C-04 | **`cleanUrls`** | `vercel.json` 已啟用 `cleanUrls`，`38283303322344726088.html` 仍可訪問 `38283303322344726088`，但站內連結仍指向 `.html`，**不必強制改寫**。 |
| C-05 | **JSX-style 模板字串** | `initFlyouts` 內含 Handlebars-like 模板，**不要手動改寫**，用瀏覽器原生處理。 |
| C-06 | **第三方 Cookies** | `googlesyndication`、`recaptcha`、`paypalobjects`、`payment.ecpay.com.tw` 等**外連**保持即可，不要內化。 |
| C-07 | **目錄大小** | `background-images` 含大量 JPG，部署會略慢；建議另外評估對未使用圖片做清理（人工判斷，不可批次刪）。 |
| C-08 | **SWF 播放** | `apps/audioPlayer2.swf` 在現代瀏覽器（Chrome 88+）**已停止支援**。僅作為靜態檔交付，不需修復播放。 |
| C-09 | **`/apps/search`** | Weebly 表單 action 指向 `/apps/search`，這是 Weebly 後端，**Vercel 上會 404**。需評估是否改為 Google 表單或移除。 |
| C-10 | **`.swf` 在 Vercel** | 預設不會被擋，但若開啟 Security Headers 可能被限制。已在 `vercel.json` 設置 `application/octet-stream`。 |

---

## 2. 潛在風險警告（Risks）

| # | 風險 | 影響 | 觸發條件 |
|---|------|------|----------|
| R-01 | **Mixed Content HTTPS 警告** | 元件失效、版面破碎 | `http://` 引用 CDN，瀏覽器升 HTTPS 後 |
| R-02 | **Weebly CDN 失效** | 主題、字型、社群圖示消失 | `cdn*.editmysite.com` 服務中斷 |
| R-03 | **`marketplace.editmysite.com`** | `powr-hit-counter` 等外掛失效 | 該 CDN 服務商政策變動 |
| R-04 | **Google AdSense 政策** | 廣告不顯示 | `adsbygoogle.js` 需正式 AdSense 帳號且 HTTPS 同意 |
| R-05 | **下載連結 BOM** | ZIP/EXE 內容錯誤 | 中文檔名 + 不當 Content-Disposition |
| R-06 | **`NaN% NaN%`** | 背景圖位置失效（CSS 仍會 fallback） | style 內 `background-position: NaN% NaN%` |
| R-07 | **`undefined undefined`** | 同上 | `background-position: undefined undefined` |
| R-08 | **大量 inline JS** | Console 警告但不影響功能 | `initCustomerAccountsModels` 等，需 `_W.customerLocale` 觸發分支判斷 |
| R-09 | **靜態檔大小上限** | Vercel Hobby 計畫單檔 100MB | EXE/ZIP 須確認 < 100MB |
| R-10 | **路徑基底變更** | 子目錄資源 404 | 若設子路徑部署，`/uploads/...` 須檢查 |

---

## 3. 具體錯誤修復方案（Troubleshooting）

### T-01 Mixed Content（最常見）
```
症狀：版面錯亂、CSS 沒套用、字型沒載入
主因：HTML 用 http:// 引用 cdn*.editmysite.com
修復：
    1. 全域搜尋：
       Get-ChildItem *.html | Select-String -Pattern "http://cdn\d+\.editmysite\.com"
    2. 全部改為 https://
    3. sed（Git Bash）：
       find . -name "*.html" -exec sed -i 's|http://cdn|https://cdn|g' {} +
驗證：DevTools Network → 確認無 "blocked:mixed-content"
```

### T-02 圖片 404
```
症狀：背景圖、產品縮圖不顯示
主因：uploads 路徑已扁平化為 `uploads/content/` 與 `uploads/background/`
修復：
    1. 確認 uploads/ 整棵資料夾已上傳
    2. 若部署在子路徑，加 base href：
       <base href="/">
    3. 確認 .htaccess-style 的 rewrites 在 vercel.json 中不限縮
驗證：DevTools Network → 看 404 條目
```

### T-03 字型沒載入
```
症狀：標題變 system-ui，Cabin/Montserrat 沒套用
主因：字型來源被擋或失效
修復：
    1. 短期：把
       http://cdn2.editmysite.com/fonts/Cabin/font.css?2
       https://cdn2.editmysite.com/fonts/Cabin/font.css?2
    2. 長期：下載 woff2 至 /fonts/，改用 @font-face
       （位於 files/theme/ 即可）
驗證：DevTools Network → font 請求是否 200
```

### T-04 下載 ZIP/EXE 損壞
```
症狀：下載的 .zip / .exe 無法解壓
主因：MIME 錯誤或被中間層改寫
修復：
    1. 確認 vercel.json 內已設置 octet-stream
    2. Vercel 預設正確，無需手動設 Content-Disposition
    3. 若 Git 自動 CRLLF 改寫，於 .gitattributes 加：
       *.zip binary
       *.exe binary
驗證：curl -I https://.../uploads/....zip 看 Content-Type
```

### T-05 SWF 不播放
```
症狀：Flash player 區塊空白
主因：Chrome 88+ 已停用 Flash、所有主流瀏覽器不再支援
修復：
    1. 無需修，這是時代的眼淚
    2. 若需音訊播放，建議替換為 <audio src="...">
    3. 或隱藏整個區塊
```

### T-06 `/apps/search` 404
```
症狀：搜尋按鈕送出後 404
主因：Weebly 後端不存在
修復：
    方案 A（建議）：改為靜態 Search，可用 fuse.js：
        <script src="https://cdn.jsdelivr.net/npm/fuse.js@7"></script>
        <script src="/search.js"></script>
    方案 B：移除搜尋框
    方案 C：連結到 Google Site Search：
        https://www.google.com/search?q=site:yourdomain+{keyword}
```

### T-07 Vercel 部署失敗 `404 NOT_FOUND`
```
症狀：首頁可訪問，但內頁 404
主因：vercel.json rewrites 規則或 cleanUrls 衝突
修復：
    1. 暫時移除 rewrites 區塊
    2. 確認 buildOutputDirectory 設定正確
    3. 若用 Vercel CLI：
       vercel --debug
```

### T-08 `powr-hit-counter` 計數器失效
```
症狀：訪客計數器不會跳
主因：用了 marketplace.editmysite.com 第三方 app
修復：
    1. 若不需要就移除
    2. 替代：使用 GoatCounter（自架或 cloud），5 行 JS 替換
```

### T-09 Google AdSense 沒顯示
```
症狀：廣告位空白
主因：帳號未驗證 / 政策不符 / blocked
修復：
    1. 確認 ca-pub-1181746742151021 已通過審核
    2. 確認 ads.txt 已放置於根目錄：
       google.com, pub-1181746742151021, DIRECT, f08c47fec0942fa0
    3. HTTPS 必須啟用
```

### T-10 Vercel 部署 Sub-directory 404
```
症狀：部署在 https://user.vercel.app/sid/
       連結全部 404
主因：內部連結為根相對路徑
修復：
    方案 A：在 Vercel 設 Root Directory 為 "."（或留空）
            並用自訂網域
    方案 B：在 HTML <head> 加
            <base href="/sid/">
    推薦方案 A：使用自訂網域
```

---

## 4. 驗收清單（Acceptance Checklist）

部署完成後逐項確認：

- [ ] 全部 16 個 HTML 載入 200，無 404
- [ ] DevTools Network 無 `blocked:mixed-content`
- [ ] DevTools Network 無 `CORS` 錯誤
- [ ] 標題字型（Cabin / Montserrat）正確顯示
- [ ] 首頁背景圖 / 各項目頁背景圖皆正常
- [ ] 5 個 project card 連結可跳轉
- [ ] 選單下拉（PC 與 mobile 兩套）皆可開合
- [ ] 贊助按鈕（ECPay / PayPal）皆可點擊
- [ ] 至少 1 個 .zip 可成功下載並解壓
- [ ] Lighthouse Performance ≥ 70（建議 ≥ 85）
- [ ] Lighthouse SEO ≥ 90
- [ ] Console 無 Error、Warning < 3 條
- [ ] robots.txt 與 sitemap.xml 已建立（建議）

---

## 5. 建議附帶檔案（PM 已建立，執行 Agent 確認即可）

- ✅ `vercel.json` — 部署設定（已包含）
- ✅ `.gitignore` — Node / IDE / OS 排除（已包含）
- 📝 後續可加：`robots.txt`、`sitemap.xml`、`ads.txt`

---

## 6. 最少行動清單（Minimum Viable Migration）

若時間有限，**只做這 5 步**即可上線：

1. ↑ 把整個 `C:\Code play first\Sid Automation Lab` 上傳到 GitHub repo
2. ↑ Vercel Import 該 repo（Root Directory 留空，Framework = Other）
3. ↑ 用 `sed -i 's|http://cdn|https://cdn|g'` 修正 mixed content
4. ↑ 在 Vercel Project Settings → Environment Variables：無需任何變數
5. ↑ 部署 → 驗收清單逐項打勾

預估耗時：30 分鐘。
