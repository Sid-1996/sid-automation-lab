---
slug: aethergazer-semiauto
title: "《深空之眼》半自動腳本"
shortTitle: "深空之眼 半自動腳本"
order: 3
version: "1.1.2"
releaseDate: "2026-06-11"
license: open
licenseLabel: "公開源碼"
stack: ["autohotkey v2", "findtext"]
techs: ["ahk"]
category: battle
categoryLabel: "戰鬥與生存輔助"
summary: "戰鬥半自動操作：普攻／連招等日常流程的輔助（FindText 圖像辨識），仍保留手動介入空間。"
commercial: false
external: false
downloadUrl: "https://github.com/Sid-1996/AetherGazer-SemiAuto-AHK/releases"
downloadLabel: "前往 Releases 下載"
links:
  - label: "GitHub 原始碼"
    url: "https://github.com/Sid-1996/AetherGazer-SemiAuto-AHK"
    kind: repo
features:
  - title: "自動普攻"
    detail: "以 FindText 圖像辨識判斷當前狀態並自動普攻，把重複的連點交給腳本。"
  - title: "連招流程輔助"
    detail: "把普攻與連招串成可重複的流程，減少戰鬥中的操作負擔。"
  - title: "視窗比例座標"
    detail: "定位點以視窗比例儲存，切換解析度或視窗大小後仍對得到位置。"
  - title: "自動更新檢查"
    detail: "啟動時檢查是否有新版本並提示。"
requirements:
  - "Windows 10 / 11"
  - "AutoHotkey v2"
  - "已確認可用的 AutoHotkey 安裝位置（1920×1080 / 1600×900 / 100% 縮放已驗證）"
install:
  - "在 Releases 下載 AetherGazer-AHK-v1.1.2.7z"
  - "解壓縮後以系統管理員身分執行腳本"
notes:
  - "v1.1.2 已移除「烤肉模式」與「赤音」角色支援。"
  - "本工具僅讀取畫面並模擬輸入，不讀寫記憶體、不修改遊戲檔案。"
motif: "IV"
screenshots: []
---

《深空之眼》半自動腳本是本站最早公開的專案之一，現行版本 v1.1.2（2026-11-06 釋出）。

它以 AutoHotkey v2 實作，靠 FindText 做畫面文字辨識判斷當前狀態，
再決定要不要執行普攻或連招。定位是「半自動減負」—— 腳本處理重複流程，
玩家仍保有戰術判斷與手動介入的空間。

v1.1.2 移除了「烤肉模式」與「赤音」角色；目前支援的角色為
通用模式、魂羽、緋染、巧构、庚辰、武羅、詩蔻蒂。
