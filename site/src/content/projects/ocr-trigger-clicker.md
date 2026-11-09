---
slug: ocr-trigger-clicker
title: "OCR Trigger Clicker"
shortTitle: "OCR Trigger Clicker"
order: 5
version: "0.4.8"
releaseDate: "2026-10-24"
license: external
licenseLabel: "公開源碼 · AGPL-3.0 · 站外專站"
stack: ["python 3.13", "pyqt6", "rapidocr", "pynput", "frida"]
techs: ["python"]
category: repeat
categoryLabel: "重複作業自動化"
summary: "No-Code 觸發條件加點擊位置、視窗比例座標；免寫碼即可設定 OCR 觸發、圖片比對與數值加總。"
commercial: false
external: true
downloadUrl: "https://sid-1996.github.io/ocr-trigger-clicker/"
downloadLabel: "前往專站"
links:
  - label: "專站"
    url: "https://sid-1996.github.io/ocr-trigger-clicker/"
    kind: demo
  - label: "GitHub 原始碼"
    url: "https://github.com/Sid-1996/ocr-trigger-clicker"
    kind: repo
features:
  - title: "OCR 文字偵測"
    detail: "以 RapidOCR（繁中模型）辨識畫面文字，命中條件時觸發後續動作。"
  - title: "F9 錄製自動轉規則"
    detail: "按 F9 錄下點擊行為，自動轉換成可編輯的規則，不必手寫座標。"
  - title: "圖片比對"
    detail: "以模板比對判斷畫面上的圖形，是文字偵測之外的第二種判斷方式。"
  - title: "數值加總"
    detail: "可對辨識到的數值做加總與比較，再依結果觸發不同動作。"
  - title: "前景 / 後台 / 混合模式"
    detail: "三種輸入模式可選：前景 SendInput、背景注入，或兩者混合。"
requirements:
  - "Windows 10 / 11"
  - "Python 3.13（安裝版免安裝環境）"
  - "若目標程式以系統管理員權限執行，需以系統管理員身分啟動"
install:
  - "於專站或 Releases 下載 OCRTriggerClicker-win-Setup.exe（Velopack 安裝包，支援自動更新）"
  - "或下載 OCRTriggerClicker-win-Portable.zip 免安裝版本"
  - "首次啟動後可按 F9 錄製第一條規則"
notes:
  - "此工具已搬遷至獨立網站 https://sid-1996.github.io/ocr-trigger-clicker/ ，不在本站頁面內下載。"
  - "介面截圖為 v0.1.8 時期的版本；現行版本為 v0.4.8，介面已有差異。"
motif: "VI"
screenshots:
  - src: "/images/ocr-trigger-clicker-gui-main.png"
    alt: "OCR Trigger Clicker 桌面工具介面截圖：左側規則清單與右側步驟編輯面板"
    caption: "介面截圖（v0.1.8 時期；現行版為 v0.4.8）"
    width: 1920
    height: 1080
---

OCR Trigger Clicker 是六個專案中唯一住在獨立網站的一個，目前版本 v0.4.8。

它把「看到某段文字就做某件事」這類需求交給不需要寫程式的人：
按 F9 錄一次操作就會自動轉成規則，之後在介面上微調觸發條件與點擊位置即可。
規則支援多種步驟類型，涵蓋文字偵測、圖片比對、數值比較與加總、點擊、按鍵、
拖曳、滾輪、等待、規則跳轉與提示訊息等。

技術上以 Python 3.13 + PyQt6 打造介面，OCR 引擎為 RapidOCR（ONNX 執行時），
輸入端同時支援前景（pynput／SendInput）與後台（Frida）兩種路徑。
