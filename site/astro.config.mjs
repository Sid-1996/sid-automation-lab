// site/astro.config.mjs
// Sid Automation Lab 正式站 —— Astro 靜態輸出
//
// base：GitHub Pages 專案站掛在 /<repo>/ 之下，預設 '/sid-automation-lab/'。
// 若改用 Cloudflare Pages 自訂網域，建置時設定環境變數 SITE_BASE='/' 即可。
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://sid-1996.github.io/sid-automation-lab',
  base: process.env.SITE_BASE ?? '/sid-automation-lab/',
  trailingSlash: 'ignore',
  build: {
    // 輸出 /projects.html 與 /projects/sidallfps.html，而非 /projects/index.html
    // 以對齊既有公開 URL 風格
    format: 'file',
  },
  devToolbar: { enabled: false },
});
