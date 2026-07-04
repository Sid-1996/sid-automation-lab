# 執行計劃書(二):收尾動作 — AGENT.md 更新 + Git Commit/Push

> 專案路徑:`C:\Code play first\Sid Automation Lab`
> 前置條件:`PLAN-sidpayfor-sidexiletoolbox-fix.md` 的任務一、任務二已全部執行完畢且通過驗證(PM 已獨立稽核確認一致)
> 執行者:另一個 Agent
> 全程用 `pwsh` 執行,不要用舊版 `powershell.exe`(理由見 `AGENT.md` Shell 建議段落)

---

## 0. PM 稽核備註(執行前先知道)

- 獨立核對過 `sidpayfor.html` / `sidexiletoolbox.html` 的實際檔案內容,確認跟計劃一致、中文內容正常,可以放行進收尾階段。
- **README.md 不用改**:核對過 `README.md` 全文,裡面**沒有**列出 `sidpayfor.html`/`sidexiletoolbox.html` 這兩個問題(原本以為的「已知問題清單」實際上只存在於 `AGENT.md` 的「剩餘」條目裡)。所以收尾只需要動 `AGENT.md`,不用碰 `README.md`,不要自己加一段進 README 去。
- 目前 `git status --porcelain` 顯示待處理的檔案:
  ```
  M sidexiletoolbox.html
  M sidpayfor.html
  ?? PLAN-sidpayfor-sidexiletoolbox-fix.md
  ?? uploads/7/7/0/3/77032051/wechat-qrcord_orig.jpg
  ```
  執行本文件後,`AGENT.md` 也會變成 `M`,連同上面 4 項一起 commit。

---

## 1. 更新 `AGENT.md`

### 步驟 1 — 更新「剩餘」清單,標記兩項已解決

- **file_path**: `C:\Code play first\Sid Automation Lab\AGENT.md`
- **old_string**:
```
   - `sidexiletoolbox.html` 缺 3 張 demo 圖（已刪 `<img>`），段落文字仍保留
   - `sidpayfor.html` WeChat QR 卡片區塊內只剩空 `<a></a>` 殼
```
- **new_string**:
```
   - ~~`sidexiletoolbox.html` 缺 3 張 demo 圖~~ → 已於 2026-07-05 補回（`1847905122_2.png` / `1029564595_2.jpg` / `1003025771_2.jpg`，檔案本來就在 uploads/，純接線）
   - ~~`sidpayfor.html` WeChat QR 卡片區塊內只剩空 `<a></a>` 殼~~ → 已於 2026-07-05 修復；順帶發現並修掉「巢狀 `<html>`」結構債（詳見下方版本紀錄 v1.2）
```

### 步驟 2 — 新增版本紀錄 v1.2

- **file_path**: 同上
- **old_string**:
```
- v1.1：新增 `pwsh` 使用建議（中文編碼更穩定），補充中文亂碼相關 Troubleshooting（2026-07-04）
```
- **new_string**:
```
- v1.1：新增 `pwsh` 使用建議（中文編碼更穩定），補充中文亂碼相關 Troubleshooting（2026-07-04）
- v1.2：修復 `sidpayfor.html` 巢狀 `<html>` 結構債（原本內嵌了一份完整獨立 HTML 文件，造成雙重 head/body/html 標籤）；WeChat 改列為「02 / 聯繫作者領取授權」的第二聯繫管道（給無法用 FB 的使用者）；移除「真的有在運作的網站啊」GIF 段落（素材已由使用者確認捨棄）；`sidexiletoolbox.html` 補回 3 張示範截圖（2026-07-05）
```

> ⚠️ 兩處 `old_string` 都要先用 `read_file` 讀 `AGENT.md` 目前實際內容核對一次再動手,不要假設本文件寫的內容跟檔案當下狀態逐字相符(例如如果有人在這之間又手動改過 `AGENT.md`)。

---

## 2. Git Commit / Push

### 步驟 3 — 確認要 commit 的檔案範圍

```pwsh
cd "C:\Code play first\Sid Automation Lab"
git status --porcelain
```

預期看到剛好這 4 項變動(不多不少):
```
M AGENT.md
M sidexiletoolbox.html
M sidpayfor.html
?? PLAN-sidpayfor-sidexiletoolbox-fix.md
?? uploads/7/7/0/3/77032051/wechat-qrcord_orig.jpg
```

