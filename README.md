# Sid Automation Lab

![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-lightgrey)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![AHK](https://img.shields.io/badge/AutoHotkey-v1%20%2F%20v2-0079C1)
![Python](https://img.shields.io/badge/Python-3.12-3776AB)

> 自動化工具與遊戲效率專家 — 基於圖像識別與模擬輸入技術的開源實驗室。

![Sid Automation Lab Hero](uploads/content/2026-07-05%20153548.png)

🌐 **Live site:** <https://sid-1996.github.io/sid-automation-lab/>

## 開發宗旨

- 堅持開源透明 — 所有腳本公開釋出
- 不讀寫記憶體、不修改遊戲文件
- 專注圖像識別與模擬輸入技術
- 讓工具回歸省時省力的本質

## Projects

| Project | 簡述 | Stack |
|---------|------|-------|
| [《流亡黯道2》工具箱](https://sid-1996.github.io/sid-automation-lab/sidexilegametool.html) | 血量監控、自動喝藥、自動拾取 | Python + AHK v2 |
| [《流亡黯道》舊版工具箱](https://sid-1996.github.io/sid-automation-lab/sidexiletoolbox.html) | 經典版流亡黯道輔助工具 | AHK v2 |
| [《深空之眼》半自動腳本](https://sid-1996.github.io/sid-automation-lab/aethergazersemiauto.html) | 戰鬥半自動操作 | AHK v2 |
| [《棕色塵埃2》音遊助手](https://sid-1996.github.io/sid-automation-lab/browndust2-music-assist.html) | 音樂節拍自動判定 | AHK v2 |
| [No-Code OCR 觸發點擊工具](https://sid-1996.github.io/sid-automation-lab/ocr-trigger-clicker.html) | 免寫碼 OCR 即時觸發，支援 10 種步驟與群組規則 | Python + AHK v2 |
| [🔒 通用壓槍腳本](https://sid-1996.github.io/sid-automation-lab/sidrecoilscript.html) | FPS 遊戲後座力補償（商業） | AHK v2 |

## Tech Stack

| 技術 | 用途 |
|------|------|
| AutoHotkey v1 / v2 | 系統層按鍵 / 滑鼠 / 像素偵測 |
| Python 3.12 | 進階影像處理與 GUI |
| PyQt6 | OCR 觸發工具 GUI 框架 |
| RapidOCR + ONNX | 繁體中文 OCR 辨識引擎 |
| OpenCV | 形狀比對 / 圖像模板比對 (matchTemplate + NMS) |
| TCP Socket | Python ↔ AHK v2 跨行程通訊 |
| 視窗比例座標 | 跨解析度設計（0~1 比值） |

## 安裝使用

### AHK 工具（流亡黯道 / 深空之眼 / 棕色塵埃2 / 壓槍腳本）

1. 安裝 [AutoHotkey v2](https://www.autohotkey.com/)（v1 工具需安裝 v1）
2. 從各工具頁面下載腳本
3. 以系統管理員身分執行（若目標程式以管理員權限執行）

### No-Code OCR 觸發點擊工具

1. 安裝 [AutoHotkey v2](https://www.autohotkey.com/)
2. 從 [Releases](https://github.com/Sid-1996/ocr-trigger-clicker/releases) 下載並解壓縮
3. 執行 `ocr-trigger-clicker.exe`

## 開發

詳見 [AGENTS.md](./AGENTS.md)。

本地開發：
```bash
# 啟動本地伺服器
serve.bat
# 或
npx serve .
```

## License

### 網站內容
本站頁面、樣式、腳本與圖片採 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hant) 授權。

### 開源工具
各工具之授權條款請參閱其獨立倉庫：
- [ocr-trigger-clicker](https://github.com/Sid-1996/ocr-trigger-clicker) → AGPL-3.0
- 其他開源 AHK 工具 → 各倉庫內 LICENSE 聲明
