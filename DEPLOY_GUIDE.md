# Vercel 部署 — 執行 Agent 快速指南

## 1. 前置

```powershell
# 確認 Node 已裝
node -v
npm -v

# 安裝 Vercel CLI（若尚未）
npm i -g vercel
```

## 2. 初始化 Git（若 repo 未存在）

```powershell
cd "C:\Code play first\Sid Automation Lab"
git init
git add .
git commit -m "Initial commit: Weebly static export"
git branch -M main
# 在 GitHub 建立空 repo 後：
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

## 3. 修正 Mixed Content（一行命令）

```powershell
# 將全部 http://cdn 改為 https://cdn（PowerShell）
Get-ChildItem -Recurse -Include *.html | ForEach-Object { 
    (Get-Content $_.FullName) -replace 'http://cdn', 'https://cdn' | Set-Content -Encoding UTF8 $_.FullName 
}
```

或 Git Bash：
```bash
find . -name "*.html" -exec sed -i 's|http://cdn|https://cdn|g' {} +
find . -name "*.html" -exec sed -i 's|http://www\.weebly\.com|https://www.weebly.com|g' {} +
```

## 4. 本機驗證

```powershell
# 選 A：Vercel CLI
vercel dev

# 選 B：Python（最單純）
python -m http.server 8000
```

瀏覽器開 `http://localhost:8000`：
- 確認首頁渲染
- 點擊各選單項目無 404
- F12 Console 無紅字
- F12 Network 全部 200/304

## 5. 部署

```powershell
# 第一次會問互動
vercel

# 之後：
vercel --prod
```

或從 Vercel 後台：
1. https://vercel.com/new
2. Import Git Repository → 選你的 repo
3. Framework Preset = **Other**
4. Root Directory 留空
5. 不需 Build Command、不需 Output Directory
6. Deploy

## 6. 綁定自訂網域（選用）

Vercel 後台 → Project → Settings → Domains → 加入 `sid.yourdomain.com`
依指示到 DNS provider 加 A / CNAME 紀錄。

## 7. 後續優化（部署後）

- 把 ads.txt 放到根目錄
- 用 `[generate-sitemap]` 之類的 Vercel plugin 或線上工具生成 sitemap.xml
- 把 robots.txt 加好
- 設定 Google Search Console 並驗證網域
- 申請 GoatCounter（隱私友善的分析）

---

## 8. 緊急聯絡 / 復原

| 狀況 | 動作 |
|------|------|
| 部署失敗 | `vercel --debug` 看 log |
| 站台掛掉 | Vercel 後台 → Deployments → Promote 上一版本 |
| DNS 沒生效 | `nslookup yourdomain.com` 確認指向 Vercel |
| 圖片大量 404 | 確認 uploads/ 已推上 Git |
| Mixed Content 警告 | 重新跑 §3 指令，部署 |

---

**最低可行方案**：Git init → 修正 mixed content → 一鍵 `vercel --prod`，30 分鐘上線。