如果看到其他檔案也被列進來(例如不小心動到別的 `.html`),**停下來,不要繼續 commit**,先確認為什麼有計劃外的變動。

### 步驟 4 — Commit

```pwsh
git add sidpayfor.html sidexiletoolbox.html AGENT.md PLAN-sidpayfor-sidexiletoolbox-fix.md uploads/7/7/0/3/77032051/wechat-qrcord_orig.jpg
git commit -m "fix: sidpayfor.html 移除巢狀 HTML 結構、新增 WeChat 聯繫管道；sidexiletoolbox.html 補回 3 張示範圖"
```

> 用明確列出檔名的 `git add`,不要用 `git add .`——避免不小心把工作目錄裡其他未預期的暫存/測試檔案一起帶進 commit。

### 步驟 5 — Push

```pwsh
git push
```

推上去後會觸發 Vercel 自動部署。

---

## 3. 部署後驗證

### 3.1 確認部署狀態
到 Vercel Dashboard 確認這次 push 對應的部署是 `Ready`(成功),不是 `Error` 或卡在 `Building`。

### 3.2 正式環境視覺覆核(用 Vercel 給的 production URL,不是 localhost)
- `/sidpayfor.html`
  - 瀏覽器分頁標題應顯示原本頁面標題(贊助腳本 - Sid Automation Lab),不是 `SID LICENSE CENTER`
  - 「02 / 聯繫作者領取授權」下方看得到 WeChat QR 卡片,圖片清楚、沒有跑版
  - 往下捲動,確認**不會再看到**舊版孤兒內容或空白區塊
- `/sidexiletoolbox.html`
  - 「對話框的抓取，非常重要」「背包F7設定相關」兩處文字旁邊都看得到對應截圖
  - 右側原本就有的 `1202643573_2.jpg` 上方新圖片沒有跟其他圖片錯位

### 3.3 收尾檢查
```pwsh
cd "C:\Code play first\Sid Automation Lab"
node scripts\check-missing.mjs
```
預期輸出仍是 `missing 2`(兩條 `siddownload.html` 的既有項目,跟這次任務無關,不會因為這次改動增加)。

---

## 4. 風險與 Troubleshooting

| 風險 | 徵兆 | 處置 |
|------|------|------|
| `AGENT.md` 的 `old_string` 找不到匹配 | `edit_block` 回報 no match | 代表有人在這之間又動過 `AGENT.md`。重新讀取檔案該區域,跟本文件描述的差異點在哪,手動調整比對範圍後再試 |
| `git commit` 中文訊息在終端機顯示亂碼 | 訊息裡的中文字變 `?` 或亂碼符號 | 確認是用 `pwsh` 執行(不是 `powershell.exe`);另外可跑 `git config --global core.quotepath false` 與 `git config --global i18n.commitEncoding utf-8` |
| `git push` 失敗(需要先 pull) | 錯誤訊息提到 remote 有新 commit / non-fast-forward | 先跑 `git pull --rebase`,確認沒有衝突後再 push;如果有衝突,停下來回報,不要自行選邊解衝突 |
| Vercel 部署狀態卡在 `Error` | Dashboard 顯示紅色錯誤 | 點進 build log 看實際錯誤訊息回報給 PM,這個專案沒有 build step,理論上不該出現建置錯誤;如果出現,可能是 `vercel.json` 或檔案編碼問題,不要自行猜測修改 `vercel.json` |
| 正式環境跟本機驗證結果不一致 | 例如本機看得到 WeChat 圖,正式站看不到 | 檢查圖片路徑大小寫(Vercel 部署環境通常是 case-sensitive 檔案系統，跟 Windows 本機不同，`wechat-qrcord_orig.jpg` 大小寫要完全比對檔名) |

---

## 5. 明確的「不要做」清單

- 不要順手把 `README.md` 也改了——本輪核對確認不需要動它
- 不要用 `git add .`,避免帶進不相關的暫存檔案
- 不要在這次 commit 裡夾帶 `siddownload.html` 移除任務(那是另一份獨立計劃,分開提交)
- 不要在推上 Vercel 後,發現任何非本次計劃內的小問題就順手一起修——記錄下來回報給 PM,另外排計劃
