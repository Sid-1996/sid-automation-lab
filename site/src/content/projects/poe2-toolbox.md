---
slug: poe2-toolbox
title: 《流亡黯道 2》工具箱
shortTitle: 流亡黯道 2 工具箱
order: 1
version: "1.4.0"
releaseDate: "2026-11-05"
license: open
licenseLabel: "公開源碼 · AGPL-3.0"
stack: ["python 3.13", "pyside6", "opencv"]
techs: ["python"]
category: battle
categoryLabel: "戰鬥與生存輔助"
summary: "血量監控、自動喝藥、自動拾取 —— 把戰鬥中重複查看血量與喝藥的操作交給半自動工具。"
commercial: false
external: false
downloadUrl: "https://github.com/Sid-1996/PathofExile-Sid-GameTools_HealthMonitor/releases"
downloadLabel: "前往 Releases 下載"
links:
  - label: "GitHub 原始碼"
    url: "https://github.com/Sid-1996/PathofExile-Sid-GameTools_HealthMonitor"
    kind: repo
features:
  - title: "血量監控"
    detail: "F10 一鍵啟用血量監控，持續把血量變化顯示在畫面上，不用反覆開啟角色面板。"
  - title: "自動喝藥"
    detail: "血量低於門檻時自動補飲，不必在戰鬥中分神盯著血條。"
  - title: "快速取物"
    detail: "F6 一鍵取出倉庫常用通貨，省掉每次回城翻找的步驟。"
  - title: "全域暫停"
    detail: "F9 隨時切換暫停狀態，任何時刻都能立刻交回操作權。"
requirements:
  - "Windows 10 / 11（x64）"
  - "安裝版免 Python 環境；原始碼開發需 Python 3.13（uv 管理）"
  - "以系統管理員身分執行（若目標程式以管理員權限執行）"
install:
  - "下載 Sid.GameToolsHealthMonitor-win-Setup.exe（Velopack 安裝包，支援自動更新）"
  - "或下載 GameTools_HealthMonitor.zip 免安裝版本"
  - "啟動後依畫面提示設定熱鍵與門檻值"
notes:
  - "本工具僅讀取畫面並模擬輸入，不讀寫記憶體、不修改遊戲檔案。"
motif: "II"
screenshots: []
---

《流亡黯道 2》工具箱是本站目前版本最新的專案（v1.4.0，2026-11-05 釋出）。
它把戰鬥中最容易疲勞的三件事 —— 看血量、喝藥、回城翻倉庫 —— 交給工具處理，
玩家仍然保留走位與戰術判斷。

技術上採 Python 3.13 + PySide6 打造介面，OpenCV 負責畫面比對；
所有熱鍵與視窗位置都以視窗比例（0~1）儲存，因此在不同解析度下仍能對到位置。

> 安裝說明：以安裝版（Setup.exe）為主，內建 Velopack 自動更新，
> 不需要另外安裝 Python 或 AutoHotkey 環境。
