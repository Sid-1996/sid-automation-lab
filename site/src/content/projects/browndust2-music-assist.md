---
slug: browndust2-music-assist
title: "《棕色塵埃 2》音遊助手"
shortTitle: "棕色塵埃 2 音遊助手"
order: 4
version: "1.0.2"
releaseDate: "2026-06-08"
license: open
licenseLabel: "公開源碼"
stack: ["autohotkey v2", "opencv"]
techs: ["ahk"]
category: music
categoryLabel: "音遊節拍"
summary: "音樂節拍自動判定：色彩偵測加上多區域可調節奏與浮動 UI，協助對上節拍時機。"
commercial: false
external: false
downloadUrl: "https://github.com/Sid-1996/BrownDust2-Beat-Helper/releases"
downloadLabel: "前往 Releases 下載"
links:
  - label: "GitHub 原始碼"
    url: "https://github.com/Sid-1996/BrownDust2-Beat-Helper"
    kind: repo
features:
  - title: "色彩偵測判定"
    detail: "以 OpenCV 做色彩偵測判斷音符打擊區的狀態，據以對齊判定。"
  - title: "多區域可調"
    detail: "支援多個判定區域，每個區域可各自調整，適應不同解析度與畫面配置。"
  - title: "浮動 UI"
    detail: "輔助面板可拖曳與縮放，放在不妨礙操作的位置。"
  - title: "INI 設定"
    detail: "設定以 INI 檔保存，方便在不同電腦間搬移。"
requirements:
  - "Windows 10 / 11"
  - "AutoHotkey v2"
  - "以系統管理員身分執行"
install:
  - "在 Releases 下載 BrownDust2-Beat-Helper-v1.0.2.zip"
  - "解壓縮後以系統管理員身分執行"
notes:
  - "定位為成就領獎用途的節拍輔助，並非以排名為目標的競爭型工具。"
  - "F3 為判定框調整，F4 為自動點擊程式的開關。"
motif: "V"
screenshots: []
---

《棕色塵埃 2》音遊助手協助在音樂小游戏中對上節拍時機。

它的做法是以色彩偵測判斷打擊區的狀態，再用多區域設定微調判定範圍，
搭配可拖曳縮放的浮動面板。設定以 INI 檔保存，搬到另一台電腦時只需複製設定檔。

這個工具的定位是「成就領獎用的節拍輔助」，並沒有為了排名成績而調整到極限精度 ——
這是設計時就明確取捨的部分。
