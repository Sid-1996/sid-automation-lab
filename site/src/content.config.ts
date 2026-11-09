// src/content.config.ts
// Astro Content Collections —— 專案內容的唯一真實來源
// 所有欄位值皆來自正式站現況 + Phase 0 內容稽核（gh CLI 查證上游 release）
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    // 識別
    slug: z.string(),
    title: z.string(),
    shortTitle: z.string(),
    /** 排序權重：首頁與列表的呈現順序 */
    order: z.number(),
    /** 版本字串；無公開版本者留空字串（不虛構） */
    version: z.string(),
    releaseDate: z.string(),
    /** 授權性質 */
    license: z.enum(['open', 'commercial', 'external']),
    licenseLabel: z.string(),
    /** 技術棧標籤（英文/技術字串，mono 顯示） */
    stack: z.array(z.string()),
    /** 技術篩選用的正規化鍵（python / ahk / csharp / web） */
    techs: z.array(z.enum(['python', 'ahk', 'csharp', 'web'])),
    /** 需求分類，對應列表頁篩選 */
    category: z.enum(['battle', 'music', 'recoil', 'repeat', 'resource']),
    categoryLabel: z.string(),
    /** 一句話任務描述 */
    summary: z.string(),
    /** 詳細介紹（markdown 內文） */
    features: z.array(z.object({
      title: z.string(),
      detail: z.string(),
    })),
    /** 執行需求 */
    requirements: z.array(z.string()),
    /** 安裝與取得方式 */
    install: z.array(z.string()),
    /** 主要下載入口 */
    downloadUrl: z.string(),
    downloadLabel: z.string(),
    /** 其他入口（repo / 購買頁 / 線上示範） */
    links: z.array(z.object({
      label: z.string(),
      url: z.string(),
      kind: z.enum(['repo', 'purchase', 'demo', 'release']),
    })),
    /** 專案頁截圖（public/images 內的路徑） */
    screenshots: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string(),
      width: z.number(),
      height: z.number(),
    })),
    /** 無官方截圖時使用的版式識別字形 */
    motif: z.string(),
    /** 頁面上的重要註記（誠實聲明，例如已移除的功能） */
    notes: z.array(z.string()),
    /** 是否為商業項目（影響 CTA 樣式） */
    commercial: z.boolean(),
    /** 外部專站（不在本站提供下載） */
    external: z.boolean(),
  }),
});

export const collections = { projects };
