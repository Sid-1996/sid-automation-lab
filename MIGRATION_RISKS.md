# Weebly → Vercel 遷移風險清單

> 本表為 PM/技術專家輸出之預判文件；執行 Agent 須於遷移前、後各核對一次。

---

## 外部資源依賴矩陣

| 來源類型 | 域名 / 路徑 | 是否健康保留 | 動作建議 |
|---------|------------|-------------|---------|
| Weebly 主題 CSS | `cdn11.editmysite.com/css/sites.css` | ⚠ 將改 HTTPS | 升級 https；長期內化至 `files/theme/` |
| Weebly 主題 CSS | `cdn11.editmysite.com/css/old/fancybox.css` | ⚠ 同上 | 同上 |
| Weebly 社群圖示 | `cdn11.editmysite.com/css/social-icons.css` | ⚠ 同上 | 同上 |
| 主題 CSS | `files/main_style.css?1783076445` | ✅ 本機 | 保留 |
| 字型 | `cdn2.editmysite.com/fonts/Cabin/font.css` | ⚠ | 升 https 或內化 |
| 字型 | `cdn2.editmysite.com/fonts/Montserrat/font.css` | ⚠ | 同上 |
| jQuery | `cdn11.editmysite.com/js/jquery-1.8.3.min.js` | ⚠ | 升 https |
| Weebly 多語系 | `cdn2.editmysite.com/js/lang/zh_TW/stl.js` | ⚠ | 升 https |
| Weebly main.js | `cdn11.editmysite.com/js/site/main.js` | ⚠ | 升 https |
| Marketplace | `marketplace.editmysite.com/uploads/b/...` | ❌ 不可依賴 | 移除 `powr-hit-counter` 等外掛 |
| 外連第三方 | Google AdSense/PayPal/ECPay/Facebook/GitHub | ✅ 健康 | 保留 |
| 路徑基底 | `//cdn1.editmysite.com` `//cdn11.editmysite.com` | ⚠ | 改 `https://` |
| 表單後端 | `/apps/search` | ❌ Weebly-only | 替換為靜態搜尋或 Google |

---

## 高優先修復（阻塞性）

1. **Mixed Content Repair** — `http://` 全部 `https://`
   - 影響：版面破碎、元件失效
   - 工時：≤ 5 分鐘（一行 sed 命令）
   - 阻擋 Vercel HTTPS 全部頁面

2. **Git LFS 不需要** — 確認無單檔 > 50MB
   - 檢查命令：`Get-ChildItem -Recurse | Where-Object {$_.Length -gt 50MB} | Select Name, Length`
   - 若有大型 EXE，需使用 Vercel 外部 storage 或 GitHub Releases

3. **目錄結構需含所有 HTML 在 root**
   - Vercel 部署預設 root = repo root
   - 不要把 HTML 放子目錄又用根連結

---

## 中優先修復（功能性）

4. **`/apps/search` 後端** — 替換或移除
5. **`powr-hit-counter` 計數器外掛** — 移除或替換
6. **`marketplace.editmysite.com` 外部依賴** — 移除

---

## 低優先修復（優化）

7. 字型內化（減少外部請求、Lighthouse 提升）
8. 主題 CSS 內化（減少 DNS lookup）
9. 圖片 lazy-loading（`background-image` 改 `<img loading="lazy">`）
10. JS 解 defer/async（jQuery/main.js 已是 inline）

---

## Browser Compatibility 提醒

| 瀏覽器 | 風險 | 說明 |
|--------|------|------|
| Chrome 88+ | SWF 不播 | Flash 停用，但僅 1 處音訊 SWF |
| Safari 14+ | OK | 主要 CSS3 / Flexbox / Webkit clip-path 均支援 |
| Firefox ESR | OK | 同上 |
| IE 11 | 不支援 | 網站已有 clip-path 等新語法，IE 不會列入支援 |

---

## Deployment Pipeline 預設

```
[Local Dev]
    └─ vercel dev (或 python -m http.server 8000)
        └─ 本機確認無 404、無 mixed content
[Git Push]
    └─ main branch → Vercel auto-deploy
[Production]
    └─ 自訂網域綁定
        └─ 啟用 HTTPS（Vercel 自動 Let's Encrypt）
```

---

## Rollback 計畫

若遷移後出問題：

1. 在 Vercel 後台 → Deployments → 點選上一個成功版本 → Promote to Production
2. 或：`vercel rollback`（CLI）
3. DNS 切換不需手動，Vercel 一鍵 rollback 即可

---

## 待辦（執行 Agent 接手後補上）

- [ ] 部署到 staging 環境（preview branch）
- [ ] 驗收清單 12 項逐條打勾
- [ ] Lighthouse 評分截圖
- [ ] ads.txt 上傳
- [ ] sitemap.xml 生成
- [ ] robots.txt 上傳
- [ ] 監控工具設定（Sentry / Plausible / GoatCounter）
