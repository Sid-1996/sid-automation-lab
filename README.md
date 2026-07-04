# Sid Automation Lab

> 個人自動化、遊戲輔助、影像辨識工具的發布與下載入口站。
>
> 🌍 Live: **https://sid-1996.github.io/sid-automation-lab/**

---

## 這是什麼

這裡是 **Sid** 開發的自動化與工具作品的曝光平台 — 收錄 Path of Exile 流亡黯道工具組、遊戲半自動腳本、影像辨識研究、AHK / Python / OCR 專案等下載與說明。把分散的作品集中在一個有 SEO 的固定入口，方便有緣人從搜尋引擎與社群連結進入。

> 📌 **本 repo 是網站的原始檔**，不是純測試場，也不是檔案倉庫。
> 網站本身同時部署於多個免費平台上（GitHub Pages、Vercel...），目的在於**分散曝光與提升可達性**。

---

## 🚀 已部署平台

| 平台 | 網址 | 用途 |
|------|------|------|
| GitHub Pages | <https://sid-1996.github.io/sid-automation-lab/> | 主入口、SEO 收錄 |
| Vercel | _陸續加入中_ | 預定第二入口（CDN 加速、自訂網域） |

---

## 🧩 主要收錄專案

- 📦 **Path of Exile 流亡黯道工具組（Sid 工具箱）** — 半自動戰鬥、找尋快遞、AHK 巨集
- 🎯 **後座力輔助腳本 (Sid Recoil Script)** — 多款射擊遊戲滑鼠後座力補償
- 🔍 **圖像識別 / 模擬輸入研究** — OCR 研究筆記與工具
- 🤖 **Automation / OCR / AHK / Python 研究** — 各類雜項自動化腳本
- 🗒️ **開發宗旨** — 為什麼做這些、理念

完整工具與文章列表，請看站內導航。

---

## 📣 聯絡作者

從站內點選「**聯絡作者 →**」（新分頁開 Google Form），可留下訊息、合作邀約、或回報問題。

---

## 🛠️ 給開發者 / 重度讀者

雖然本 repo 的編輯權限只給站主本人，但若你想 fork 架出自己的「作品集曝光站」也行，整站結構如下。

### 目錄結構

```
Sid Automation Lab/
├─ *.html                ← 16 個靜態頁面
├─ favicon.svg
├─ robots.txt            ← 搜尋引擎指示
├─ sitemap.xml           ← 自動生成
├─ ads.txt               ← Google AdSense 驗證
├─ search-index.json     ← fuzzy 搜尋索引
├─ vercel.json           ← Vercel 部署設定
├─ serve.bat             ← Windows 本地一鍵 server
│
├─ uploads/
│  ├─ content/           ← 內容圖（含 3 張輪播圖）
│  └─ background/        ← 41 張 section 背景圖
│
├─ files/
│  ├─ main_style.css
│  ├─ search.js          ← fuse.js fuzzy 搜尋
│  ├─ slideshow-local.js ← 自包含輪播
│  ├─ theme/files/       ← jQuery主題 plugins
│  └─ cdn_local/         ← 內化的 Weebly CDN 資源
│      ├─ css/ + js/ + fonts/
│
└─ scripts/              ← Node 維運工具
   ├─ build-index.mjs    ← 重建搜尋索引
   ├─ build-sitemap.mjs  ← 重建 sitemap（支援 $env:SITE_BASE）
   ├─ check-missing.mjs  ← 列出缺失的站內資源
   ├─ download-cdn.mjs   ← 內化外部 CDN
   ├─ inject-favicon.mjs
   ├─ inject-search.mjs
   └─ ...
```

### 本地預覽

```powershell
# Windows
.\serve.bat                # 預設 8080，自動開瀏覽器

# 或 Python / Node
python -m http.server 8080
npx serve -l 8080
```

開 `http://localhost:8080/`。

### 維運指令

| 任務 | 指令 |
|------|------|
| 檢查缺資源 | `node scripts/check-missing.mjs` |
| 重建搜尋索引 | `node scripts/build-index.mjs` |
| 重建 sitemap（自訂網域） | `$env:SITE_BASE="https://yourdomain.com"; node scripts/build-sitemap.mjs` |

---

## 📦 給站主的發布流程

1. 編輯 / 新增 HTML 頁面、`uploads/` 素材
2. `node scripts/check-missing.mjs` 確認站內連結無 404
3. `node scripts/build-index.mjs` + `node scripts/build-sitemap.mjs` 重建
4. `git add -A && git commit -m "..." && git push`
5. GitHub Pages 自動 rebuild（1-2 分鐘）
6. Vercel 鏡像同步（未來）

---

## 📜 授權

站內素材 / 工具版權依各工具說明頁標示為準。
未標示者默認僅供個人下載使用，請勿整站重散佈。

---

## ✨ 來源

本站原本由 Weebly 提供，後由站主 2026 年初導出並改寫成純靜態檔案，
內化所有依賴資源並遷移至 GitHub Pages，未來再加入 Vercel 雙平台鏡像。

© 2026 Sid · 獨立自動化開發者
