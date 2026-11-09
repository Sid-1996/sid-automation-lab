#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/make-og.py —— 產生 5 張頁型專屬 OG 圖（決策 Q10）

沿用專案既有慣例：Pillow + Noto Sans TC，1200x630。
配色取自 src/styles/tokens.css，與原型視覺完全一致。

輸出：public/images/og-{home,projects,detail,sponsor,license}.png
"""
import os
from PIL import Image, ImageDraw, ImageFont

# ---------- 設計 Token（對應 src/styles/tokens.css） ----------
W, H = 1200, 630
BG = "#0b0e12"
GRID = "#151b22"
LINE = "#232c37"
PANEL = "#141a21"
PANEL_2 = "#1a212a"
INK = "#e8edf2"
INK2 = "#9aa8b4"
INK3 = "#6b7885"
SIGNAL = "#4ae3b0"
AMBER = "#ffb454"

CJK = r"C:\Windows\Fonts\NotoSansTC-VF.ttf"
MONO = r"C:\Windows\Fonts\consola.ttf"
MONO_B = r"C:\Windows\Fonts\consolab.ttf"

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "images")


def cjk(size, bold=False):
    f = ImageFont.truetype(CJK, size)
    try:
        f.set_variation_by_name("Bold" if bold else "Regular")
    except Exception:
        pass
    return f


def mono(size, bold=False):
    return ImageFont.truetype(MONO_B if bold else MONO, size)


def tracked(d, xy, text, font, fill, spacing=0):
    """逐字繪製以加入字距（用於全大寫英文標籤）"""
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + spacing
    return x


def base(eyebrow, title_lines, subtitle, corner):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # 工程網格底紋
    for x in range(0, W + 1, 56):
        d.line([(x, 0), (x, H)], fill=GRID, width=1)
    for y in range(0, H + 1, 56):
        d.line([(0, y), (W, y)], fill=GRID, width=1)

    # 左上品牌 mark（12px 方框 + 內嵌實心方塊）
    d.rectangle([88, 66, 102, 80], outline=SIGNAL, width=1)
    d.rectangle([91, 69, 99, 77], fill=SIGNAL)
    tracked(d, (114, 62), "SID/AUTOMATION/LAB", mono(19, True), INK, 1.2)

    # 右上頁型標記
    w = d.textlength(corner, font=mono(16)) + 16 * len(corner)
    d.rectangle([1112 - w, 60, 1112, 88], outline=LINE, width=1)
    tracked(d, (1112 - w + 10, 66), corner, mono(16), INK3, 1.6)

    # 內文
    y = 208
    tracked(d, (88, y), eyebrow, mono(19, True), SIGNAL, 2.2)
    y += 44
    for line in title_lines:
        d.text((88, y), line, font=cjk(66, True), fill=INK)
        y += 84

    d.rectangle([88, y + 8, 88 + 88, y + 12], fill=SIGNAL)
    y += 40
    d.text((88, y), subtitle, font=cjk(25), fill=INK2)

    # 頁尾
    d.line([(88, 552), (1112, 552)], fill=LINE, width=1)
    tracked(d, (88, 574), "sid-1996.github.io/sid-automation-lab", mono(18), INK3, 0.6)

    return img, d


def panel(d, x0, y0, x1, y1, title):
    d.rectangle([x0, y0, x1, y1], fill=PANEL, outline=LINE, width=1)
    d.rectangle([x0, y0, x1, y0 + 34], fill=PANEL_2)
    d.line([(x0, y0 + 34), (x1, y0 + 34)], fill=LINE, width=1)
    tracked(d, (x0 + 14, y0 + 10), title, mono(14), INK3, 1.4)
    return y0 + 34


def waveform(d, x0, y0, w, h, pts, color):
    d.line([(x0, y0 + h / 2)] * 0, fill=color)
    coords = [(x0 + i * (w / (len(pts) - 1)), y0 + h / 2 - (v * h / 2)) for i, v in enumerate(pts)]
    d.line(coords, fill=color, width=2)


PAGES = {}


def page_home():
    img, d = base("PERSONAL AUTOMATION LAB", ["個人自動化", "學習實驗室"],
                  "圖像辨識與模擬輸入 · 六個公開專案", "HOME")
    px0, py0, px1, py1 = 720, 176, 1112, 500
    ty = panel(d, px0, py0, px1, py1, "CHANNELS / CAPABILITY MAP")
    rows = [
        ("CH 1 IMAGE RECOGNITION", [0, .6, -.3, .9, .2, -.5, .8, .1, .7, -.4], SIGNAL),
        ("CH 2 SIMULATED INPUT", [0, 0, .95, .95, 0, 0, .8, .8, 0, 0], SIGNAL),
        ("CH 3 PIXEL DETECT", [0, 0, 1, 1, 1, 0, 0, .45, .45, 0], SIGNAL),
        ("CH 4 BEAT DETECT", [0, .9, 0, .8, 0, 1, 0, .7, 0, .9], AMBER),
    ]
    y = ty + 22
    for name, pts, color in rows:
        tracked(d, (px0 + 16, y), name, mono(13), INK3, 0.8)
        waveform(d, px0 + 16, y + 22, px1 - px0 - 32, 26, pts, color)
        y += 62
    return img


def page_projects():
    img, d = base("MODULE INDEX", ["專案目錄"],
                  "分類 / 技術 / 關鍵字三重篩選 · 六個公開專案", "PROJECTS")
    px0, py0, px1, py1 = 720, 176, 1112, 500
    ty = panel(d, px0, py0, px1, py1, "CHANNEL ROWS")
    labels = ["流亡黯道 2 工具箱", "通用壓槍腳本", "深空之眼 半自動腳本",
              "棕色塵埃 2 音遊助手", "OCR Trigger Clicker", "鳴潮 素材計算器"]
    y = ty + 18
    for i, name in enumerate(labels):
        tracked(d, (px0 + 16, y + 6), "%02d" % (i + 1), mono(13), INK3, 0.8)
        d.text((px0 + 52, y), name, font=cjk(19), fill=INK)
        d.rectangle([px0 + 52, y + 30, px1 - 16, y + 31], fill=LINE)
        d.rectangle([px0 + 52, y + 30, px0 + 52 + 120 + i * 22, y + 31], fill=SIGNAL)
        y += 42
    return img


def page_detail():
    img, d = base("PROJECT DETAIL", ["專案詳細頁"],
                  "功能 · 執行需求 · 官方截圖 · 取得方式", "DETAIL")
    px0, py0, px1, py1 = 720, 176, 1112, 500
    ty = panel(d, px0, py0, px1, py1, "SPEC READOUT")
    cells = [("VERSION", "v1.2.0"), ("RELEASED", "2026-11-08"), ("LICENSE", "商業授權")]
    cw = (px1 - px0 - 32 - 16) // 3
    for i, (k, v) in enumerate(cells):
        x = px0 + 16 + i * (cw + 8)
        d.rectangle([x, ty + 20, x + cw, ty + 78], fill=PANEL_2, outline=LINE, width=1)
        tracked(d, (x + 10, ty + 30), k, mono(12), INK3, 1.2)
        d.text((x + 10, ty + 50), v, font=cjk(19), fill=INK)
    d.rectangle([px0 + 16, ty + 92, px1 - 16, ty + 150], fill=PANEL_2, outline=LINE, width=1)
    tracked(d, (px0 + 28, ty + 102), "STACK", mono(12), INK3, 1.2)
    d.text((px0 + 28, ty + 122), "python 3.13 / pyside6 / opencv", font=mono(17), fill=SIGNAL)
    d.rectangle([px0 + 16, ty + 164, px1 - 16, ty + 230], fill=PANEL, outline=LINE, width=1)
    for i in range(3):
        d.rectangle([px0 + 28, ty + 176 + i * 16, px0 + 28 + 200 - i * 40, ty + 184 + i * 16], fill=LINE)
    return img


def page_sponsor():
    img, d = base("SUPPORT THE PROJECT", ["贊助開發"],
                  "支持開源自動化工具持續維護 · 金額任意 · 非使用條件", "SPONSOR")
    px0, py0, px1, py1 = 720, 176, 1112, 500
    ty = panel(d, px0, py0, px1, py1, "CHANNELS")
    items = ["ECPay Support", "PayPal Small Support", "PayPal Project Support", "愛發電 AFDIAN"]
    y = ty + 20
    for name in items:
        d.rectangle([px0 + 16, y, px1 - 16, y + 46], fill=PANEL_2, outline=LINE, width=1)
        d.rectangle([px0 + 16, y, px0 + 19, y + 46], fill=SIGNAL)
        d.text((px0 + 34, y + 12), name, font=mono(17), fill=INK)
        tracked(d, (px1 - 96, y + 16), "$ open", mono(14), SIGNAL, 0.8)
        y += 58
    return img


def page_license():
    img, d = base("SID LICENSE CENTER", ["購買正式版授權"],
                  "一次性買斷 NT$ 500 · HWID 遠端啟用 · 單一主機綁定", "LICENSE")
    px0, py0, px1, py1 = 720, 176, 1112, 500
    ty = panel(d, px0, py0, px1, py1, "OFFER")
    d.text((px0 + 20, ty + 26), "NT$ 500", font=cjk(48, True), fill=SIGNAL)
    tracked(d, (px0 + 22, ty + 90), "ONETIME / PERPETUAL", mono(13), INK3, 1.2)
    # 授權序號讀出（刻意不做成 QR 圖樣，避免被誤認為可掃描的真實條碼）
    d.rectangle([px0 + 16, ty + 116, px0 + 176, ty + 216], fill=PANEL_2, outline=LINE, width=1)
    tracked(d, (px0 + 30, ty + 130), "HWID", mono(13), INK3, 1.6)
    d.text((px0 + 30, ty + 154), "A1B2-C3D4", font=mono(21), fill=AMBER)
    d.text((px0 + 30, ty + 182), "待提供", font=cjk(16), fill=INK3)
    d.text((px0 + 196, ty + 126), "遠端啟用授權", font=cjk(19), fill=INK)
    d.text((px0 + 196, ty + 156), "單一 HWID 綁定", font=cjk(19), fill=INK)
    d.text((px0 + 196, ty + 186), "遺失授權免費補發", font=cjk(19), fill=INK)
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [("home", page_home), ("projects", page_projects), ("detail", page_detail),
                     ("sponsor", page_sponsor), ("license", page_license)]:
        path = os.path.join(OUT, "og-%s.png" % name)
        fn().save(path, "PNG", optimize=True)
        print("wrote", path, os.path.getsize(path), "bytes")


if __name__ == "__main__":
    main()
