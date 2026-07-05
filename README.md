# Sid Automation Lab

> 自動化工具與遊戲效率專家 — 基於圖像識別與模擬輸入技術的開源實驗室。

![Sid Automation Lab Hero](uploads/content/2026-07-05%20153548.png)

🌐 **Live site:** <https://sid-1996.github.io/sid-automation-lab/>

## 開發宗旨

- 堅持開源透明 — 所有腳本公開釋出
- 不讀寫記憶體、不修改遊戲文件
- 專注圖像識別與模擬輸入技術
- 讓工具回歸省時省力的本質

## Projects

| Project | Stack | Game / Use case |
|---------|-------|-----------------|
| [《流亡黯道2》工具箱](https://sid-1996.github.io/sid-automation-lab/sidexilegametool.html) | AHK v2 | Path of Exile 2 |
| [《流亡黯道》舊版工具箱](https://sid-1996.github.io/sid-automation-lab/sidexiletoolbox.html) | AHK v1 | Path of Exile (legacy) |
| [《深空之眼》半自動腳本](https://sid-1996.github.io/sid-automation-lab/aethergazersemiauto.html) | AHK v2 | Aether Gazer |
| [《棕色塵埃2》音遊助手](https://sid-1996.github.io/sid-automation-lab/browndust2-music-assist.html) | AHK v2 | Brown Dust 2 |
| [No-Code OCR 觸發點擊工具](https://sid-1996.github.io/sid-automation-lab/ocr-trigger-clicker.html) | Python + AHK v2 | 通用（跨遊戲 + 重複作業） |
| [通用壓槍腳本](https://sid-1996.github.io/sid-automation-lab/sidrecoilscript.html) | AHK v1 | FPS 射擊遊戲 |

## Tech Stack

- **AutoHotkey v1 / v2** — 系統層按鍵 / 滑鼠 / 像素偵測
- **Python** — 進階影像處理（OpenCV / Tesseract OCR）
- **OpenCV** — 形狀比對 / Canny edge / 模板比對
- **跨解析度設計** — 視窗比例座標而非絕對像素

## Development

詳見 [AGENTS.md](./AGENTS.md)。

## License

© 2026 Sid. All rights reserved.

除非另有明示，本站所有內容採 **CC BY-NC-SA 4.0（姓名標示 — 非商業性 — 相同方式分享 4.0 國際）**：

- 允許在標示原作者前提下自由分享與修改
- **禁止任何商業用途**
- 衍生作品必須以相同授權釋出

完整條款：<https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hant>
