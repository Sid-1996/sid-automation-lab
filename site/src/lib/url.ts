// src/lib/url.ts —— 站台路徑工具
//
// GitHub Pages 的「專案站」會掛在 /<repo>/ 之下（此處為 /sid-automation-lab/），
// 因此所有站內連結與資產路徑都必須帶上 base 前綴。
// 若日後改用 Cloudflare Pages 自訂網域，只需在 build 時設定 SITE_BASE="/"，
// 這個 helper 會自動輸出根相對路徑，不需改動任何頁面。

const RAW = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

/** base 前綴（無尾斜線）；根部署時為空字串 */
export const BASE = RAW === '' ? '' : RAW;

/**
 * 把站內路徑轉成部署後可用的完整路徑。
 * 站外絕對網址、純錨點、mailto: 一律原樣輸出。
 */
export function u(path: string): string {
  if (!path) return `${BASE}/`;
  if (/^(https?:)?\/\//i.test(path)) return path;
  if (path.startsWith('#')) return path;
  if (path.startsWith('mailto:') || path.startsWith('tel:')) return path;
  return BASE + (path.startsWith('/') ? path : `/${path}`);
}
