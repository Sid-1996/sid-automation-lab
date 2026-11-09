---
slug: sidallfps
title: "通用壓槍腳本（SidAllFPS）"
shortTitle: "通用壓槍腳本 SidAllFPS"
order: 2
version: "1.2.0"
releaseDate: "2026-11-08"
license: commercial
licenseLabel: "商業授權 · 不公開源碼"
stack: ["c#", "wpf", ".net 10 x64"]
techs: ["csharp"]
category: recoil
categoryLabel: "後座力補償"
summary: "FPS 後座力補償：自訂槍械壓槍數據、力道／間隔微調；14 天免費試用僅限 3 組槍械預設。"
commercial: true
external: false
downloadUrl: "https://github.com/Sid-1996/Sid-gun/releases/download/v1.2.0/SidAllFPS-v1.2.0.zip"
downloadLabel: "下載正式版 zip"
links:
  - label: "試用版 v1.2.0-trial"
    url: "https://github.com/Sid-1996/Sid-gun/releases/download/v1.2.0-trial/SidAllFPS.Trial-v1.2.0.zip"
    kind: release
  - label: "購買授權"
    url: "https://sid-1996.github.io/sid-automation-lab/sidpayfor.html"
    kind: purchase
features:
  - title: "自訂槍械壓槍數據"
    detail: "內建 9 組槍械預設槽位，每一組可分別設定名稱、力道與間隔；官方介面截圖中的「槍械管理」即為此功能。"
  - title: "力道 / 間隔微調"
    detail: "每組槍械可獨立微調力道與間隔數值，不必在射擊中反覆測試整套設定。"
  - title: "Fluent 深色 / 淺色主題"
    detail: "v1.2.0 起改用 Fluent 介面風格，深色與淺色主題皆可切換。"
  - title: "五大分頁與鍵盤導航"
    detail: "設定、槍械、選項、關於等分頁皆可完整用鍵盤操作。"
  - title: "自動更新檢查"
    detail: "啟動時檢查更新版本並提示下載。"
requirements:
  - "Windows 10 / 11（x64）"
  - ".NET 10 Desktop Runtime（x64）"
  - "解壓後以系統管理員身分執行"
install:
  - "試用：下載 SidAllFPS.Trial-v1.2.0.zip，解壓後執行 SidAllFPS.Trial.exe（14 天、僅限 3 組槍械預設）"
  - "正式版：下載 SidAllFPS-v1.2.0.zip，解壓後執行 SidAllFPS.Wpf.exe"
  - "兩者皆需以系統管理員身分執行，並安裝 .NET 10 Desktop Runtime (x64)"
notes:
  - "商業授權專案，不公開源碼；14 天試用版功能與正式版一致，但僅開放 3 組槍械預設。"
  - "逐遊戲相容性未公開，購買前建議先以試用版確認。"
motif: "III"
screenshots:
  - src: "/images/recoil-v120-basic-dark.png"
    alt: "SidAllFPS v1.2.0 主畫面官方截圖：深色介面與壓槍基本設定"
    caption: "官方截圖 · SidAllFPS v1.2.0 主畫面（現行版）"
    width: 960
    height: 1061
  - src: "/images/recoil-v120-weapon-dark.png"
    alt: "SidAllFPS v1.2.0 槍械管理畫面官方截圖：9 組槍械預設與力道間隔設定"
    caption: "官方截圖 · 槍械管理（9 組槍械預設槽位）"
    width: 960
    height: 641
  - src: "/images/recoil-v120-hotkeys-dark.png"
    alt: "SidAllFPS v1.2.0 熱鍵設定畫面官方截圖"
    caption: "官方截圖 · 熱鍵設定"
    width: 960
    height: 641
  - src: "/images/recoil-v120-help-dark.png"
    alt: "SidAllFPS v1.2.0 說明畫面官方截圖"
    caption: "官方截圖 · 使用說明"
    width: 960
    height: 641
  - src: "/images/recoil-v120-update-dark.png"
    alt: "SidAllFPS v1.2.0 更新畫面官方截圖"
    caption: "官方截圖 · 自動更新檢查"
    width: 960
    height: 641
---

SidAllFPS 是本站唯一的商業項目，v1.2.0 起已由 AutoHotkey 完全改寫為 C#（WPF）。
舊版 AHK 的設定檔格式實際沿用，因此從舊版升級的玩家的設定不會失效。

官方介面截圖中的「槍械管理」頁明確標示管理 9 組槍械預設，
每一組可獨立設定名稱、力道與間隔 —— 這是本頁面「自訂槍械數據」功能的實際來源。

取得方式分為試用版與正式版兩條路徑，購買授權在站內的購買頁完成。
